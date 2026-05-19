export type ServiceStatus =
  | "Pending"
  | "Accepted"
  | "InProgress"
  | "Completed"
  | "Canceled"
  | "Rejected";

export type ServiceRequest = {
  id: string;
  clientId: string;
  clientName?: string;
  professionalId: string;
  professionalName?: string;
  title: string;
  description: string;
  categoryId?: string;
  categoryName?: string;
  status: ServiceStatus;
  priceAgreed?: string;
  scheduledDate?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateServiceRequest = {
  professionalId: string;
  title: string;
  description: string;
  categoryId?: string;
  scheduledDate?: string;
  location?: string;
};
