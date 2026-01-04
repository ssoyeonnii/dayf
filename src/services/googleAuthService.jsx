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

  // currentUserId → 해당 유저 row 조회해서 num 가져오기
  const { data: currentUser, error: currentUserErr } = await supabase
    .from("work_users")
    .select("id, user_id")
    .eq("user_id", currentUserId)
    .maybeSingle();

  if (currentUserErr || !currentUser) {
    throw new Error("CURRENT_USER_NOT_FOUND");
  }

  const currentUserNum = currentUser.id;

  // 1) EMAIL_IS_USERID: googleEmail이 다른 Dayf 계정의 user_id로 존재하면 충돌
  const { data: emailUser, error: emailErr } = await supabase
    .from("work_users")
    .select("id, user_id, user_pw")
    .eq("user_id", googleEmail)
    .maybeSingle();

  if (emailErr) {
    throw new Error("DB_CHECK_FAILED: " + emailErr.message);
  }

  if (emailUser && emailUser.user_id !== currentUserId) {
    return { error: "EMAIL_IS_USERID", conflictUserId: googleEmail };
  }

  // 2) ALREADY_LINKED: social_login_users에서 동일 google sub가 다른 user_id(num)에 연결된 경우
  const { data: socialLink, error: socialErr } = await supabase
  .from("social_login_users")
  .select("user_id")        // 여기 user_id = work_users.id
  .eq("provider", "google")
  .eq("provider_user_id", googleSub)
  .maybeSingle();

  if (socialErr) {
  throw new Error("DB_CHECK_FAILED: " + socialErr.message);
  }

  if (socialLink && socialLink.user_id !== currentUserNum) {
  return { error: "ALREADY_LINKED", message: "해당 Google 계정은 이미 다른 Dayf 계정에 연동되어 있습니다." };
  }

  // 3) social_login_users에 구글 연동 정보 upsert
  const { data: existingLink } = await supabase
  .from("social_login_users")
  .select("user_id")
  .eq("user_id", currentUserNum)
  .eq("provider", "google")
  .maybeSingle();

  if (existingLink) {
  // 이미 row 있으면 provider_user_id와 토큰 최신 값으로 업데이트
  const { error: updateSocialErr } = await supabase
    .from("social_login_users")
    .update({
      provider_user_id: googleSub,
      provider_access_token: accessToken,
      provider_refresh_token: null  // implicit flow에서는 refresh_token 미제공
    })
    .eq("user_id", currentUserNum)
    .eq("provider", "google");

    if (updateSocialErr) {
      throw new Error("DB_UPDATE_FAILED: " + updateSocialErr.message);
    }
  } else {
  // 없으면 새로 insert
  const { error: insertSocialErr } = await supabase
    .from("social_login_users")
    .insert({
      user_id: currentUserNum,   // work_users.id
      provider: "google",
      provider_user_id: googleSub,
      provider_access_token: accessToken,
      provider_refresh_token: null  // implicit flow에서는 refresh_token 미제공
    });

    if (insertSocialErr) {
      throw new Error("DB_INSERT_FAILED: " + insertSocialErr.message);
    }
  }
  return { user: { email: googleEmail, name: userinfo.name } };
}

// Google social login (no existing Dayf session)
async function signInWithGoogle(accessToken) {
  const userinfo = await fetchGoogleUserInfo(accessToken);
  const googleEmail = userinfo.email;
  const googleSub = userinfo.sub;

  // DAYF_ACCOUNT_EXISTS: 동일 이메일로 Dayf 자체 가입이 이미 존재하고 아직 구글 연동이 없는 경우
  const { data: dayfUser, error: dayfErr } = await supabase
  .from("work_users")
  .select("id, user_id, user_pw")
  .eq("user_id", googleEmail)
  .maybeSingle();

  if (dayfErr) {
    throw new Error("DB_CHECK_FAILED: " + dayfErr.message);
  }

  // ALREADY_LINKED: social_login_users에서 동일 sub가 다른 user_id(id)에 연결된 경우 방지
  const { data: existingLink, error: socialErr } = await supabase
  .from("social_login_users")
  .select("user_id")
  .eq("provider", "google")
  .eq("provider_user_id", googleSub)
  .maybeSingle();

  // dayfUser가 있는 경우: 그 id과 다르면 다른 계정에 연동된 것
  if (socialErr) {
    throw new Error("DB_CHECK_FAILED: " + socialErr.message);
  }
  
// ALREADY_LINKED: social_login_users에서 동일 sub가 다른 user_id(id)에 연결되어 있는 경우 방지
if (existingLink && (!dayfUser || existingLink.user_id !== dayfUser.id)) {
    return { error: "ALREADY_LINKED", message: "해당 Google 계정은 이미 다른 Dayf 계정에 연동되어 있습니다." };
  }

  // work_users에 구글 연동 정보 upsert
  let userNum;

  if (dayfUser) {
    userNum = dayfUser.id;

    const { error: updateErr } = await supabase
      .from("work_users")
      .update({ user_name: userinfo.name })
      .eq("user_id", googleEmail);

    if (updateErr) {
      throw new Error("DB_UPDATE_FAILED: " + updateErr.message);
    }
  } else {
    const { data: inserted, error: insertErr } = await supabase
      .from("work_users")
      .insert([{ user_id: googleEmail, user_name: userinfo.name }])
      .select("id")   // 방금 insert된 row의 id 가져오기
      .single();

    if (insertErr) {
      throw new Error("DB_INSERT_FAILED: " + insertErr.message);
    }

    userNum = inserted.id;
  }

  // social_login_users에 google 연동 정보 insert/upsert
  const { data: existingLink2 } = await supabase
  .from("social_login_users")
  .select("user_id")
  .eq("user_id", userNum)
  .eq("provider", "google")
  .maybeSingle();

  if (existingLink2) {
  const { error: updateSocialErr } = await supabase
    .from("social_login_users")
    .update({
      provider_user_id: googleSub,
      provider_access_token: accessToken,
      provider_refresh_token: null  // implicit flow에서는 refresh_token 미제공
    })
    .eq("user_id", userNum)
    .eq("provider", "google");

    if (updateSocialErr) {
      throw new Error("DB_UPDATE_FAILED: " + updateSocialErr.message);
    }
  } else {
  const { error: insertSocialErr } = await supabase
    .from("social_login_users")
    .insert({
      user_id: userNum,
      provider: "google",
      provider_user_id: googleSub,
      provider_access_token: accessToken,
      provider_refresh_token: null  // implicit flow에서는 refresh_token 미제공
    });

    if (insertSocialErr) {
      throw new Error("DB_INSERT_FAILED: " + insertSocialErr.message);
    }
  }
  

  return { user: { email: googleEmail, name: userinfo.name } };
}

async function deleteAccount(userId) {
  const { error: shiftsError } = await supabase.from("work_user_shifts").delete().eq("user_id", userId);
  if (shiftsError) return { success: false, error: "Failed to delete shifts" };

  const { error: userError } = await supabase.from("work_users").delete().eq("user_id", userId);
  if (userError) return { success: false, error: "Failed to delete user" };

  return { success: true };
}

async function unlinkGoogleFromUser(userId) {
  // 1) userId → id 조회
  const { data: user, error: userErr } = await supabase
    .from("work_users")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (userErr || !user) {
    return { success: false, error: "USER_NOT_FOUND" };
  }

  // 2) social_login_users 에서 provider='google' 연동 삭제
  const { error: socialErr } = await supabase
    .from("social_login_users")
    .delete()
    .eq("user_id", user.id)
    .eq("provider", "google");

  if (socialErr) {
    return { success: false, error: socialErr.message };
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


