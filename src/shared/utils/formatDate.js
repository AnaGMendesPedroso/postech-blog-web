export function formatDate(isoString) {
  if (!isoString) return '';

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  } catch {
    return '';
  }
}
