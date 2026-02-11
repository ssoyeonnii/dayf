import { supabase } from '../components/supabaseClient.jsx';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  isTokenExpiringSoon,
  refreshAccessToken,
  decodeToken,
} from './jwtService.js';

const TOKEN_KEYS = {
  ACCESS: 'dayf_jwt',
  REFRESH: 'dayf_refresh_token',
};

/**
 * 로그인 시 토큰 발급 및 저장
 * @param {Object} user - 사용자 정보 { user_id, user_name }
 * @param {string} loginType - 로그인 타입 ('google' | 'normal')
 * @returns {Promise<Object>} { accessToken, refreshToken }
 */
export async function issueTokensOnLogin(user, loginType) {
  const userInfo = {
    user_id: user.user_id,
    user_name: user.user_name,
    login_type: loginType,
  };

  // 토큰 생성
  const accessToken = await generateAccessToken(userInfo);
  const refreshToken = await generateRefreshToken(user.user_id);

  // Access Token만 SessionStorage에 저장
  sessionStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
  // Refresh Token은 DB에만 저장 (sessionStorage에는 저장하지 않음 - 보안 강화)

  // DB에 저장
  await saveTokensToDB(user.user_id, accessToken, refreshToken);

  return { accessToken, refreshToken };
}

/**
 * DB에 토큰 저장
 * @param {string} userId - 사용자 ID
 * @param {string} accessToken - Access Token
 * @param {string} refreshToken - Refresh Token
 */
async function saveTokensToDB(userId, accessToken, refreshToken) {
  const { error } = await supabase
    .from('work_users')
    .update({
      dayf_access_token: accessToken,
      dayf_refresh_token: refreshToken,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to save tokens to DB:', error);
  }
}

/**
 * 현재 Access Token 가져오기 (필요시 자동 갱신)
 * @returns {Promise<string|null>} 유효한 Access Token 또는 null
 */
export async function getValidAccessToken() {
  const accessToken = sessionStorage.getItem(TOKEN_KEYS.ACCESS);

  if (!accessToken) {
    return null;
  }

  // Access Token이 곧 만료되는지 확인
  if (isTokenExpiringSoon(accessToken)) {
    try {
      // Access Token을 복호화하여 user_id 추출
      const userInfo = await getUserInfoFromValidToken();
      if (!userInfo || !userInfo.user_id) {
        console.error('Failed to get user info from access token');
        return null;
      }

      // DB에서 Refresh Token 가져오기
      const { data, error } = await supabase
        .from('work_users')
        .select('dayf_refresh_token')
        .eq('user_id', userInfo.user_id)
        .single();

      if (error || !data?.dayf_refresh_token) {
        console.error('Failed to get refresh token from DB:', error);
        return null;
      }

      // Refresh Token으로 새 Access Token 발급
      const newAccessToken = await refreshAccessToken(
        data.dayf_refresh_token,
        userInfo
      );

      // 새 Access Token 저장
      sessionStorage.setItem(TOKEN_KEYS.ACCESS, newAccessToken);
      await saveTokensToDB(userInfo.user_id, newAccessToken, data.dayf_refresh_token);

      return newAccessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  return accessToken;
}

/**
 * JWT 검증 후 사용자 정보 가져오기
 * @returns {Promise<Object|null>} { user_id, user_name, login_type } 또는 null
 */
export async function getUserInfoFromValidToken() {
  const accessToken = sessionStorage.getItem(TOKEN_KEYS.ACCESS);
  if (!accessToken) return null;

  const result = await verifyToken(accessToken);
  if (!result.valid || !result.payload?.user_id) {
    return null;
  }

  return {
    user_id: result.payload.user_id,
    user_name: result.payload.user_name,
    login_type: result.payload.login_type || 'normal',
  };
}

function getUserInfoFromTokenPayload(accessToken) {
  if (!accessToken) return null;
  const payload = decodeToken(accessToken);
  if (!payload || !payload.user_id) return null;
  return {
    user_id: payload.user_id,
    user_name: payload.user_name,
    login_type: payload.login_type || 'normal',
  };
}

/**
 * SessionStorage에서 사용자 정보 가져오기 (JWT 우선, fallback 지원)
 * @returns {Object} 사용자 정보
 */
function getUserInfoFromSession() {
  // JWT 토큰에서 정보 가져오기 (우선)
  const tokenInfo = getUserInfoFromTokenPayload(
    sessionStorage.getItem(TOKEN_KEYS.ACCESS)
  );
  if (tokenInfo) {
    return tokenInfo;
  }
  
  // Fallback: 기존 sessionStorage (마이그레이션 기간용)
  return {
    user_id: sessionStorage.getItem('userId'),
    user_name: sessionStorage.getItem('userName'),
    login_type: sessionStorage.getItem('googleuser') === '1' ? 'google' : 'normal',
  };
}

/**
 * 토큰 유효성 검사
 * @returns {Promise<Object>} { valid: boolean, reason?: string, needsRefresh?: boolean }
 */
export async function validateCurrentTokens() {
  const accessToken = sessionStorage.getItem(TOKEN_KEYS.ACCESS);

  if (!accessToken) {
    return { valid: false, reason: 'NO_TOKENS' };
  }

  // Access Token 검증
  const accessResult = await verifyToken(accessToken);
  if (accessResult.valid) {
    return { valid: true };
  }

  // Access Token 만료 시, Access Token을 복호화하여 user_id 추출 후 DB에서 Refresh Token 확인
  const userInfo = getUserInfoFromTokenPayload(accessToken);
  if (!userInfo || !userInfo.user_id) {
    return { valid: false, reason: 'NO_USER_INFO' };
  }

  // DB에서 Refresh Token 가져오기
  const { data, error } = await supabase
    .from('work_users')
    .select('dayf_refresh_token')
    .eq('user_id', userInfo.user_id)
    .single();

  if (error || !data?.dayf_refresh_token) {
    return { valid: false, reason: 'NO_REFRESH_TOKEN' };
  }

  // Refresh Token 검증
  const refreshResult = await verifyToken(data.dayf_refresh_token);
  if (refreshResult.valid) {
    return { valid: true, needsRefresh: true };
  }

  return { valid: false, reason: 'TOKENS_EXPIRED' };
}

/**
 * 로그아웃 시 토큰 정리
 * @param {string} userId - 사용자 ID
 */
export async function clearTokensOnLogout(userId) {
  // SessionStorage에서 Access Token만 제거 (Refresh Token은 저장하지 않으므로 제거 불필요)
  sessionStorage.removeItem(TOKEN_KEYS.ACCESS);

  // DB에서 토큰 제거
  if (userId) {
    const { error } = await supabase
      .from('work_users')
      .update({
        dayf_access_token: null,
        dayf_refresh_token: null,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to clear tokens from DB:', error);
    }
  }
}

/**
 * 자동 로그인 시도 (페이지 새로고침 시)
 * @returns {Promise<Object>} { success: boolean, reason?: string }
 */
export async function attemptAutoLogin() {
  const validation = await validateCurrentTokens();

  if (!validation.valid) {
    const userInfo = getUserInfoFromTokenPayload(
      sessionStorage.getItem(TOKEN_KEYS.ACCESS)
    );
    await clearTokensOnLogout(userInfo?.user_id || null);
    return { success: false, reason: validation.reason };
  }

  if (validation.needsRefresh) {
    const newAccessToken = await getValidAccessToken();
    if (!newAccessToken) {
      const userInfo = getUserInfoFromTokenPayload(
        sessionStorage.getItem(TOKEN_KEYS.ACCESS)
      );
      await clearTokensOnLogout(userInfo?.user_id || null);
      return { success: false, reason: 'REFRESH_FAILED' };
    }
  }

  return { success: true };
}

/**
 * 현재 저장된 토큰 정보 가져오기
 * @returns {Object} { accessToken, refreshToken }
 */
export function getCurrentTokens() {
  return {
    accessToken: sessionStorage.getItem(TOKEN_KEYS.ACCESS),
    // Refresh Token은 sessionStorage에 저장하지 않으므로 반환하지 않음
  };
}
