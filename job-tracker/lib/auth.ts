const AUTH_KEY = 'job-tracker-authenticated';
const PASSWORD_KEY = 'job-tracker-password';

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_KEY) === 'true';
}

export function setPassword(password: string): void {
  if (typeof window === 'undefined') return;
  // Simple hash for demo - in production, use proper authentication
  const hash = btoa(password);
  localStorage.setItem(PASSWORD_KEY, hash);
  localStorage.setItem(AUTH_KEY, 'true');
}

export function login(password: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const storedHash = localStorage.getItem(PASSWORD_KEY);
  
  if (!storedHash) {
    // First time setup - set the password
    setPassword(password);
    return true;
  }
  
  // Verify password
  const hash = btoa(password);
  if (hash === storedHash) {
    localStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  
  return false;
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_KEY, 'false');
}

export function hasPassword(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(PASSWORD_KEY);
}

export function resetPassword(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PASSWORD_KEY);
  localStorage.removeItem(AUTH_KEY);
}

