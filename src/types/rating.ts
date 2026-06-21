export interface RatingRequestDto {
  idTarget: string;
  ratingNote: number;
  review: string;
  whoCanSee: "PUBLIC" | "JUST_FOLLOWERS" | "PRIVATE";
}
