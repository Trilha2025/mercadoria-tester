import { supabase } from "@/integrations/supabase/client";
import { generateCodeChallenge } from '@/utils/mercadoLivre';

export const initializeAuth = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Iniciando processo de autenticação para usuário:', user.id);

    const { verifier, challenge } = await generateCodeChallenge();
    console.log('Code challenge gerado:', { verifier: verifier.slice(0, 10) + '...', challenge: challenge.slice(0, 10) + '...' });
    
    // Primeiro, vamos buscar se já existe uma conexão pendente
    const { data: existingConnection } = await supabase
      .from('mercadolivre_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('access_token', 'pending')
      .single();

    if (existingConnection) {
      console.log('Atualizando conexão pendente existente:', existingConnection.id);
      const { error: updateError } = await supabase
        .from('mercadolivre_connections')
        .update({
          code_verifier: verifier,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConnection.id);

      if (updateError) {
        console.error('Erro ao atualizar conexão:', updateError);
        throw new Error('Failed to update pending connection');
      }
    } else {
      console.log('Criando nova conexão pendente');
      const { error: insertError } = await supabase
        .from('mercadolivre_connections')
        .insert([{
          user_id: user.id,
          code_verifier: verifier,
          access_token: 'pending',
          refresh_token: 'pending',
          ml_user_id: 'pending'
        }]);

      if (insertError) {
        console.error('Erro ao criar conexão:', insertError);
        throw new Error('Failed to create connection');
      }
    }

    // Verificar se a conexão foi criada/atualizada corretamente
    const { data: verifyConnection, error: verifyError } = await supabase
      .from('mercadolivre_connections')
      .select('code_verifier')
      .eq('user_id', user.id)
      .eq('access_token', 'pending')
      .single();

    if (verifyError || !verifyConnection?.code_verifier) {
      console.error('Erro ao verificar conexão:', verifyError);
      throw new Error('Failed to verify connection creation');
    }

    console.log('Conexão criada/atualizada com sucesso. Redirecionando para ML...');

    return {
      authUrl: `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${import.meta.env.VITE_ML_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_ML_REDIRECT_URI}&code_challenge_method=S256&code_challenge=${challenge}`
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