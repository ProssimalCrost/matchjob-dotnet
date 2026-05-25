export interface Review {
  Id: string;
  ReviewerId: string;
  ReviewerName: string;
  ProfessionalProfileId: string;
  Rating: number;
  Comment: string | null;
  CreatedAt: string;
}

export interface CreateReviewRequest {
  Rating: number;
  Comment?: string;
}
