import { supabase } from "@/integrations/supabase/client";
import { generateCodeChallenge } from '@/utils/mercadoLivre';

export const initializeAuth = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Iniciando processo de autenticação para usuário:', user.id);

    // Primeiro, vamos limpar qualquer conexão pendente antiga
    const { error: deleteError } = await supabase
      .from('mercadolivre_connections')
      .delete()
      .eq('user_id', user.id)
      .eq('access_token', 'pending');

    if (deleteError) {
      console.error('Erro ao limpar conexões pendentes:', deleteError);
      throw new Error('Failed to clean pending connections');
    }

    const { verifier, challenge } = await generateCodeChallenge();
    console.log('Code challenge gerado:', { 
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
      console.error('Erro ao criar conexão:', insertError);
      throw new Error('Failed to create connection');
    }

    console.log('Conexão pendente criada com sucesso:', newConnection.id);

    // Verificar se a conexão foi realmente criada
    const { data: verifyConnection, error: verifyError } = await supabase
      .from('mercadolivre_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('access_token', 'pending')
      .single();

    if (verifyError || !verifyConnection) {
      console.error('Erro ao verificar conexão:', verifyError);
      throw new Error('Failed to verify connection creation');
    }

    console.log('Conexão verificada com sucesso. Redirecionando para ML...');

    return {
      authUrl: `https://auth.mercadolibre.com.br/authorization?response_type=code&client_id=${import.meta.env.VITE_ML_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_ML_REDIRECT_URI}&code_challenge_method=S256&code_challenge=${challenge}`
    };
  } catch (error) {
    console.error('Error in initializeAuth:', error);
    throw error;
  }
};

export const disconnectMercadoLivre = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Desconectando usuário do ML:', user.id);

    const { error } = await supabase
      .from('mercadolivre_connections')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Erro ao desconectar:', error);
      throw error;
    }

    console.log('Usuário desconectado com sucesso');
  } catch (error) {
    console.error('Error disconnecting:', error);
    throw error;
  }
};