import { api } from './api';
import type {
  ServiceRequest,
  CreateServiceRequest,
  UpdateServiceRequestStatus,
} from '@/src/types/request';

export async function getMyRequests(): Promise<ServiceRequest[]> {
  const { data } = await api.get<ServiceRequest[]>('/service-requests');
  return data;
}

export async function createRequest(payload: CreateServiceRequest): Promise<ServiceRequest> {
  const { data } = await api.post<ServiceRequest>('/service-requests', payload);
  return data;
}

export async function updateRequestStatus(
  id: string,
  payload: UpdateServiceRequestStatus,
): Promise<ServiceRequest> {
  const { data } = await api.patch<ServiceRequest>(`/service-requests/${id}/status`, payload);
  return data;
}
