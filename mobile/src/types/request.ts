export type ServiceRequestStatus =
  | 'Pending'
  | 'Accepted'
  | 'InProgress'
  | 'Completed'
  | 'Canceled'
  | 'Rejected';

// Backend serializes this DTO with camelCase (JsonPropertyName attributes)
export interface ServiceRequest {
  id: string;
  clientId: string;
  clientName: string;
  professionalId: string;
  professionalName: string;
  title: string;
  description: string;
  categoryId: string | null;
  categoryName: string | null;
  status: ServiceRequestStatus;
  priceAgreed: string | null;
  scheduledDate: string | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequest {
  professionalId: string;
  title: string;
  description: string;
  categoryId?: string;
  scheduledDate?: string;
  location?: string;
}

export interface UpdateServiceRequestStatus {
  status: ServiceRequestStatus;
}
