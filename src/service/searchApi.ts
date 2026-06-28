import { authFetch } from "./api"; // Ajuste o caminho conforme o seu projeto

// --- INTERFACES TIPADAS CONFORME OS RECORDS JAVA ---

export interface SpotifyImageDTO {
  url: string;
  height?: number;
  width?: number;
}

export interface SpotifyArtistResponseDTO {
  id: string;
  name: string;
  genres?: string[];
  images?: SpotifyImageDTO[]; // Mapeado do JSON "profile_picture"
}

export interface SpotifyAlbumResponseDTO {
  id: string;
  title: string; // Mapeado do JSON "name"
  releaseDate?: string; // Mapeado do JSON "release_date"
  images?: SpotifyImageDTO[]; // Mapeado do JSON "images"
  artists?: SpotifyArtistResponseDTO[];
  albumType?: string;
}

export interface SpotifyMusicResponseDTO {
  id: string;
  title: string; // Mapeado do JSON "name"
  releaseDate?: string;
  images?: SpotifyImageDTO[]; // Mapeado do JSON "cover_url"
  artists?: SpotifyArtistResponseDTO[];
  durationMs?: number;
}

// Containers de itens que seu backend joga no JSON final
export interface SpotifySearchResponseDTO {
  tracks?: { items: SpotifyMusicResponseDTO[] };
  albums?: { items: SpotifyAlbumResponseDTO[] };
  artists?: { items: SpotifyArtistResponseDTO[] };
}

// Tipo discriminado para facilitar a renderização da lista no React Native
export type SearchResultListItem =
  | (SpotifyMusicResponseDTO & { type: "track" })
  | (SpotifyAlbumResponseDTO & { type: "album" })
  | (SpotifyArtistResponseDTO & { type: "artist" });

export const searchService = {
  async executeQuery(query: string): Promise<SpotifySearchResponseDTO> {
    const response = await authFetch(`/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Erro na busca: ${response.statusText}`);
    }

    return response.json();
  },
};
