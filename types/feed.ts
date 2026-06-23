export interface Author {
  id: number;
  username: string | null;
  // Campos recomendados para o futuro do back-end:
  name?: string;
  avatarUrl?: string;
}

export interface FeedItem {
  id: number;
  content: string;
  type: string; // ex: "RATING"
  rating: number;
  publicationDate: string; // formato ISO
  author: Author;
  likesCount: number;
  likedByMe: boolean;

  album?: {
    title: string;
    artist: string;
    coverUrl: string;
  };
}
