import { supabase } from "@/integrations/supabase/client";
import { generateCodeChallenge } from '@/utils/mercadoLivre';

export const initializeAuth = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { verifier, challenge } = await generateCodeChallenge();
    
    // Limpa conexões pendentes antigas
    const { data: pendingConnections } = await supabase
      .from('mercadolivre_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('access_token', 'pending');

    if (pendingConnections && pendingConnections.length > 0) {
      await supabase
        .from('mercadolivre_connections')
        .delete()
        .eq('user_id', user.id)
        .eq('access_token', 'pending');
    }

    // Cria nova conexão pendente
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
      throw new Error('Failed to create connection');
    }

    // Verifica se a conexão foi criada
    const { data: connection, error: verifyError } = await supabase
      .from('mercadolivre_connections')
      .select('code_verifier')
      .eq('user_id', user.id)
      .eq('access_token', 'pending')
      .maybeSingle();

    if (verifyError || !connection?.code_verifier) {
      throw new Error('Failed to verify connection');
    }

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

    const { error } = await supabase
      .from('mercadolivre_connections')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error disconnecting:', error);
    throw error;
  }
};