export function generateSlugId(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const pick = (n: number) =>
    Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `${pick(3)}-${pick(4)}-${pick(3)}`;
}
