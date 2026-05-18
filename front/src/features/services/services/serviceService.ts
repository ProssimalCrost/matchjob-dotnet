import { api } from "@/src/core/api/api";
import type {
  ServiceRequest,
  CreateServiceRequest,
  ServiceStatus,
} from "../types/serviceTypes";

export async function getServiceRequests(): Promise<ServiceRequest[]> {
  const response = await api.get<ServiceRequest[]>("/service-requests");
  return response.data;
}

export async function createServiceRequest(
  data: CreateServiceRequest
): Promise<ServiceRequest> {
  const response = await api.post<ServiceRequest>("/service-requests", data);
  return response.data;
}

export async function updateServiceStatus(
  id: string,
  status: ServiceStatus
): Promise<ServiceRequest> {
  const response = await api.patch<ServiceRequest>(
    `/service-requests/${id}/status`,
    { status }
  );
  return response.data;
}

export async function deleteServiceRequest(id: string): Promise<void> {
  await api.delete(`/service-requests/${id}`);
}
