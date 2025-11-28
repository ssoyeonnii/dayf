/// <reference lib="deno.ns" />
// @ts-ignore - Deno 환경에서는 URL import를 지원합니다.
import { serve } from "https://deno.land/std@0.214.0/http/server.ts";
// @ts-ignore - Deno 환경에서는 URL import를 지원합니다.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const textEncoder = new TextEncoder();

const base64Encode = (bytes: Uint8Array) => {
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
};

const base64Decode = (value: string) => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const importEncryptionKey = (() => {
  let cachedKey: CryptoKey | null = null;
  return async () => {
    if (cachedKey) return cachedKey;
    const secret = Deno.env.get("GOOGLE_TOKEN_KEY");
    if (!secret) {
      throw new Error("GOOGLE_TOKEN_KEY is not configured");
    }
    const rawKey = base64Decode(secret);
    if (rawKey.length !== 32) {
      throw new Error("GOOGLE_TOKEN_KEY must be a 32-byte key encoded in base64");
    }
    cachedKey = await crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, [
      "encrypt",
      "decrypt",
    ]);
    return cachedKey;
  };
})();

const encryptToken = async (token: string) => {
  const key = await importEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipherBuffer = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, textEncoder.encode(token))
  );
  const tag = cipherBuffer.slice(cipherBuffer.length - 16);
  const ciphertext = cipherBuffer.slice(0, cipherBuffer.length - 16);
  return {
    ciphertext: base64Encode(ciphertext),
    iv: base64Encode(iv),
    tag: base64Encode(tag),
  };
};

const parseExpiresAt = (payload: Record<string, unknown>) => {
  const expiresAt = payload.expiresAt;
  const expiresIn = payload.expiresIn;

  if (typeof expiresAt === "string") {
    const parsed = new Date(expiresAt);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  if (typeof expiresIn === "number" && Number.isFinite(expiresIn)) {
    return new Date(Date.now() + expiresIn * 1000).toISOString();
  }

  return null;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!["POST", "DELETE"].includes(req.method)) {
    return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "INVALID_JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = typeof payload.userId === "string" ? payload.userId : null;
  if (!userId) {
    return new Response(JSON.stringify({ error: "MISSING_USER_ID" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "SERVER_MISCONFIGURED" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (req.method === "DELETE") {
    const { error } = await supabase.from("work_google_tokens").delete().eq("user_id", userId);
    if (error) {
      console.error("Failed to delete encrypted tokens", error);
      return new Response(JSON.stringify({ error: "TOKEN_DELETE_FAILED" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const accessToken = typeof payload.accessToken === "string" ? payload.accessToken : null;
  const refreshToken = typeof payload.refreshToken === "string" ? payload.refreshToken : null;

  if (!accessToken) {
    return new Response(JSON.stringify({ error: "MISSING_ACCESS_TOKEN" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const encryptedAccess = await encryptToken(accessToken);
    const encryptedRefresh = refreshToken ? await encryptToken(refreshToken) : null;
    const expiresAtIso = parseExpiresAt(payload);
    const keyVersion = Number(Deno.env.get("GOOGLE_TOKEN_KEY_VERSION") ?? "1");

    const { error } = await supabase.from("work_google_tokens").upsert(
      {
        user_id: userId,
        access_ciphertext: encryptedAccess.ciphertext,
        access_iv: encryptedAccess.iv,
        access_tag: encryptedAccess.tag,
        refresh_ciphertext: encryptedRefresh?.ciphertext ?? null,
        refresh_iv: encryptedRefresh?.iv ?? null,
        refresh_tag: encryptedRefresh?.tag ?? null,
        expires_at: expiresAtIso,
        key_version: Number.isInteger(keyVersion) ? keyVersion : 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("Failed to persist encrypted tokens", error);
      return new Response(JSON.stringify({ error: "TOKEN_PERSIST_FAILED" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(null, { status: 204, headers: corsHeaders });
  } catch (error) {
    console.error("Encryption or persistence failed", error);
    return new Response(JSON.stringify({ error: "TOKEN_ENCRYPT_FAILED" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

