const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_API_KEY;

function getAuthToken() {
  return sessionStorage.getItem("dayf_jwt");
}

export async function callAppApi(action, payload = {}, options = {}) {
  if (!FUNCTIONS_URL) {
    throw new Error("VITE_SUPABASE_FUNCTIONS_URL is not set");
  }
  if (!SUPABASE_ANON_KEY) {
    throw new Error("VITE_SUPABASE_API_KEY is not set");
  }

  const headers = {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };

  const token = getAuthToken();
  if (options.auth !== false && token) {
    headers["x-dayf-jwt"] = token;
  }

  const response = await fetch(`${FUNCTIONS_URL}/app-api`, {
    method: "POST",
    headers,
    body: JSON.stringify({ action, payload }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || result?.error) {
    const message = result?.error || response.statusText || "API_ERROR";
    throw new Error(message);
  }

  return result.data;
}
