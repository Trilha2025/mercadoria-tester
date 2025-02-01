import { supabase } from "@/integrations/supabase/client";

export const saveMLConnection = async (userData: {
  ml_user_id: string;
  ml_nickname?: string;
  ml_email?: string;
  access_token: string;
  refresh_token: string;
}) => {
  const { data: existingConnection } = await supabase
    .from('mercadolivre_connections')
    .select()
    .single();

  if (existingConnection) {
    const { error } = await supabase
      .from('mercadolivre_connections')
      .update({
        ml_user_id: userData.ml_user_id,
        ml_nickname: userData.ml_nickname,
        ml_email: userData.ml_email,
        access_token: userData.access_token,
        refresh_token: userData.refresh_token,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingConnection.id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('mercadolivre_connections')
      .insert([userData]);

    if (error) throw error;
  }
};

export const getMLConnection = async () => {
  const { data, error } = await supabase
    .from('mercadolivre_connections')
    .select()
    .single();

  if (error) return null;
  return data;
};

export const deleteMLConnection = async () => {
  const { error } = await supabase
    .from('mercadolivre_connections')
    .delete()
    .neq('id', 'none'); // Deleta todas as conexões do usuário atual (devido ao RLS)

  if (error) throw error;
};