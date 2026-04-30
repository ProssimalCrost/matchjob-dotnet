import api from "../../../core/api/api";

export async function getReviewsByProfessional(professionalProfileId: string) {
  const response = await api.get(
    `/reviews/professional/${professionalProfileId}`
  );

  return response.data;
}

export async function createReview(data: {
  professionalProfileId: string;
  rating: number;
  comment?: string;
}) {
  const response = await api.post("/reviews", data);

  return response.data;
}