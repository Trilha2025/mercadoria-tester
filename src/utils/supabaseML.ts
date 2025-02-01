import { supabase } from "@/integrations/supabase/client";
import type { MLConnection } from "@/types/mercadoLivre";

export const saveMLConnection = async (userData: MLConnection): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Saving ML connection for user:', user.id);

    const connectionData = {
      ...userData,
      user_id: user.id,
    };

    const { data: existingConnection, error: fetchError } = await supabase
      .from('mercadolivre_connections')
      .select()
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing connection:', fetchError);
      throw fetchError;
    }

    if (existingConnection) {
      const { error } = await supabase
        .from('mercadolivre_connections')
        .update(connectionData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating ML connection:', error);
        throw error;
      }
    } else {
      const { error } = await supabase
        .from('mercadolivre_connections')
        .insert([connectionData]);

      if (error) {
        console.error('Error inserting ML connection:', error);
        throw error;
      }
    }

    console.log('ML connection saved successfully');
  } catch (error) {
    console.error('Error in saveMLConnection:', error);
    throw error;
  }
};

export const getMLConnection = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user found');
      return null;
    }

    console.log('Fetching ML connection for user:', user.id);
    const { data, error } = await supabase
      .from('mercadolivre_connections')
      .select()
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching ML connection:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getMLConnection:', error);
    return null;
  }
};

export const deleteMLConnection = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Deleting ML connection for user:', user.id);
    const { error } = await supabase
      .from('mercadolivre_connections')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting ML connection:', error);
      throw error;
    }

    console.log('ML connection deleted successfully');
  } catch (error) {
    console.error('Error in deleteMLConnection:', error);
    throw error;
  }
};