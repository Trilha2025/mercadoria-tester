import { supabase } from "@/integrations/supabase/client";
import { generateCodeChallenge } from '@/utils/mercadoLivre';

export const initializeAuth = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('[ML Auth] Iniciando processo de autenticação para usuário:', user.id);

    // Primeiro, vamos limpar qualquer conexão pendente antiga
    const { error: deleteError } = await supabase
      .from('mercadolivre_connections')
      .delete()
      .eq('user_id', user.id)
      .eq('access_token', 'pending');

    if (deleteError) {
      console.error('[ML Auth] Erro ao limpar conexões pendentes:', deleteError);
      throw new Error('Failed to clean pending connections');
    }

    const { verifier, challenge } = await generateCodeChallenge();
    console.log('[ML Auth] Code verifier gerado:', { 
      verifier: verifier.slice(0, 10) + '...', 
      challenge: challenge.slice(0, 10) + '...' 
    });

    // Criar nova conexão pendente
    const { data: newConnection, error: insertError } = await supabase
      .from('mercadolivre_connections')
      .insert([{
        user_id: user.id,
        code_verifier: verifier,
        access_token: 'pending',
        refresh_token: 'pending',
        ml_user_id: 'pending'
      }])
      .select()
      .single();

    if (insertError || !newConnection) {
      console.error('[ML Auth] Erro ao criar conexão:', insertError);
      throw new Error('Failed to create connection');
    }

    console.log('[ML Auth] Conexão pendente criada com sucesso:', {
      id: newConnection.id,
      user_id: newConnection.user_id,
      code_verifier_length: newConnection.code_verifier?.length
    });

    // Verificar se a conexão foi realmente criada
    const { data: verifyConnection, error: verifyError } = await supabase
      .from('mercadolivre_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('access_token', 'pending')
      .single();

    if (verifyError || !verifyConnection) {
      console.error('[ML Auth] Erro ao verificar conexão:', verifyError);
      throw new Error('Failed to verify connection creation');
    }

    if (!verifyConnection.code_verifier) {
      console.error('[ML Auth] Code verifier não foi salvo corretamente');
      throw new Error('Code verifier not saved correctly');
    }

    console.log('[ML Auth] Conexão verificada com sucesso. Redirecionando para ML...');

    return {
      authUrl: `https://auth.mercadolibre.com.br/authorization?response_type=code&client_id=${import.meta.env.VITE_ML_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_ML_REDIRECT_URI}&code_challenge_method=S256&code_challenge=${challenge}`
    };
  } catch (error) {
    console.error('[ML Auth] Error in initializeAuth:', error);
    throw error;
  }
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