export function isAdminRole(role) {
  return (role || '').toString().trim().toUpperCase() === 'ADMIN';
}

export function decodeJwtPayload(token) {
  try {
    const parts = (token || '').split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getTokenRole() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  return payload?.role || null;
}

