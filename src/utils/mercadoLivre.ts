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

export const exchangeCodeForToken = async (code: string, codeVerifier: string) => {
  console.log('Trocando código por token...', { code, codeVerifier: codeVerifier.slice(0, 10) + '...' });
  
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('client_id', import.meta.env.VITE_ML_CLIENT_ID);
  params.append('code', code);
  params.append('redirect_uri', import.meta.env.VITE_ML_REDIRECT_URI);
  params.append('code_verifier', codeVerifier);

  const response = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: params
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro na resposta do ML:', errorText);
    throw new Error(`Failed to exchange code for token: ${errorText}`);
  }

  const data = await response.json();
  console.log('Token obtido com sucesso');
  return data;
};