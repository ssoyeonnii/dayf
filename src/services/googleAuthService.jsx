// Google account/db management on frontend (no backend)
// Requires Supabase client configured in src/components/supabaseClient.jsx

import { supabase } from "../components/supabaseClient.jsx";

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
    await supabase
      .from("Log_error")
      .insert({
        page_name: pageName,
        err_code: String(errCode),
        err_content: errContent,
        user_id: userId || null,
        regdate: new Date().toISOString(),
      });
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

  // 1) EMAIL_IS_USERID: googleEmail이 다른 Dayf 계정의 user_id로 존재하면 충돌
  const { data: emailUser, error: emailErr } = await supabase
    .from("work_users")
    .select("user_id, user_pw")
    .eq("user_id", googleEmail)
    .maybeSingle();

  if (emailErr) {
    throw new Error("DB_CHECK_FAILED: " + emailErr.message);
  }

  if (emailUser && emailUser.user_id !== currentUserId) {
    return { error: "EMAIL_IS_USERID", conflictUserId: googleEmail };
  }

  // 2) ALREADY_LINKED: 동일 google_sub가 다른 Dayf 계정에 연결되어 있는 경우
  const { data: subUser, error: subErr } = await supabase
    .from("work_users")
    .select("user_id")
    .eq("google_sub", googleSub)
    .maybeSingle();

  if (subErr) {
    throw new Error("DB_CHECK_FAILED: " + subErr.message);
  }

  if (subUser && subUser.user_id && subUser.user_id !== currentUserId) {
    return { error: "ALREADY_LINKED", message: "해당 Google 계정은 이미 다른 Dayf 계정에 연동되어 있습니다." };
  }

  // 3) Update current user with google info
  const { error: updateError } = await supabase
    .from("work_users")
    .update({ google_sub: googleSub, google_email: googleEmail })
    .eq("user_id", currentUserId);

  if (updateError) {
    throw new Error("DB_UPDATE_FAILED: " + updateError.message);
  }

  return { user: { email: googleEmail, name: userinfo.name, google_sub: googleSub }, google_email: googleEmail };
}

// Google social login (no existing Dayf session)
async function signInWithGoogle(accessToken) {
  const userinfo = await fetchGoogleUserInfo(accessToken);
  const googleEmail = userinfo.email;
  const googleSub = userinfo.sub;

  // DAYF_ACCOUNT_EXISTS: 동일 이메일로 Dayf 자체 가입이 이미 존재하고 아직 google_sub 연동이 없는 경우
  const { data: dayfUser, error: dayfErr } = await supabase
    .from("work_users")
    .select("user_id, google_sub, user_pw")
    .eq("user_id", googleEmail)
    .maybeSingle();

  if (dayfErr) {
    throw new Error("DB_CHECK_FAILED: " + dayfErr.message);
  }

  if (dayfUser && dayfUser.user_pw && !dayfUser.google_sub) {
    return { error: "DAYF_ACCOUNT_EXISTS", message: "해당 이메일로 이미 Dayf 계정이 존재합니다. 일반 로그인을 이용해주세요." };
  }

  // ALREADY_LINKED: 동일 sub가 다른 user_id에 연결되어 있는 경우 방지
  const { data: subUser, error: subErr } = await supabase
    .from("work_users")
    .select("user_id")
    .eq("google_sub", googleSub)
    .maybeSingle();
  if (subErr) {
    throw new Error("DB_CHECK_FAILED: " + subErr.message);
  }
  if (subUser && subUser.user_id && subUser.user_id !== googleEmail) {
    return { error: "ALREADY_LINKED", message: "해당 Google 계정은 이미 다른 Dayf 계정에 연동되어 있습니다." };
  }

  // If user row exists, update; else insert
  if (dayfUser) {
    const { error: updateErr } = await supabase
      .from("work_users")
      .update({ google_sub: googleSub, google_email: googleEmail, user_name: userinfo.name })
      .eq("user_id", googleEmail);
    if (updateErr) {
      throw new Error("DB_UPDATE_FAILED: " + updateErr.message);
    }
  } else {
    const { error: insertErr } = await supabase
      .from("work_users")
      .insert([{ user_id: googleEmail, user_name: userinfo.name, google_sub: googleSub, google_email: googleEmail }]);
    if (insertErr) {
      throw new Error("DB_INSERT_FAILED: " + insertErr.message);
    }
  }

  return { user: { email: googleEmail, name: userinfo.name, google_sub: googleSub } };
}

async function deleteAccount(userId) {
  const { error: shiftsError } = await supabase.from("work_user_shifts").delete().eq("user_id", userId);
  if (shiftsError) return { success: false, error: "Failed to delete shifts" };

  const { error: userError } = await supabase.from("work_users").delete().eq("user_id", userId);
  if (userError) return { success: false, error: "Failed to delete user" };

  return { success: true };
}

// Unlink Google from existing Dayf account
async function unlinkGoogleFromUser(userId) {
  const { error } = await supabase
    .from("work_users")
    .update({ google_sub: null, google_email: null})
    .eq("user_id", userId);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
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


