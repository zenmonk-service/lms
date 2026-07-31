export function getInitials(name: string) {
  return name
    ?.replace(/\s+/g, "")
    ?.slice(0, 2)
    ?.toUpperCase();
}