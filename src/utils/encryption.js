import CryptoJS from 'crypto-js';

// 환경 변수에서 암호화 키 가져오기
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  console.error('VITE_ENCRYPTION_KEY is not defined in .env file');
}

/**
 * 문자열을 AES 암호화
 * @param {string} text - 암호화할 평문
 * @returns {string} - 암호화된 문자열
 */
export function encryptToken(text) {
  if (!text) return text;
  
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt token');
  }
}

/**
 * AES 암호화된 문자열을 복호화
 * @param {string} encryptedText - 암호화된 문자열
 * @returns {string} - 복호화된 평문
 */
export function decryptToken(encryptedText) {
  if (!encryptedText) return encryptedText;
  
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      // 복호화 실패 시 평문일 가능성이 있음 (마이그레이션 기간 호환성)
      console.warn('Decryption resulted in empty string, returning original value');
      return encryptedText;
    }
    
    return decrypted;
  } catch (error) {
    // 복호화 실패 시 평문일 가능성이 있음 (기존 DB 데이터 호환성)
    console.warn('Decryption failed, assuming plain text token:', error.message);
    return encryptedText;
  }
}
