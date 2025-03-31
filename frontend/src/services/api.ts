import axios from 'axios';
import { 
  TaskCreate, 
  TaskResponse, 
  PropertyListing, 
  Analytics 
} from '../types';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Task API functions
export const createTask = async (taskData: TaskCreate): Promise<TaskResponse> => {
  const response = await api.post<TaskResponse>('/tasks/', taskData);
  return response.data;
};

export const getTasks = async (): Promise<TaskResponse[]> => {
  const response = await api.get<TaskResponse[]>('/tasks/');
  return response.data;
};

export const getTask = async (taskId: number): Promise<TaskResponse> => {
  const response = await api.get<TaskResponse>(`/tasks/${taskId}`);
  return response.data;
};

export const deleteTask = async (taskId: number): Promise<TaskResponse> => {
  const response = await api.delete<TaskResponse>(`/tasks/${taskId}`);
  return response.data;
};

// Property listings API functions
export const getTaskData = async (
  taskId: number,
  filters?: {
    limit?: number;
    property_type?: string;
    min_price?: number;
    max_price?: number;
    location?: string;
  }
): Promise<PropertyListing[]> => {
  const response = await api.get<PropertyListing[]>(`/tasks/${taskId}/data`, { params: filters });
  return response.data;
};

// Analytics API functions
export const getTaskAnalytics = async (taskId: number): Promise<Analytics> => {
  const response = await api.get<Analytics>(`/tasks/${taskId}/analytics`);
  return response.data;
}; 