import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);  // memory only — no LocalStorage
  const [deviceTrustScore, setDeviceTrustScore] = useState(100);
  const [globalThreatScore, setGlobalThreatScore] = useState(0);
  const [rateLimitAlert, setRateLimitAlert] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true); // silent-refresh in progress

  // Wire 429 alert interceptor
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 429) {
          setRateLimitAlert(true);
          setTimeout(() => setRateLimitAlert(false), 3000);
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(responseInterceptor);
  }, []);

  // On mount: attempt silent refresh using HttpOnly cookie
  // This restores the in-memory access token after a page reload without LocalStorage
  useEffect(() => {
    const silentRefresh = async () => {
      try {
        const res = await api.post('/auth/refresh', {});
        const { token: newToken, role, zone, username } = res.data;
        setAuthToken(newToken);
        setTokenState(newToken);
        setUser({ username, role, zone });
      } catch {
        // No valid refresh token cookie — user must log in
      } finally {
        setBootstrapping(false);
      }
    };
    silentRefresh();
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token: newToken, role, zone, deviceTrustScore: dts } = response.data;

      // Access token stored only in memory — never in LocalStorage
      setAuthToken(newToken);
      setTokenState(newToken);
      setDeviceTrustScore(dts || 100);
      setUser({ username, role, zone });
      return true;
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (username, password, phoneNumber, role) => {
    try {
      const response = await api.post('/auth/register', { username, password, phoneNumber, role });
      return { success: true, message: response.data.message };
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Revoke access token in Redis + clear refresh token cookie on server
      await api.post('/auth/logout', {});
    } catch {
      // Best-effort — clear client state regardless
    } finally {
      setUser(null);
      setTokenState(null);
      setAuthToken(null);
      setDeviceTrustScore(100);
      setGlobalThreatScore(0);
    }
  }, []);

  const updateGlobalThreatScore = useCallback((score) => setGlobalThreatScore(score), []);
  const updateDeviceTrustScore = useCallback((score) => setDeviceTrustScore(score), []);

  // Render nothing during boot-refresh to avoid a login flash on valid sessions
  if (bootstrapping) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        register,
        deviceTrustScore,
        globalThreatScore,
        updateGlobalThreatScore,
        updateDeviceTrustScore,
        rateLimitAlert
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
