const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
});

export function formatDate(isoString: string): string {
  return DATE_FORMATTER.format(new Date(isoString));
}

export function formatTime(isoString: string): string {
  return TIME_FORMATTER.format(new Date(isoString));
}

export function getRelativeTime(isoString: string): string {
  const now = Date.now();
  const date = new Date(isoString).getTime();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 2) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  
  return formatDate(isoString);
}
