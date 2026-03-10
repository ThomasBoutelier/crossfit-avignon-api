const TOKEN_KEY = "crm_token";

export const authStore = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      // Vérifie que le token n'est pas expiré (décode le payload sans vérification de signature)
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
};
