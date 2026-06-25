export interface Author {
  id: number;
  name: string | null;
  profilePic: string | null;
}

export interface Media {
  id: string;
  title: string;
  artist: string;
  type: string;
  coverUrl: string | null;
}

export interface FeedItem {
  id: number;
  content: string;
  type: "RATING" | "MEDIA_LIST" | string;
  rating: number | null;
  publicationDate: string;
  author: Author;
  likesCount: number;
  likedByMe: boolean;
  media: Media | null;
  authorFollowedByAuthUser: boolean;
}
