export const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

export async function api(path: string, options: RequestInit = {}) {
  const sessionToken = sessionStorage.getItem("ai-york-session");
  const response = await fetch(`${API}${path}`, { ...options, headers: { "content-type": "application/json", ...(sessionToken ? { authorization: `Bearer ${sessionToken}` } : {}), ...(options.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error?.message || "The service is unavailable.");
  if (body.sessionToken) sessionStorage.setItem("ai-york-session", body.sessionToken);
  return body;
}
