import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";
import { verify } from "https://deno.land/x/djwt@v2.8/mod.ts";

type JsonRecord = Record<string, unknown>;

const SUPABASE_URL =
  Deno.env.get("SUPABASE_URL") || Deno.env.get("EDGE_SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("EDGE_SUPABASE_SERVICE_ROLE_KEY");
const DAYF_JWT_SECRET = Deno.env.get("DAYF_JWT_SECRET");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const encoder = new TextEncoder();
const jwtKeyPromise = DAYF_JWT_SECRET
  ? crypto.subtle.importKey(
      "raw",
      encoder.encode(DAYF_JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    )
  : null;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-dayf-jwt",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function hashPassword(value: string) {
  return new Promise<string>((resolve, reject) => {
    bcrypt.hash(value, 10, (err: Error | null, hash: string) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });
}

function verifyPassword(value: string, hashed: string) {
  return new Promise<boolean>((resolve, reject) => {
    bcrypt.compare(value, hashed, (err: Error | null, same: boolean) => {
      if (err) reject(err);
      else resolve(same);
    });
  });
}

function isBcryptHash(value: string) {
  return /^\$2[aby]\$/.test(value);
}

function jsonResponse(body: JsonRecord, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

async function requireAuth(req: Request) {
  if (!DAYF_JWT_SECRET || !jwtKeyPromise) {
    throw new Error("DAYF_JWT_SECRET is not set");
  }

  const token = req.headers.get("x-dayf-jwt") || "";

  if (!token) {
    return { error: "NO_AUTH" };
  }

  try {
    const key = await jwtKeyPromise;
    const payload = await verify(token, key);
    return { payload };
  } catch {
    return { error: "INVALID_TOKEN" };
  }
}

function ensureUserMatch(payload: JsonRecord | null, userId?: string) {
  if (!payload || typeof payload.user_id !== "string") return false;
  if (!userId) return false;
  return payload.user_id === userId;
}

function isLikelyEmail(value: string | null | undefined) {
  if (!value) return false;
  return value.includes("@");
}

async function fetchGoogleLink(userIdNum: number) {
  const { data, error } = await supabase
    .from("social_login_users")
    .select("provider_user_id, provider_user_name")
    .eq("user_id", userIdNum)
    .eq("provider", "google")
    .maybeSingle();

  if (error) return { error };
  return { data };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "METHOD_NOT_ALLOWED" }, 405);
  }

  let body: { action?: string; payload?: JsonRecord };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "INVALID_JSON" }, 400);
  }

  const action = body.action;
  const payload = body.payload || {};

  if (!action) {
    return jsonResponse({ error: "NO_ACTION" }, 400);
  }

  try {
    switch (action) {
      case "user_duplicate_check": {
        const userId = String(payload.user_id || "").trim();
        if (!userId) return jsonResponse({ error: "USER_ID_REQUIRED" }, 400);

        const { data, error } = await supabase
          .from("work_users")
          .select("id, user_id")
          .eq("user_id", userId);

        if (error) return jsonResponse({ error: error.message }, 500);

        const row = data?.[0];
        let googleSub: string | null = null;
        if (row?.id) {
          const link = await fetchGoogleLink(row.id);
          if (link.error) return jsonResponse({ error: link.error.message }, 500);
          googleSub = link.data?.provider_user_id ?? null;
        }

        return jsonResponse({
          data: {
            exists: (data?.length || 0) > 0,
            google_sub: googleSub,
            google_email: isLikelyEmail(row?.user_id) ? row?.user_id : null,
          },
        });
      }
      case "user_signup": {
        const userId = String(payload.user_id || "").trim();
        const userName = String(payload.user_name || "").trim();
        const userPw = String(payload.user_pw || "");

        if (!userId || !userName || !userPw) {
          return jsonResponse({ error: "REQUIRED_FIELDS" }, 400);
        }

        const { data: existing, error: existErr } = await supabase
          .from("work_users")
          .select("id, user_id")
          .eq("user_id", userId);

        if (existErr) return jsonResponse({ error: existErr.message }, 500);
        if (existing?.length) {
          let googleSub: string | null = null;
          const row = existing[0];
          if (row?.id) {
            const link = await fetchGoogleLink(row.id);
            if (link.error) return jsonResponse({ error: link.error.message }, 500);
            googleSub = link.data?.provider_user_id ?? null;
          }
          return jsonResponse({
            error: "DUPLICATE_USER",
            google_sub: googleSub,
          }, 409);
        }

        const hashedPw = await hashPassword(userPw);

        const { error: insertErr } = await supabase
          .from("work_users")
          .insert({
            user_id: userId,
            user_name: userName,
            user_pw: hashedPw,
          });

        if (insertErr) return jsonResponse({ error: insertErr.message }, 500);

        return jsonResponse({ data: { user_id: userId, user_name: userName } });
      }
      case "user_login": {
        const userId = String(payload.user_id || "").trim();
        const userPw = String(payload.user_pw || "");

        if (!userId || !userPw) {
          return jsonResponse({ error: "REQUIRED_FIELDS" }, 400);
        }

        const { data, error } = await supabase
          .from("work_users")
          .select("id, user_id, user_name, user_pw")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) return jsonResponse({ error: error.message }, 500);
        if (!data) return jsonResponse({ error: "NOT_FOUND" }, 404);

        if (!data.user_pw && data.id) {
          const link = await fetchGoogleLink(data.id);
          if (link.error) return jsonResponse({ error: link.error.message }, 500);
          if (link.data?.provider_user_id) {
            return jsonResponse({ error: "GOOGLE_ACCOUNT" }, 409);
          }
        }

        if (!data.user_pw) {
          return jsonResponse({ error: "GOOGLE_ACCOUNT" }, 409);
        }

        const storedPw = String(data.user_pw || "").trim();
        const normalizedPw = String(userPw || "").trim();
        let ok = false;
        if (storedPw && normalizedPw) {
          if (isBcryptHash(storedPw)) {
            try {
              ok = await verifyPassword(normalizedPw, storedPw);
            } catch {
              ok = bcrypt.compareSync(normalizedPw, storedPw);
            }
          } else {
            ok = storedPw === normalizedPw;
            if (ok) {
              const newHash = await hashPassword(normalizedPw);
              await supabase
                .from("work_users")
                .update({ user_pw: newHash })
                .eq("user_id", userId);
            }
          }
        }
        if (!ok) return jsonResponse({ error: "INVALID_PASSWORD" }, 401);

        let googleSub: string | null = null;
        if (data.id) {
          const link = await fetchGoogleLink(data.id);
          if (link.error) return jsonResponse({ error: link.error.message }, 500);
          googleSub = link.data?.provider_user_id ?? null;
        }

        return jsonResponse({
          data: {
            user_id: data.user_id,
            user_name: data.user_name,
            google_sub: googleSub,
            google_email: isLikelyEmail(data.user_id) ? data.user_id : null,
          },
        });
      }
      case "user_verify_password": {
        const auth = await requireAuth(req);
        if (auth.error) return jsonResponse({ error: auth.error }, 401);

        const userId = String(payload.user_id || "").trim();
        const userPw = String(payload.user_pw || "");
        if (!ensureUserMatch(auth.payload as JsonRecord, userId)) {
          return jsonResponse({ error: "FORBIDDEN" }, 403);
        }

        const { data, error } = await supabase
          .from("work_users")
          .select("user_pw")
          .eq("user_id", userId)
          .single();

        if (error) return jsonResponse({ error: error.message }, 500);
        const storedPw = String(data.user_pw || "").trim();
        const normalizedPw = String(userPw || "").trim();
        let ok = false;
        if (storedPw && normalizedPw) {
          if (isBcryptHash(storedPw)) {
            try {
              ok = await verifyPassword(normalizedPw, storedPw);
            } catch {
              ok = bcrypt.compareSync(normalizedPw, storedPw);
            }
          } else {
            ok = storedPw === normalizedPw;
            if (ok) {
              const newHash = await hashPassword(normalizedPw);
              await supabase
                .from("work_users")
                .update({ user_pw: newHash })
                .eq("user_id", userId);
            }
          }
        }
        return jsonResponse({ data: { valid: ok } });
      }
      case "user_update": {
        const auth = await requireAuth(req);
        if (auth.error) return jsonResponse({ error: auth.error }, 401);

        const userId = String(payload.user_id || "").trim();
        if (!ensureUserMatch(auth.payload as JsonRecord, userId)) {
          return jsonResponse({ error: "FORBIDDEN" }, 403);
        }

        const updateData: JsonRecord = {};
        if (payload.user_name) updateData.user_name = String(payload.user_name);
        if (payload.new_password) {
          updateData.user_pw = await hashPassword(String(payload.new_password));
        }

        const { error } = await supabase
          .from("work_users")
          .update(updateData)
          .eq("user_id", userId);

        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ data: { success: true } });
      }
      case "user_delete": {
        const auth = await requireAuth(req);
        if (auth.error) return jsonResponse({ error: auth.error }, 401);

        const userId = String(payload.user_id || "").trim();
        if (!ensureUserMatch(auth.payload as JsonRecord, userId)) {
          return jsonResponse({ error: "FORBIDDEN" }, 403);
        }

        const { data: userRow } = await supabase
          .from("work_users")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        await supabase.from("work_user_shifts").delete().eq("user_id", userId);
        await supabase.from("work_users").delete().eq("user_id", userId);
        if (userRow?.id) {
          await supabase
            .from("social_login_users")
            .delete()
            .eq("user_id", userRow.id);
        }

        return jsonResponse({ data: { success: true } });
      }
      case "shifts_get": {
        const auth = await requireAuth(req);
        if (auth.error) return jsonResponse({ error: auth.error }, 401);

        const userId = String(payload.user_id || "").trim();
        if (!ensureUserMatch(auth.payload as JsonRecord, userId)) {
          return jsonResponse({ error: "FORBIDDEN" }, 403);
        }

        const { data, error } = await supabase
          .from("work_user_shifts")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ data });
      }
      case "shifts_upsert": {
        const auth = await requireAuth(req);
        if (auth.error) return jsonResponse({ error: auth.error }, 401);

        const userId = String(payload.user_id || "").trim();
        if (!ensureUserMatch(auth.payload as JsonRecord, userId)) {
          return jsonResponse({ error: "FORBIDDEN" }, 403);
        }

        const row = { ...payload };
        delete row.id;

        if (payload.id) {
          const { error } = await supabase
            .from("work_user_shifts")
            .update(row)
            .eq("id", payload.id);

          if (error) return jsonResponse({ error: error.message }, 500);
          return jsonResponse({ data: { success: true } });
        }

        const { error } = await supabase
          .from("work_user_shifts")
          .insert([row]);

        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ data: { success: true } });
      }
      case "shifts_delete": {
        const auth = await requireAuth(req);
        if (auth.error) return jsonResponse({ error: auth.error }, 401);

        const userId = String(payload.user_id || "").trim();
        if (!ensureUserMatch(auth.payload as JsonRecord, userId)) {
          return jsonResponse({ error: "FORBIDDEN" }, 403);
        }

        const { error } = await supabase
          .from("work_user_shifts")
          .delete()
          .eq("user_id", userId);

        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ data: { success: true } });
      }
      case "tokens_save": {
        const auth = await requireAuth(req);
        if (auth.error) return jsonResponse({ error: auth.error }, 401);

        const userId = String(payload.user_id || "").trim();
        if (!ensureUserMatch(auth.payload as JsonRecord, userId)) {
          return jsonResponse({ error: "FORBIDDEN" }, 403);
        }

        const { error } = await supabase
          .from("work_users")
          .update({
            dayf_access_token: payload.access_token ?? null,
            dayf_refresh_token: payload.refresh_token ?? null,
          })
          .eq("user_id", userId);

        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ data: { success: true } });
      }
      case "tokens_get_refresh": {
        const auth = await requireAuth(req);
        if (auth.error) return jsonResponse({ error: auth.error }, 401);

        const userId = String(payload.user_id || "").trim();
        if (!ensureUserMatch(auth.payload as JsonRecord, userId)) {
          return jsonResponse({ error: "FORBIDDEN" }, 403);
        }

        const { data, error } = await supabase
          .from("work_users")
          .select("dayf_refresh_token")
          .eq("user_id", userId)
          .single();

        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ data });
      }
      case "tokens_clear": {
        const auth = await requireAuth(req);
        if (auth.error) return jsonResponse({ error: auth.error }, 401);

        const userId = String(payload.user_id || "").trim();
        if (!ensureUserMatch(auth.payload as JsonRecord, userId)) {
          return jsonResponse({ error: "FORBIDDEN" }, 403);
        }

        const { error } = await supabase
          .from("work_users")
          .update({
            dayf_access_token: null,
            dayf_refresh_token: null,
          })
          .eq("user_id", userId);

        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ data: { success: true } });
      }
      case "google_link_status": {
        const auth = await requireAuth(req);
        if (auth.error) return jsonResponse({ error: auth.error }, 401);

        const userId = String(payload.user_id || "").trim();
        if (!ensureUserMatch(auth.payload as JsonRecord, userId)) {
          return jsonResponse({ error: "FORBIDDEN" }, 403);
        }

        const { data, error } = await supabase
          .from("work_users")
          .select("id, user_id")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) return jsonResponse({ error: error.message }, 500);
        if (!data?.id) return jsonResponse({ data: null });

        const link = await fetchGoogleLink(data.id);
        if (link.error) return jsonResponse({ error: link.error.message }, 500);

        return jsonResponse({
          data: {
            google_sub: link.data?.provider_user_id ?? null,
            google_email:
              String(link.data?.provider_user_name || "").trim() ||
              (isLikelyEmail(data.user_id) ? data.user_id : null),
          },
        });
      }
      case "google_sign_in": {
        const googleEmail = String(payload.google_email || "").trim();
        const googleSub = String(payload.google_sub || "").trim();
        const googleName = String(payload.google_name || "").trim();
        const encryptedToken = String(payload.encrypted_access_token || "");

        if (!googleEmail || !googleSub || !googleName) {
          return jsonResponse({ error: "REQUIRED_FIELDS" }, 400);
        }

        const { data: dayfUser, error: dayfErr } = await supabase
          .from("work_users")
          .select("id, user_id, user_pw")
          .eq("user_id", googleEmail)
          .maybeSingle();

        if (dayfErr) return jsonResponse({ error: dayfErr.message }, 500);

        const { data: socialLink, error: socialErr } = await supabase
          .from("social_login_users")
          .select("user_id")
          .eq("provider", "google")
          .eq("provider_user_id", googleSub)
          .maybeSingle();

        if (socialErr) return jsonResponse({ error: socialErr.message }, 500);

        if (socialLink && (!dayfUser || socialLink.user_id !== dayfUser.id)) {
          return jsonResponse({ error: "ALREADY_LINKED" }, 409);
        }

        let userNum: number;
        if (dayfUser) {
          userNum = dayfUser.id;
          const { error: updateErr } = await supabase
            .from("work_users")
            .update({ user_name: googleName })
            .eq("user_id", googleEmail);

          if (updateErr) return jsonResponse({ error: updateErr.message }, 500);
        } else {
          const { data: inserted, error: insertErr } = await supabase
            .from("work_users")
            .insert([{
              user_id: googleEmail,
              user_name: googleName,
            }])
            .select("id")
            .single();

          if (insertErr) return jsonResponse({ error: insertErr.message }, 500);
          userNum = inserted.id;
        }

        const { data: existingLink } = await supabase
          .from("social_login_users")
          .select("user_id")
          .eq("user_id", userNum)
          .eq("provider", "google")
          .maybeSingle();

        if (existingLink) {
          const { error } = await supabase
            .from("social_login_users")
            .update({
              provider_user_id: googleSub,
              provider_user_name: googleEmail,
              provider_access_token: encryptedToken,
              provider_refresh_token: null,
            })
            .eq("user_id", userNum)
            .eq("provider", "google");

          if (error) return jsonResponse({ error: error.message }, 500);
        } else {
          const { error } = await supabase
            .from("social_login_users")
            .insert({
              user_id: userNum,
              provider: "google",
              provider_user_id: googleSub,
              provider_user_name: googleEmail,
              provider_access_token: encryptedToken,
              provider_refresh_token: null,
            });

          if (error) return jsonResponse({ error: error.message }, 500);
        }

        return jsonResponse({ data: { user: { email: googleEmail, name: googleName } } });
      }
      case "google_link_current_user": {
        const auth = await requireAuth(req);
        if (auth.error) return jsonResponse({ error: auth.error }, 401);

        const currentUserId = String(payload.current_user_id || "").trim();
        if (!ensureUserMatch(auth.payload as JsonRecord, currentUserId)) {
          return jsonResponse({ error: "FORBIDDEN" }, 403);
        }

        const googleEmail = String(payload.google_email || "").trim();
        const googleSub = String(payload.google_sub || "").trim();
        const googleName = String(payload.google_name || "").trim();
        const encryptedToken = String(payload.encrypted_access_token || "");

        const { data: currentUser, error: currentUserErr } = await supabase
          .from("work_users")
          .select("id, user_id")
          .eq("user_id", currentUserId)
          .maybeSingle();

        if (currentUserErr || !currentUser) {
          return jsonResponse({ error: "CURRENT_USER_NOT_FOUND" }, 404);
        }

        const { data: emailUser, error: emailErr } = await supabase
          .from("work_users")
          .select("id, user_id, user_pw")
          .eq("user_id", googleEmail)
          .maybeSingle();

        if (emailErr) return jsonResponse({ error: emailErr.message }, 500);
        if (emailUser && emailUser.user_id !== currentUserId) {
          return jsonResponse({ error: "EMAIL_IS_USERID" }, 409);
        }

        const { data: socialLink, error: socialErr } = await supabase
          .from("social_login_users")
          .select("user_id")
          .eq("provider", "google")
          .eq("provider_user_id", googleSub)
          .maybeSingle();

        if (socialErr) return jsonResponse({ error: socialErr.message }, 500);
        if (socialLink && socialLink.user_id !== currentUser.id) {
          return jsonResponse({ error: "ALREADY_LINKED" }, 409);
        }

        const { data: existingLink } = await supabase
          .from("social_login_users")
          .select("user_id")
          .eq("user_id", currentUser.id)
          .eq("provider", "google")
          .maybeSingle();

        if (existingLink) {
          const { error } = await supabase
            .from("social_login_users")
            .update({
              provider_user_id: googleSub,
              provider_user_name: googleEmail,
              provider_access_token: encryptedToken,
              provider_refresh_token: null,
            })
            .eq("user_id", currentUser.id)
            .eq("provider", "google");

          if (error) return jsonResponse({ error: error.message }, 500);
        } else {
          const { error } = await supabase
            .from("social_login_users")
            .insert({
              user_id: currentUser.id,
              provider: "google",
              provider_user_id: googleSub,
              provider_user_name: googleEmail,
              provider_access_token: encryptedToken,
              provider_refresh_token: null,
            });

          if (error) return jsonResponse({ error: error.message }, 500);
        }

        return jsonResponse({ data: { user: { email: googleEmail, name: googleName } } });
      }
      case "google_unlink": {
        const auth = await requireAuth(req);
        if (auth.error) return jsonResponse({ error: auth.error }, 401);

        const userId = String(payload.user_id || "").trim();
        if (!ensureUserMatch(auth.payload as JsonRecord, userId)) {
          return jsonResponse({ error: "FORBIDDEN" }, 403);
        }

        const { data: user, error: userErr } = await supabase
          .from("work_users")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (userErr || !user) return jsonResponse({ error: "USER_NOT_FOUND" }, 404);

        await supabase
          .from("social_login_users")
          .delete()
          .eq("user_id", user.id)
          .eq("provider", "google");

        return jsonResponse({ data: { success: true } });
      }
      case "social_get_access_token": {
        const auth = await requireAuth(req);
        if (auth.error) return jsonResponse({ error: auth.error }, 401);

        const userId = String(payload.user_id || "").trim();
        if (!ensureUserMatch(auth.payload as JsonRecord, userId)) {
          return jsonResponse({ error: "FORBIDDEN" }, 403);
        }

        const { data: user, error: userErr } = await supabase
          .from("work_users")
          .select("id")
          .eq("user_id", userId)
          .single();

        if (userErr) return jsonResponse({ error: userErr.message }, 500);

        const { data, error } = await supabase
          .from("social_login_users")
          .select("provider_access_token")
          .eq("user_id", user.id)
          .eq("provider", "google")
          .single();

        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ data });
      }
      case "log_error": {
        const { error } = await supabase.from("Log_error").insert({
          page_name: payload.page_name ?? null,
          err_code: payload.err_code ?? null,
          err_content: payload.err_content ?? null,
          user_id: payload.user_id ?? null,
          regdate: payload.regdate ?? new Date().toISOString(),
        });

        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ data: { success: true } });
      }
      case "calendar_event_insert": {
        const auth = await requireAuth(req);
        if (auth.error) return jsonResponse({ error: auth.error }, 401);

        const userId = String(payload.user_id || "").trim();
        if (!ensureUserMatch(auth.payload as JsonRecord, userId)) {
          return jsonResponse({ error: "FORBIDDEN" }, 403);
        }

        const { data, error } = await supabase
          .from("Log_google_calendar_events")
          .insert([payload])
          .select()
          .single();

        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ data });
      }
      case "calendar_event_update_status": {
        const auth = await requireAuth(req);
        if (auth.error) return jsonResponse({ error: auth.error }, 401);

        const { error } = await supabase
          .from("Log_google_calendar_events")
          .update({
            google_event_id: payload.google_event_id ?? null,
            process_type: payload.process_type ?? null,
            status: payload.status ?? null,
          })
          .eq("dayf_event_id", payload.dayf_event_id);

        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ data: { success: true } });
      }
      case "calendar_event_get": {
        const auth = await requireAuth(req);
        if (auth.error) return jsonResponse({ error: auth.error }, 401);

        const { data, error } = await supabase
          .from("Log_google_calendar_events")
          .select("id")
          .eq("dayf_event_id", payload.dayf_event_id)
          .single();

        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ data });
      }
      default:
        return jsonResponse({ error: "UNKNOWN_ACTION" }, 400);
    }
  } catch (error) {
    return jsonResponse({ error: String(error?.message || error) }, 500);
  }
});
