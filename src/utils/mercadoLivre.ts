import { Buffer } from 'buffer';

export const generateCodeChallenge = async () => {
  const verifier = generateRandomString();
  const challenge = await generateChallenge(verifier);
  return { verifier, challenge };
};

const generateRandomString = () => {
  const array = new Uint32Array(28);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
};

const generateChallenge = async (verifier: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(digest));
};

const base64URLEncode = (buffer: Uint8Array) => {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

export const exchangeCodeForToken = async (code: string, verifier: string) => {
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('client_id', import.meta.env.VITE_ML_CLIENT_ID);
  params.append('code_verifier', verifier);
  params.append('code', code);
  params.append('redirect_uri', 'https://mercadoria-tester.vercel.app/ml-callback');

  const response = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: params
  });

  if (!response.ok) {
    throw new Error('Falha ao trocar código por token');
  }

  return response.json();
};

export const refreshToken = async (refresh_token: string) => {
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('client_id', import.meta.env.VITE_ML_CLIENT_ID);
  params.append('refresh_token', refresh_token);

  const response = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: params
  });

  if (!response.ok) {
    throw new Error('Falha ao atualizar token');
  }

  return response.json();
};

export const getUserData = async (accessToken: string) => {
  const response = await fetch('https://api.mercadolibre.com/users/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Falha ao buscar dados do usuário');
  }

  return response.json();
};