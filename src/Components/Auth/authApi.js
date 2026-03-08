const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_API_BASE || "http://localhost:5000/api/auth";

const parseJson = async (res) => {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

const jsonFetch = async (path, options = {}) => {
  const res = await fetch(`${AUTH_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await parseJson(res);
  if (!res.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const login = (payload) =>
  jsonFetch("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const register = (payload) =>
  jsonFetch("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const refresh = (refreshToken) =>
  jsonFetch("/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

export const logout = (refreshToken) =>
  jsonFetch("/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

export const requestPasswordReset = (email) =>
  jsonFetch("/password-reset-request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const resetPassword = ({ email, token, newPassword }) =>
  jsonFetch("/password-reset", {
    method: "POST",
    body: JSON.stringify({ email, token, newPassword }),
  });

export const getMe = (accessToken) =>
  jsonFetch("/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
