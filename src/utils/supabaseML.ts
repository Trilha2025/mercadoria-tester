import { supabase } from "@/integrations/supabase/client";
import type { MLConnection } from "@/types/mercadoLivre";

export const saveMLConnection = async (userData: MLConnection, companyId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Saving ML connection for company:', companyId);

    const connectionData = {
      ...userData,
      user_id: user.id,
      company_id: companyId
    };

    const { data: existingConnection, error: fetchError } = await supabase
      .from('mercadolivre_connections')
      .select()
      .eq('company_id', companyId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing connection:', fetchError);
      throw fetchError;
    }

    if (existingConnection) {
      const { error } = await supabase
        .from('mercadolivre_connections')
        .update(connectionData)
        .eq('company_id', companyId);

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

export const getMLConnection = async (companyId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user found');
      return null;
    }

    console.log('Fetching ML connection for company:', companyId);
    const { data, error } = await supabase
      .from('mercadolivre_connections')
      .select()
      .eq('company_id', companyId)
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

export const deleteMLConnection = async (companyId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Deleting ML connection for company:', companyId);
    const { error } = await supabase
      .from('mercadolivre_connections')
      .delete()
      .eq('company_id', companyId);

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