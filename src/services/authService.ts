import { apiClient } from 'src/services/api-client';
import { API_ROUTES } from 'src/constants/api-routes';
import type { ApiResponse, AuthTokens, AuthUser } from 'src/types';

/**
 * Auth stub — demonstrates the full login/signup/forgot-password/verify/reset
 * pattern against MSW handlers. There is no real backend; swap the MSW handlers
 * for real endpoints per project. Token persistence is owned by authStore.ts.
 */
export const authService = {
  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: AuthUser; token: string }> {
    const { data } = await apiClient.post<ApiResponse<{ user: AuthUser; tokens: AuthTokens }>>(
      API_ROUTES.AUTH.LOGIN,
      credentials
    );
    if (data.status !== 'success' || !data.data) {
      throw new Error(data.error ?? 'Login failed');
    }
    return { user: data.data.user, token: data.data.tokens.accessToken };
  },

  async logout(): Promise<void> {
    await apiClient.post(API_ROUTES.AUTH.LOGOUT);
  },

  async me(): Promise<AuthUser> {
    const { data } = await apiClient.get<ApiResponse<AuthUser>>(API_ROUTES.AUTH.ME);
    if (data.status !== 'success' || !data.data) {
      throw new Error(data.error ?? 'Not authenticated');
    }
    return data.data;
  },

  /** Creates the account; the server sends a verification code (see `verifyOtp`). */
  async signup(payload: { name: string; email: string; password: string }): Promise<void> {
    const { data } = await apiClient.post<ApiResponse<null>>(API_ROUTES.AUTH.SIGNUP, payload);
    if (data.status !== 'success') {
      throw new Error(data.error ?? 'Signup failed');
    }
  },

  /** Completes signup verification; logs the user in on success. */
  async verifyOtp(payload: {
    email: string;
    code: string;
  }): Promise<{ user: AuthUser; token: string }> {
    const { data } = await apiClient.post<ApiResponse<{ user: AuthUser; tokens: AuthTokens }>>(
      API_ROUTES.AUTH.VERIFY_OTP,
      payload
    );
    if (data.status !== 'success' || !data.data) {
      throw new Error(data.error ?? 'Verification failed');
    }
    return { user: data.data.user, token: data.data.tokens.accessToken };
  },

  async resendOtp(payload: { email: string }): Promise<void> {
    const { data } = await apiClient.post<ApiResponse<null>>(API_ROUTES.AUTH.RESEND_OTP, payload);
    if (data.status !== 'success') {
      throw new Error(data.error ?? 'Could not resend the code');
    }
  },

  /** Triggers a password-reset code to the given email. */
  async forgotPassword(payload: { email: string }): Promise<void> {
    const { data } = await apiClient.post<ApiResponse<null>>(
      API_ROUTES.AUTH.FORGOT_PASSWORD,
      payload
    );
    if (data.status !== 'success') {
      throw new Error(data.error ?? 'Could not send the reset code');
    }
  },

  /** Completes a password reset with the emailed code. */
  async resetPassword(payload: { email: string; code: string; password: string }): Promise<void> {
    const { data } = await apiClient.post<ApiResponse<null>>(
      API_ROUTES.AUTH.RESET_PASSWORD,
      payload
    );
    if (data.status !== 'success') {
      throw new Error(data.error ?? 'Could not reset the password');
    }
  },
};
