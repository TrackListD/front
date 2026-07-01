// Tipos e DTOs de Mídia — reflete o MediaMinDTO gerado pela hidratação do backend

export interface MediaMinDto {
  id: string;
  title: string;
  artist: string;
  type: string;
  coverUrl: string;
  durationMs: number;
  formattedDuration: string;
}
