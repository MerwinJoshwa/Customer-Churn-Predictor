import api from './api';
import { Customer, CustomerListResponse } from '../types';

export const customerService = {
  getCustomers: async (
    page: number = 1,
    limit: number = 20,
    search?: string,
    contract?: string,
    churn_status?: string
  ): Promise<CustomerListResponse> => {
    const params: Record<string, any> = { page, limit };
    if (search) params.search = search;
    if (contract && contract !== 'ALL') params.contract = contract;
    if (churn_status && churn_status !== 'ALL') params.churn_status = churn_status;

    const response = await api.get<CustomerListResponse>('/customers', { params });
    return response.data;
  },

  getCustomerById: async (id: number): Promise<Customer> => {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  createCustomer: async (customerData: Partial<Customer>): Promise<Customer> => {
    const response = await api.post<Customer>('/customers', customerData);
    return response.data;
  },

  updateCustomer: async (id: number, customerData: Partial<Customer>): Promise<Customer> => {
    const response = await api.put<Customer>(`/customers/${id}`, customerData);
    return response.data;
  },

  deleteCustomer: async (id: number): Promise<void> => {
    await api.delete(`/customers/${id}`);
  }
};
