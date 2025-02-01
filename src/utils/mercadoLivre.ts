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
  return btoa(String.fromCharCode.apply(null, [...buffer]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

export const exchangeCodeForToken = async (code: string, verifier: string) => {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: import.meta.env.VITE_ML_CLIENT_ID,
    code_verifier: verifier,
    code: code,
    redirect_uri: 'https://atrilhadoecommerce.lovable.dev/ml-callback',
  });

  const response = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error('Falha ao trocar código por token');
  }

  return response.json();
};