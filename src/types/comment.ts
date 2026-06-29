// Tipos e DTOs de Comentários — define a estrutura de dados de comentários do frontend e payloads de requisição
// Resposta pública de um comentário
export interface CommentResponseDto {
  id: number; // ⚠️ campo ausente no backend — necessário para edição/deleção
  idPost: number;
  idAuthor: number;
  text: string;
  commentDate: string; // formato backend: "dd-MM-yyyy HH:mm:ss"
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
