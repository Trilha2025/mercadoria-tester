import { supabase } from "@/integrations/supabase/client";
import type { MLTokenResponse } from "@/types/mercadoLivre";

export const generateCodeChallenge = async () => {
  const verifier = generateRandomString();
  const challenge = await generateChallenge(verifier);
  console.log('Novo code challenge gerado:', {
    verifier: verifier.slice(0, 10) + '...',
    challenge: challenge.slice(0, 10) + '...'
  });
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

export const exchangeCodeForToken = async (code: string, codeVerifier: string): Promise<MLTokenResponse> => {
  console.log('Iniciando troca de código por token...', {
    code: code.slice(0, 10) + '...',
    codeVerifier: codeVerifier.slice(0, 10) + '...'
  });

  const { data, error } = await supabase.functions.invoke('exchange-ml-token', {
    body: {
      params: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: import.meta.env.VITE_ML_CLIENT_ID,
        client_secret: import.meta.env.ML_CLIENT_SECRET,
        code,
        redirect_uri: import.meta.env.VITE_ML_REDIRECT_URI,
        code_verifier: codeVerifier
      }).toString()
    }
  });

  if (error) {
    console.error('Erro na troca de token:', error);
    throw new Error(`Failed to exchange code for token: ${JSON.stringify(error)}`);
  }

  console.log('Token obtido com sucesso');
  return data;
};