import { supabase } from "@/integrations/supabase/client";

interface MLConnectionData {
  ml_user_id: string;
  ml_nickname?: string;
  ml_email?: string;
  access_token: string;
  refresh_token: string;
}

export const saveMLConnection = async (userData: MLConnectionData) => {
  const { data: existingConnection, error: fetchError } = await supabase
    .from('mercadolivre_connections')
    .select()
    .single();

  const user = supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const connectionData = {
    ...userData,
    user_id: (await user).data.user?.id,
  };

  if (existingConnection) {
    const { error } = await supabase
      .from('mercadolivre_connections')
      .update(connectionData)
      .eq('id', existingConnection.id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('mercadolivre_connections')
      .insert([connectionData]);

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
    .neq('id', 'none');

  if (error) throw error;
};