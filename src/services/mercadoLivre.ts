import { supabase } from "@/integrations/supabase/client";
import { generateCodeChallenge } from '@/utils/mercadoLivre';

export const initializeAuth = async (companyId: string) => {
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
      .eq('company_id', companyId)
      .single();

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
        })
        .eq('company_id', companyId)
        .select()
        .single();

      if (updateError) {
        console.error('[ML Auth] Erro ao atualizar conexão:', updateError);
        throw new Error('Failed to update connection');
      }
      connection = updatedConnection;
    } else {
      console.log('[ML Auth] Criando nova conexão para empresa:', companyId);
      const { data: newConnection, error: insertError } = await supabase
        .from('mercadolivre_connections')
        .insert([{
          user_id: user.id,
          company_id: companyId,
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
      .eq('company_id', companyId)
      .single();

    if (!verificationCheck?.code_verifier) {
      console.error('[ML Auth] Code verifier não foi salvo corretamente');
      throw new Error('Code verifier not saved correctly');
    }

    console.log('[ML Auth] Conexão configurada com sucesso:', {
      id: connection?.id,
      company_id: connection?.company_id,
      code_verifier_length: connection?.code_verifier?.length
    });

    const authUrl = `https://auth.mercadolibre.com.br/authorization?response_type=code&client_id=${import.meta.env.VITE_ML_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_ML_REDIRECT_URI}&code_challenge_method=S256&code_challenge=${challenge}&state=${companyId}`;

    console.log('[ML Auth] URL de autenticação gerada:', authUrl);

    return { authUrl };
  } catch (error) {
    console.error('[ML Auth] Error in initializeAuth:', error);
    throw error;
  }
};

export const disconnectMercadoLivre = async (companyId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('[ML Auth] Desconectando empresa do ML:', companyId);

    const { error } = await supabase
      .from('mercadolivre_connections')
      .delete()
      .eq('company_id', companyId);

    if (error) {
      console.error('[ML Auth] Erro ao desconectar:', error);
      throw error;
    }

    console.log('[ML Auth] Empresa desconectada com sucesso');
  } catch (error) {
    console.error('[ML Auth] Error disconnecting:', error);
    throw error;
  }
};