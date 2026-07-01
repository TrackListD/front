export interface UserMinResponseDTO {
  id: number;
  name: string;
  profilePic: string | null;
}

export interface CommentResponseDto {
  id: number;
  postId: number;
  author: UserMinResponseDTO;
  text: string;
  commentDate: string;
  likeCount: number;
  likedByMe: boolean;
}

// Request de criação
export interface CommentRequestDto {
  idPost: number;
  text: string;
}

// Request de edição
export interface EditCommentRequestDto {
  newText: string; // verificar nome exato do campo em CommentEditRequestDto.java
}

// Resposta do comentário para o proprietário (contém dados públicos sem ID + status de moderação)
export interface CommentOwnerResponseDto {
  publicData: Omit<CommentResponseDto, "id">;
  status: "ACTIVE" | "BANNED" | "SUSPENDED" | "OCULT";
  updateAt: string;
}
