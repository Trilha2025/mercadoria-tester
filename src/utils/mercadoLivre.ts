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
  console.log('Iniciando troca de código por token com os seguintes parâmetros:');
  console.log('- Code:', code);
  console.log('- Verifier:', verifier);
  console.log('- Client ID:', import.meta.env.VITE_ML_CLIENT_ID);
  console.log('- Redirect URI:', import.meta.env.VITE_ML_REDIRECT_URI);

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: import.meta.env.VITE_ML_CLIENT_ID,
    code_verifier: verifier,
    code: code,
    redirect_uri: import.meta.env.VITE_ML_REDIRECT_URI,
  });

  try {
    const response = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    console.log('Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na resposta:', errorText);
      throw new Error(`Falha ao trocar código por token: ${errorText}`);
    }

    const data = await response.json();
    console.log('Resposta da API (token):', data);
    return data;
  } catch (error) {
    console.error('Erro durante a troca de token:', error);
    throw error;
  }
};