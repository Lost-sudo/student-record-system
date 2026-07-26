import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { queryClient } from "../queryClient";
import apiClient from "../axiosInstance";

export const AUTH_KEYS = {
    token: ['auth', 'token'] as const,
    user: ['auth', 'user'] as const,
};

export const getAccessToken = (): string | null => {
    return queryClient.getQueryData<string>(AUTH_KEYS.token) ?? null;
};

export const setAccessToken = (token: string | null) => {
    if (token) {
        queryClient.setQueryData(AUTH_KEYS.token, token);
    } else {
        queryClient.removeQueries({ queryKey: AUTH_KEYS.token });
    }
};

export interface UserData {
    id: string,
    name: string,
    email: string,
    role: string
}

export const useUserData = (): UseQueryResult<UserData> => {
    const token = getAccessToken();

    return useQuery({
        queryKey: AUTH_KEYS.user,
        queryFn: async () => {
            const response = await apiClient.get<UserData>('/auth/me');
            return response.data;
        },
        enabled: !!token,
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
        },
    });
};

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
