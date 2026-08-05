import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { queryClient } from "../queryClient";
import apiClient from "../axiosInstance";
import type { UserData } from "@/types/auth";
import { getDashboardForRole } from "@/lib/authRedirects";

export const AUTH_KEYS = {
    token: ['auth', 'token'] as const,
    user: ['auth', 'user'] as const,
};

const TOKEN_STORAGE_KEY = 'accessToken';

export const getAccessToken = (): string | null => {
    const cached = queryClient.getQueryData<string>(AUTH_KEYS.token);
    if (cached) return cached;

    if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY);
        if (stored) {
            queryClient.setQueryData(AUTH_KEYS.token, stored);
            return stored;
        }
    }

    return null;
};

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

const scheduleProactiveRefresh = (token: string) => {
    const payload = decodeJwt(token);
    if (payload?.exp) {
        const delay = payload.exp * 1000 - Date.now() - 60_000;
        if (delay > 0) {
            refreshTimer = setTimeout(() => {
                apiClient.post('/auth/refresh')
                    .then(({ data }) => {
                        setAccessToken(data.accessToken);
                    })
                    .catch(() => {
                        setAccessToken(null);
                        window.location.href = "/login";
                    });
            }, delay);
        }
    }
};

const decodeJwt = (token: string): { exp?: number } | null => {
    try {
        const payload = token.split('.')[1];
        if (!payload) return null;
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(base64);
        return JSON.parse(decoded);
    } catch {
        return null;
    }
};

export const setAccessToken = (token: string | null) => {
    if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
    }

    if (token) {
        queryClient.setQueryData(AUTH_KEYS.token, token);
        window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
        scheduleProactiveRefresh(token);
    } else {
        queryClient.removeQueries({ queryKey: AUTH_KEYS.token });
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
};

export const useUserData = (): UseQueryResult<UserData | null> => {
    return useQuery({
        queryKey: AUTH_KEYS.user,
        queryFn: async () => {
            const token = getAccessToken();
            if (!token) return null;

            const response = await apiClient.get<{ success: boolean; user: UserData }>('/auth/me');
            return response.data.user;
        },
        staleTime: 1000 * 60 * 10,
    });
};

export const useLogin = () => {
    return useMutation({
        mutationFn: async (credentials: {email: string, password: string}) => {
            const response = await apiClient.post('/auth/login', credentials);
            return response.data;
        },
        onSuccess: (data) => {
            setAccessToken(data.accessToken);
            queryClient.setQueryData(AUTH_KEYS.user, data.user);
            window.location.href = getDashboardForRole(data.user.role);
        },
    });
};

export const useRegister = () => {
    return useMutation({
        mutationFn: async (credentials: {email: string, username: string, password: string}) => {
            const response = await apiClient.post('/auth/register', credentials);
            return response.data;
        },
        onSuccess: (data) => {
            setAccessToken(data.accessToken);
            queryClient.setQueryData(AUTH_KEYS.user, data.user);
            window.location.href = getDashboardForRole(data.user.role);
        }
    })
}

export const useLogout = () => {
    return useMutation({
        mutationFn: async () => {
            await apiClient.post('/auth/logout');
        },
        onSettled: () => {
            setAccessToken(null);
            queryClient.removeQueries({ queryKey: AUTH_KEYS.user });
            window.location.href = "/login";
        }
    })
}
