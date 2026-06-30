// Utilitário de Data — parse e formatação de datas vindas do Spring Boot

export function parseBackendDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;

  let date: Date;

  // Se já for um padrão ISO (contém T ou começa com YYYY-MM-DD)
  if (dateStr.includes("T") || /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const isoStr = dateStr.includes("T") ? dateStr : dateStr.replace(" ", "T");
    date = new Date(isoStr);
  } else {
    // Padrão brasileiro (ex: DD/MM/YYYY ou DD-MM-YYYY)
    // Pode ter hora (ex: DD-MM-YYYY HH:mm:ss ou DD/MM/YYYY HH:mm:ss)
    const normalizedStr = dateStr.replace(/\//g, "-");
    const [datePart, timePart] = normalizedStr.split(" ");
    const parts = datePart.split("-");

    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      let hours = 0;
      let minutes = 0;
      let seconds = 0;

      if (timePart) {
        const timeParts = timePart.split(":");
        if (timeParts.length >= 2) {
          hours = parseInt(timeParts[0], 10);
          minutes = parseInt(timeParts[1], 10);
        }
        if (timeParts.length >= 3) {
          seconds = parseInt(timeParts[2], 10);
        }
      }

      date = new Date(year, month - 1, day, hours, minutes, seconds);
    } else {
      date = new Date(dateStr);
    }
  }

  if (isNaN(date.getTime())) {
    console.warn("Invalid date string parsed:", dateStr);
    return new Date();
  }

  return date;
}

export function formatDateBR(dateStr: string | null | undefined): string {
  const date = parseBackendDate(dateStr);
  if (!date) return "";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
