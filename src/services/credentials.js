export async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

export function validateCredentials(username, password) {
  if (!normalizeUsername(username)) return 'Escribe un usuario.';
  if (!password) return 'Escribe una contraseña.';
  return '';
}
