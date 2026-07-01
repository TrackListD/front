// Tipos e DTOs de Busca do Spotify — define as estruturas dos dados vindos do wrapper da API

export interface SpotifyArtistDto {
  id: string;
  name: string;
}

export interface SpotifyImageDto {
  url: string;
  height?: number;
  width?: number;
}

export interface SpotifyItemDto {
  id: string;
  name: string;
  artists?: SpotifyArtistDto[];
  images?: SpotifyImageDto[];
  cover_url?: SpotifyImageDto[];
}

export interface SpotifyContainerDto {
  items: SpotifyItemDto[];
}

export interface SpotifySearchResponseDTO {
  tracks: SpotifyContainerDto;
  albums: SpotifyContainerDto;
  artists: SpotifyContainerDto;
}
