// Tipos e DTOs de Lista de Mídias — define a estrutura de dados e payloads de requisição
import { MediaMinDto } from "./media";

export type ListType = "ALBUM" | "MUSIC";
export type Privacy = "PUBLIC" | "JUST_FOLLOWERS" | "PRIVATE";

export interface MediaListResponseDto {
  id: number;
  typeOfList: ListType;
  listName: string;
  isFavorite: boolean;
  authorId: number;
  authorName: string;
  medias: MediaMinDto[];
  totalDurationMs: number;
  formattedDuration: string;
  likeCount: number;
  commentCount: number;
  coverImageUrl: string | null;
}

export interface MediaListOwnerResponseDto {
  publicData: MediaListResponseDto;
  whoCanSee: Privacy;
}

export interface MediaListRequestDto {
  typeOfList: ListType;
  listName: string;
  isFavorite: boolean;
  whoCanSee: Privacy;
  mediaIds: string[];
}

export interface MediaListFormState {
  listName: string;
  typeOfList: ListType;
  whoCanSee: Privacy;
  description: string;
  tags: string;
}

export interface EditMediaListNameRequestDto {
  newName: string;
}

export interface EditMediaListPrivacyRequestDto {
  newPrivacy: Privacy;
}
