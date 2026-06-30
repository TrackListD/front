// Tipos e DTOs de Avaliação (Ratings) — define a estrutura de dados de avaliação do frontend e payloads de requisição
import { MediaMinDto } from "./media";

export interface RatingRequestDto {
  targetId: string;
  ratingNote: number;
  review?: string;
  whoCanSee: "PUBLIC" | "JUST_FOLLOWERS" | "PRIVATE";
}

export interface UserMinResponseDto {
  id: number;
  name: string;
  profilePic: string | null;
}

// Versão pública: retornada quando outro usuário visualiza a avaliação
export interface RatingResponseDto {
  id: number;
  author: UserMinResponseDto;
  targetMedia: MediaMinDto;
  publicationDate: string;
  ratingNote: number;
  review: string;
  authorName: string;
  likeCount: number;
  commentCount: number;
}

// Versão do dono: retornada quando o próprio autor visualiza a avaliação
// Contém todos os dados públicos (dentro de publicDto) + campos exclusivos do dono
export interface RatingOwnerResponseDto {
  publicDto: RatingResponseDto;
  updatedAt: string;
  status: "ACTIVE" | "SUSPENDED" | "BANNED" | "HIDDEN";
  whoCanSee: "PUBLIC" | "JUST_FOLLOWERS" | "PRIVATE";
}

// União discriminada: a presença de "publicDto" identifica a versão do dono
export type RatingDetailResponse = RatingResponseDto | RatingOwnerResponseDto;

// Type guard: retorna true se a resposta for do dono (tem publicDto)
export function isOwnerResponse(
  r: RatingDetailResponse,
): r is RatingOwnerResponseDto {
  return "publicDto" in r;
}

// DTO para requisição de edição do texto da avaliação
export interface EditReviewRequestDto {
  newReview: string;
}

// DTO para requisição de edição da nota da avaliação
export interface EditNoteRequestDto {
  newRatingNote: number;
}

// DTO para requisição de alteração de privacidade da avaliação
export interface EditPrivacyRequestDto {
  newPrivacy: "PUBLIC" | "JUST_FOLLOWERS" | "PRIVATE";
}
