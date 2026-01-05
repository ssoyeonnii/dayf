import * as jose from 'jose';

// 토큰 서명용 시크릿 키 (프론트엔드용 - 추후 백엔드 이전 시 변경)
const SECRET_KEY = new TextEncoder().encode(
  import.meta.env.VITE_JWT_SECRET || 'dayf-temp-secret-key-change-in-production'
);

const ACCESS_TOKEN_EXPIRY = '1h';   // 1시간
const REFRESH_TOKEN_EXPIRY = '14d'; // 14일

/**
 * Access Token 생성
 * @param {Object} user - 사용자 정보 { user_id, user_name, login_type }
 * @returns {Promise<string>} JWT Access Token
 */
export async function generateAccessToken(user) {
  const token = await new jose.SignJWT({
    user_id: user.user_id,
    user_name: user.user_name,
    login_type: user.login_type, // 'google' | 'normal'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(SECRET_KEY);

  return token;
}

/**
 * Refresh Token 생성
 * @param {string} userId - 사용자 ID
 * @returns {Promise<string>} JWT Refresh Token
 */
export async function generateRefreshToken(userId) {
  const token = await new jose.SignJWT({
    user_id: userId,
    token_type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(SECRET_KEY);

  return token;
}

/**
 * 토큰 검증
 * @param {string} token - JWT 토큰
 * @returns {Promise<Object>} { valid: boolean, payload?: Object, error?: string }
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jose.jwtVerify(token, SECRET_KEY);
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * 토큰 만료 여부 확인 (만료 5분 전부터 갱신 대상)
 * @param {string} token - JWT 토큰
 * @returns {boolean} 갱신 필요 여부
 */
export function isTokenExpiringSoon(token) {
  try {
    const payload = jose.decodeJwt(token);
    const now = Math.floor(Date.now() / 1000);
    const bufferTime = 5 * 60; // 5분
    return payload.exp - now < bufferTime;
  } catch {
    return true;
  }
}

/**
 * Access Token 갱신 (Refresh Token 사용)
 * @param {string} refreshToken - Refresh Token
 * @param {Object} userInfo - 사용자 정보
 * @returns {Promise<string>} 새 Access Token
 */
export async function refreshAccessToken(refreshToken, userInfo) {
  const result = await verifyToken(refreshToken);

  if (!result.valid) {
    throw new Error('Invalid refresh token');
  }

  if (result.payload.token_type !== 'refresh') {
    throw new Error('Invalid token type');
  }

  // 새 Access Token 발급
  const newAccessToken = await generateAccessToken(userInfo);
  return newAccessToken;
}

/**
 * 토큰 페이로드 디코딩 (검증 없이)
 * @param {string} token - JWT 토큰
 * @returns {Object|null} 디코딩된 페이로드
 */
export function decodeToken(token) {
  try {
    return jose.decodeJwt(token);
  } catch {
    return null;
  }
}
