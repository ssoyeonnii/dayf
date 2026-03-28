// Google account/db management via Edge Function

import { callAppApi } from "./appApi.js";
import { encryptToken } from "../utils/encryption.js";

async function fetchGoogleUserInfo(accessToken) {
  const resp = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Google userinfo failed: ${text || resp.status}`);
  }
  // { sub, email, name, picture, ... }
  return await resp.json();
}

async function saveErrorLog(pageName, errCode, errContent, userId) {
  try {
    await callAppApi(
      "log_error",
      {
        page_name: pageName,
        err_code: String(errCode),
        err_content: errContent,
        user_id: userId || null,
        regdate: new Date().toISOString(),
      },
      { auth: false }
    );
  } catch (e) {
    // Fallback: console only
    console.error("Error log save failed:", e);
  }
}

// Link Google to existing Dayf account (currentUserId)
async function linkGoogleToCurrentUser(currentUserId, accessToken) {
  const userinfo = await fetchGoogleUserInfo(accessToken);
  const googleEmail = userinfo.email;
  const googleSub = userinfo.sub;

  const encryptedToken = encryptToken(accessToken);
  try {
    const data = await callAppApi("google_link_current_user", {
      current_user_id: currentUserId,
      google_email: googleEmail,
      google_sub: googleSub,
      google_name: userinfo.name,
      encrypted_access_token: encryptedToken,
    });
    return data;
  } catch (error) {
    if (error?.message === "EMAIL_IS_USERID") {
      return {
        error: "EMAIL_IS_USERID",
        conflictUserId: googleEmail,
        message:
          "선택한 Google 계정 이메일이 이미 다른 Dayf 계정 ID로 사용 중입니다.",
      };
    }
    if (error?.message === "ALREADY_LINKED") {
      return { error: "ALREADY_LINKED", message: "해당 Google 계정은 이미 다른 Dayf 계정에 연동되어 있습니다." };
    }
    throw error;
  }
}

// Google social login (no existing Dayf session)
async function signInWithGoogle(accessToken) {
  const userinfo = await fetchGoogleUserInfo(accessToken);
  const googleEmail = userinfo.email;
  const googleSub = userinfo.sub;

  try {
    const data = await callAppApi(
      "google_sign_in",
      {
        google_email: googleEmail,
        google_sub: googleSub,
        google_name: userinfo.name,
        encrypted_access_token: encryptToken(accessToken),
      },
      { auth: false }
    );
    return data;
  } catch (error) {
    if (error?.message === "ALREADY_LINKED") {
      return { error: "ALREADY_LINKED", message: "해당 Google 계정은 이미 다른 Dayf 계정에 연동되어 있습니다." };
    }
    throw error;
  }
}

async function deleteAccount(userId) {
  try {
    await callAppApi("user_delete", { user_id: userId });
    return { success: true };
  } catch (error) {
    return { success: false, error: error?.message || "Failed to delete user" };
  }
}

async function unlinkGoogleFromUser(userId) {
  try {
    await callAppApi("google_unlink", { user_id: userId });
    return { success: true };
  } catch (error) {
    return { success: false, error: error?.message || "UNLINK_FAILED" };
  }
}

export const GoogleAccountManage = {
  fetchGoogleUserInfo,
  linkGoogleToCurrentUser,
  signInWithGoogle,
  deleteAccount,
  unlinkGoogleFromUser,
  saveErrorLog,
};

export default GoogleAccountManage;
