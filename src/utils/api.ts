const BASE_URL = "https://nic-backend-go-bmd3gga3bhhjckdq.southeastasia-01.azurewebsites.net/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Ambil token dari localStorage jika ada
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}