import type { Employee } from '../types';
import axiosInstance from './mockApi';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

/**
 * API Service for employee data operations
 */
export const employeeApi = {
  /**
   * Fetch all employees from the mock API
   */
  async getEmployees(): Promise<Employee[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Employee[]>>('/api/employees');
      const result = response.data;
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch employees');
      }
      
      return result.data || [];
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  /**
   * Search employees with filters (for future API enhancements)
   */
  async searchEmployees(query: Record<string, any>): Promise<Employee[]> {
    try {
      const params = new URLSearchParams(
        Object.entries(query).reduce((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {} as Record<string, string>)
      );
      
      const response = await axiosInstance.get<ApiResponse<Employee[]>>(
        `/api/employees/search?${params}`
      );
      const result = response.data;
      
      if (!result.success) {
        throw new Error(result.message || 'Search failed');
      }
      
      return result.data || [];
    } catch (error) {
      console.error('Error searching employees:', error);
      throw error;
    }
  }
};
