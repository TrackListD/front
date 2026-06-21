export interface RatingRequestDto {
  targetId: string;
  ratingNote: number;
  review?: string;
  whoCanSee: "PUBLIC" | "JUST_FOLLOWERS" | "PRIVATE";
}
