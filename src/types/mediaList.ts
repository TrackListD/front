// Tipos e DTOs de Lista de Mídias — define a estrutura de dados e payloads de requisição

export type ListType = "ALBUM" | "MUSIC";
export type Privacy = "PUBLIC" | "JUST_FOLLOWERS" | "PRIVATE";

export interface MediaListResponseDto {
  id: number; // ⚠️ FUTURA INTEGRAÇÃO: campo ausente no backend, necessário para navegação e operações CRUD
  typeOfList: ListType;
  listName: string;
  isFavorite: boolean;
  idAuthor: number;
  authorName: string;
  mediaIds: string[];
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

