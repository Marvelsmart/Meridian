export function cn(...parts) {
  return parts
    .flat(Infinity)
    .filter((part) => typeof part === 'string' && part.trim().length > 0)
    .join(' ')
    .trim()
}
