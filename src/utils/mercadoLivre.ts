import { Buffer } from 'buffer';

// Função para gerar code_verifier e code_challenge usando Web Crypto API
export async function generateCodeChallenge(): Promise<{ verifier: string; challenge: string }> {
  const verifier = generateRandomString(32);
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const challenge = base64URLEncode(new Uint8Array(hash));
  return { verifier, challenge };
}

function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

function base64URLEncode(buffer: Uint8Array): string {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export async function exchangeCodeForToken(code: string, codeVerifier: string) {
  const response = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: import.meta.env.VITE_ML_CLIENT_ID || '',
      client_secret: import.meta.env.VITE_ML_CLIENT_SECRET || '',
      code,
      redirect_uri: import.meta.env.VITE_ML_REDIRECT_URI || '',
      code_verifier: codeVerifier,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Erro ao obter token');
  }
  return response.json();
}

export async function refreshToken(refreshToken: string) {
  const response = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: import.meta.env.VITE_ML_CLIENT_ID || '',
      client_secret: import.meta.env.VITE_ML_CLIENT_SECRET || '',
      refresh_token: refreshToken,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Erro ao renovar token');
  }
  return response.json();
}

export async function getUserData(accessToken: string) {
  const response = await fetch('https://api.mercadolibre.com/users/me', {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  
  if (!response.ok) {
    throw new Error('Erro ao obter dados do usuário');
  }
  return response.json();
}