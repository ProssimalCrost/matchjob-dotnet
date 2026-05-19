"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/src/shared/components/Navbar";
import { getProfessionalById } from "@/src/features/professionals/services/professionalService";
import { getReviewsByProfessional, createReview } from "@/src/features/reviews/services/reviewService";
import { checkFavorite, addFavorite, removeFavorite } from "@/src/features/favorites/services/favoriteService";
import type { Professional } from "@/src/features/professionals/types/professionalTypes";
import type { Review } from "@/src/features/reviews/types/reviewTypes";
import {
  StarIcon,
  MapPinIcon,
  HeartIcon,
  CheckBadgeIcon,
  CurrencyDollarIcon,
  TagIcon,
} from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
        >
          <StarIcon
            className={`h-7 w-7 transition ${
              star <= (hover || value) ? "text-yellow-400" : "text-slate-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700">
          {review.ReviewerName.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{review.ReviewerName}</p>
          <p className="text-xs text-slate-400">
            {new Date(review.CreatedAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <StarIcon
              key={s}
              className={`h-4 w-4 ${s <= review.Rating ? "text-yellow-400" : "text-slate-200"}`}
            />
          ))}
        </div>
      </div>
      {review.Comment && (
        <p className="mt-3 text-sm text-slate-600">{review.Comment}</p>
      )}
    </div>
  );
}

export default function ProfessionalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [professional, setProfessional] = useState<Professional | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        const [prof, revs] = await Promise.all([
          getProfessionalById(id),
          getReviewsByProfessional(id),
        ]);
        setProfessional(prof);
        setReviews(revs);

        try {
          const fav = await checkFavorite(id);
          setIsFavorite(fav);
        } catch {
          // not logged in
        }
      } catch {
        router.push("/professionals");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  async function handleToggleFavorite() {
    if (togglingFav) return;
    setTogglingFav(true);
    try {
      if (isFavorite) {
        await removeFavorite(id);
        setIsFavorite(false);
      } else {
        await addFavorite(id);
        setIsFavorite(true);
      }
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Erro ao atualizar favorito.";
      alert(msg);
    } finally {
      setTogglingFav(false);
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();

    if (rating === 0) {
      alert("Selecione uma avaliação.");
      return;
    }

    try {
      setSubmittingReview(true);

      const newReview = await createReview(id, {
        rating,
        comment: comment.trim() || undefined,
      });

      setReviews((prev) => [newReview, ...prev]);

      if (professional) {
        const newCount = professional.ReviewCount + 1;
        const newRating =
          (professional.Rating * professional.ReviewCount + rating) / newCount;
        setProfessional({ ...professional, Rating: newRating, ReviewCount: newCount });
      }

      setRating(0);
      setComment("");
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Erro ao enviar avaliação.";
      alert(msg);
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          <p className="text-slate-600">Carregando perfil...</p>
        </div>
      </main>
    );
  }

  if (!professional) return null;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex">
        <Sidebar />

        <section className="flex-1 px-6 py-10 lg:px-10">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Header card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-600 text-4xl font-bold text-white shadow-lg">
                  {professional.UserName.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-slate-900">
                      {professional.UserName}
                    </h1>
                    {professional.Available ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Disponível
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                        Indisponível
                      </span>
                    )}
                  </div>

                  {professional.Title && (
                    <p className="mt-1 text-base font-medium text-purple-700">
                      {professional.Title}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span className="font-medium text-purple-600">
                      {professional.Category}
                    </span>
                    {professional.Location && (
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4" />
                        {professional.Location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4 text-yellow-500" />
                      {professional.Rating.toFixed(1)} ({professional.ReviewCount}{" "}
                      {professional.ReviewCount === 1 ? "avaliação" : "avaliações"})
                    </span>
                  </div>

                  {professional.Price && (
                    <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-slate-700">
                      <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                      R$ {professional.Price}/hora
                      {professional.PriceRange && (
                        <span className="ml-1 text-slate-400 font-normal">
                          ({professional.PriceRange})
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleToggleFavorite}
                  disabled={togglingFav}
                  className={`shrink-0 rounded-2xl border p-3 transition ${
                    isFavorite
                      ? "border-red-200 bg-red-50 text-red-500"
                      : "border-slate-200 bg-slate-50 text-slate-400 hover:text-red-400"
                  }`}
                >
                  {isFavorite ? (
                    <HeartIcon className="h-6 w-6" />
                  ) : (
                    <HeartOutline className="h-6 w-6" />
                  )}
                </button>
              </div>

              {professional.Bio && (
                <p className="mt-6 text-sm leading-7 text-slate-600 border-t border-slate-100 pt-6">
                  {professional.Bio}
                </p>
              )}

              {professional.Tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {professional.Tags.map((tag) => (
                    <span
                      key={tag.Id}
                      className="inline-flex items-center gap-1 rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700"
                    >
                      <TagIcon className="h-3 w-3" />
                      {tag.Name}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => router.push(`/chat`)}
                  className="flex-1 rounded-xl bg-slate-950 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
                >
                  Chamar / Contratar
                </button>
              </div>
            </div>

            {/* Review form */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Deixar avaliação
              </h2>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Sua nota
                  </label>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Comentário (opcional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Descreva sua experiência com este profissional."
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview || rating === 0}
                  className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submittingReview ? "Enviando..." : "Enviar avaliação"}
                </button>
              </form>
            </div>

            {/* Reviews list */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Avaliações ({reviews.length})
              </h2>

              {reviews.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">
                  Nenhuma avaliação ainda. Seja o primeiro a avaliar!
                </p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <ReviewCard key={review.Id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
