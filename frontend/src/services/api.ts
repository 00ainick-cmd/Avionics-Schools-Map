import axios from 'axios';
import { School, MilitaryBase, AEAMember } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Schools API
export const schoolsApi = {
  getAll: async (): Promise<School[]> => {
    const response = await api.get('/schools');
    return response.data;
  },

  getById: async (id: number): Promise<School> => {
    const response = await api.get(`/schools/${id}`);
    return response.data;
  },

  create: async (school: School): Promise<School> => {
    const response = await api.post('/schools', school);
    return response.data;
  },

  update: async (id: number, school: Partial<School>): Promise<School> => {
    const response = await api.put(`/schools/${id}`, school);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/schools/${id}`);
  },

  bulkImport: async (schools: School[]): Promise<{ message: string; count: number }> => {
    const response = await api.post('/schools/bulk', schools);
    return response.data;
  },
};

// Military Bases API
export const militaryApi = {
  getAll: async (): Promise<MilitaryBase[]> => {
    const response = await api.get('/military');
    return response.data;
  },

  getById: async (id: number): Promise<MilitaryBase> => {
    const response = await api.get(`/military/${id}`);
    return response.data;
  },

  create: async (base: MilitaryBase): Promise<MilitaryBase> => {
    const response = await api.post('/military', base);
    return response.data;
  },

  update: async (id: number, base: Partial<MilitaryBase>): Promise<MilitaryBase> => {
    const response = await api.put(`/military/${id}`, base);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/military/${id}`);
  },

  bulkImport: async (bases: MilitaryBase[]): Promise<{ message: string; count: number }> => {
    const response = await api.post('/military/bulk', bases);
    return response.data;
  },
};

// AEA Members API
export const aeaApi = {
  getAll: async (): Promise<AEAMember[]> => {
    const response = await api.get('/aea');
    return response.data;
  },

  getById: async (id: number): Promise<AEAMember> => {
    const response = await api.get(`/aea/${id}`);
    return response.data;
  },

  create: async (member: AEAMember): Promise<AEAMember> => {
    const response = await api.post('/aea', member);
    return response.data;
  },

  update: async (id: number, member: Partial<AEAMember>): Promise<AEAMember> => {
    const response = await api.put(`/aea/${id}`, member);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/aea/${id}`);
  },

  bulkImport: async (members: AEAMember[]): Promise<{ message: string; count: number }> => {
    const response = await api.post('/aea/bulk', members);
    return response.data;
  },
};

export default api;
