const buildFunctionUrl = () => {
  const baseUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
  if (!baseUrl) {
    throw new Error("환경 변수 VITE_SUPABASE_FUNCTIONS_URL가 설정되어 있지 않습니다.");
  }
  return `${baseUrl.replace(/\/$/, "")}/google-token-store`;
};

const toIsoDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

export const persistGoogleToken = async ({ userId, accessToken, refreshToken, expiresIn, expiresAt }) => {
  if (!userId || !accessToken) return;

  const functionUrl = buildFunctionUrl();
  const body = {
    userId,
    accessToken,
    refreshToken,
    expiresIn: typeof expiresIn === "number" ? expiresIn : undefined,
    expiresAt: expiresAt ? toIsoDate(expiresAt) : undefined,
  };

  const response = await fetch(functionUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`토큰 저장 실패: ${errorText || response.status}`);
  }
};

export const removeStoredGoogleToken = async (userId) => {
  if (!userId) return;

  const functionUrl = buildFunctionUrl();
  const response = await fetch(functionUrl, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok && response.status !== 404) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`토큰 삭제 실패: ${errorText || response.status}`);
  }
};




