/**
 * Admin Authentication Service
 * Handles admin-specific authentication with role checking
 */

import { BaseService } from '../../BaseService';
import { setAuthToken, setRefreshToken } from '../../tokens';
import { AdminLoginCredentials, AdminAuthResponse } from '@/types/admin';
import { ApiResponse } from '../../types';

interface LoginPayload {
  password: string;
  email?: string;
  phone?: string;
}

class AdminAuthServiceClass extends BaseService {
  /**
   * Admin login with role verification
   * Uses the standard /auth/login endpoint but verifies admin role
   */
  async adminLogin(credentials: AdminLoginCredentials): Promise<AdminAuthResponse> {
    // Detect if identifier is email or phone
    const isEmail = credentials.identifier.includes('@');

    // Build request payload with correct field name
    const loginPayload: LoginPayload = {
      password: credentials.password,
    };

    if (isEmail) {
      loginPayload.email = credentials.identifier;
    } else {
      loginPayload.phone = credentials.identifier;
    }

    const response = await this.post<ApiResponse<AdminAuthResponse>>(
      '/auth/login',
      loginPayload
    );

    const { user, accessToken, refreshToken } = response.data;

    if (user.role !== 'admin') {
      throw new Error('Access denied. Admin privileges required.');
    }

    if (accessToken && refreshToken) {
      setAuthToken(accessToken);
      setRefreshToken(refreshToken);
    }

    return response.data;
  }
}

export const AdminAuthService = new AdminAuthServiceClass();
export default AdminAuthService;
