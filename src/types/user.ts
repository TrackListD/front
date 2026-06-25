// Tipos e DTOs de Usuário — define a estrutura de dados de perfil do usuário no frontend
export interface UserPerfilResponseDTO {
  id: number;
  name: string;
  bio: string;
  role: string;
  whoCanComment: string;
  creationDate: string;
  estaAtivo: boolean;
}
