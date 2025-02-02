import { supabase } from "@/integrations/supabase/client";
import type { MLTokenResponse } from "@/types/mercadoLivre";

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

export const initializeAuth = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('[ML Auth] Iniciando processo de autenticação para usuário:', user.id);

    const { verifier, challenge } = await generateCodeChallenge();

    const { data: existingConnection, error: fetchError } = await supabase
      .from('mercadolivre_connections')
      .select()
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[ML Auth] Erro ao buscar conexão existente:', fetchError);
      throw new Error('Failed to check existing connection');
    }

    let connection;

    if (existingConnection) {
      console.log('[ML Auth] Atualizando conexão existente:', existingConnection.id);
      const { data: updatedConnection, error: updateError } = await supabase
        .from('mercadolivre_connections')
        .update({
          code_verifier: verifier,
          access_token: 'pending',
          refresh_token: 'pending',
          ml_user_id: 'pending',
        })
        .eq('id', existingConnection.id)
        .select()
        .single();

      if (updateError) {
        console.error('[ML Auth] Erro ao atualizar conexão:', updateError);
        throw new Error('Failed to update connection');
      }
      connection = updatedConnection;
    } else {
      console.log('[ML Auth] Criando nova conexão para usuário:', user.id);
      const { data: newConnection, error: insertError } = await supabase
        .from('mercadolivre_connections')
        .insert([{
          user_id: user.id,
          code_verifier: verifier,
          access_token: 'pending',
          refresh_token: 'pending',
          ml_user_id: 'pending',
        }])
        .select()
        .single();

      if (insertError || !newConnection) {
        console.error('[ML Auth] Erro ao criar conexão:', insertError);
        throw new Error('Failed to create connection');
      }
      connection = newConnection;
    }

    const { data: verificationCheck } = await supabase
      .from('mercadolivre_connections')
      .select('code_verifier')
      .eq('id', connection.id)
      .single();

    if (!verificationCheck?.code_verifier) {
      console.error('[ML Auth] Code verifier não foi salvo corretamente');
      throw new Error('Code verifier not saved correctly');
    }

    console.log('[ML Auth] Conexão configurada com sucesso:', {
      id: connection?.id,
      user_id: connection?.user_id,
      code_verifier_length: connection?.code_verifier?.length
    });

    const authUrl = `https://auth.mercadolibre.com.br/authorization?response_type=code&client_id=${import.meta.env.VITE_ML_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_ML_REDIRECT_URI}&code_challenge_method=S256&code_challenge=${challenge}`;

    console.log('[ML Auth] URL de autenticação gerada:', authUrl);

    return { authUrl };
  } catch (error) {
    console.error('[ML Auth] Error in initializeAuth:', error);
    throw error;
  }
};

export const exchangeCodeForToken = async (code: string, codeVerifier: string): Promise<MLTokenResponse> => {
  console.log('Code recebido:', code);

  const bodyParams = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: import.meta.env.VITE_ML_CLIENT_ID,
    client_secret: 'vYoUWQlJYl2nhOB9UXTDQPNJAXNbARMJ',
    code: code,
    redirect_uri: import.meta.env.VITE_ML_REDIRECT_URI,
    code_verifier: codeVerifier
  }).toString();

  const { data, error } = await supabase.functions.invoke('exchange-ml-token', {
    body: {
      params: bodyParams
    }
  });

  if (error) {
    console.error('Erro na troca de token:', error);
    throw new Error(`Failed to exchange code for token: ${JSON.stringify(error)}`);
  }

  console.log('Token obtido com sucesso');
  return data;
};

export const disconnectMercadoLivre = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('[ML Auth] Desconectando usuário do ML:', user.id);

    const { error } = await supabase
      .from('mercadolivre_connections')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('[ML Auth] Erro ao desconectar:', error);
      throw error;
    }

    console.log('[ML Auth] Usuário desconectado com sucesso');
  } catch (error) {
    console.error('[ML Auth] Error disconnecting:', error);
    throw error;
  }
};