import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken } from './stores/authStore';
import { queryClient } from './queryClient';

const MAX_RETRIES = 3;

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retryCount?: number;
}

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/",
    timeout: 10000,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error), 
)

let isRefreshsing = false;
let failedQueue: {
    resolve: (value?: unknown) => void;
    reject: (value?: unknown) => void;
    config: CustomAxiosRequestConfig;
}[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (!originalRequest) return Promise.reject(error);

        if (error.response?.status === 403) {
            window.location.href = "/403";
            return Promise.reject(error);
        }

        if (originalRequest._retryCount === undefined) {
            originalRequest._retryCount = 0;
        }

        if (error.response?.status === 401) {
            if (originalRequest.url?.includes('/auth/login')) {
                return Promise.reject(error);
            }

            if (originalRequest.url?.includes('/auth/refresh')) {
                return Promise.reject(error);
            }

            if (originalRequest._retryCount === undefined) {
                originalRequest._retryCount = 0;
            }

            if (originalRequest._retryCount < MAX_RETRIES) {
                if(isRefreshsing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject, config: originalRequest });
                    }).then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    });
                }

                originalRequest._retryCount += 1;
                isRefreshsing = true;

                try {
                    const { data } = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    const newAccessToken = data.accessToken;

                    setAccessToken(newAccessToken);
                    queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                    processQueue(null, newAccessToken);
                    isRefreshsing = false;

                    return apiClient(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError as AxiosError, null);
                    isRefreshsing = false;

                    setAccessToken(null);

                    window.location.href = "/login";

                    return Promise.reject(refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;