import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "./authApi";
import { clearTokens, getTokens, setTokens } from "./authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const refreshSession = useCallback(async () => {
    const { refreshToken } = getTokens();
    if (!refreshToken) {
      throw new Error("Missing refresh token");
    }
    const data = await authApi.refresh(refreshToken);
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data;
  }, []);

  const loadCurrentUser = useCallback(async () => {
    const { accessToken } = getTokens();
    if (!accessToken) return null;
    const data = await authApi.getMe(accessToken);
    return data.user || null;
  }, []);

  const initialize = useCallback(async () => {
    setAuthLoading(true);
    try {
      const userData = await loadCurrentUser();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      if (error?.status === 401) {
        try {
          await refreshSession();
          const userData = await loadCurrentUser();
          setUser(userData);
        } catch {
          clearTokens();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setAuthLoading(false);
      setAuthReady(true);
    }
  }, [loadCurrentUser, refreshSession]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const login = useCallback(async ({ email, password }) => {
    const data = await authApi.login({ email, password });
    if (data?.accessToken) {
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    }
    if (data?.user) {
      setUser(data.user);
    } else {
      const userData = await loadCurrentUser();
      setUser(userData);
    }
    return data.user;
  }, [loadCurrentUser]);

  const register = useCallback(async ({ name, email, password }) => {
    const data = await authApi.register({ name, email, password });
    if (data?.accessToken) {
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      setUser(data.user || null);
      return data.user;
    }
    await login({ email, password });
    return data.user;
  }, [login]);

  const logout = useCallback(async () => {
    const { refreshToken } = getTokens();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Ignore logout errors to ensure local session is cleared.
      }
    }
    clearTokens();
    setUser(null);
  }, []);

  const requestPasswordReset = useCallback((email) => authApi.requestPasswordReset(email), []);

  const resetPassword = useCallback(
    (payload) => authApi.resetPassword(payload),
    []
  );

  const value = useMemo(() => {
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    return {
      user,
      authReady,
      authLoading,
      isAuthenticated: Boolean(user),
      hasRole: (required) => {
        if (!required) return true;
        const requiredRoles = Array.isArray(required) ? required : [required];
        return requiredRoles.some((role) => roles.includes(role));
      },
      login,
      register,
      logout,
      requestPasswordReset,
      resetPassword,
      refreshSession,
      setUser,
    };
  }, [authLoading, authReady, login, logout, refreshSession, register, requestPasswordReset, resetPassword, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
