import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { MLUser } from "@/types/mercadoLivre";

interface UseMercadoLivreAuthReturn {
  isAuthenticated: boolean;
  userData: MLUser | null;
  checkConnection: () => Promise<void>;
}

export const useMercadoLivreAuth = (companyId?: string): UseMercadoLivreAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<MLUser | null>(null);

  useEffect(() => {
    if (companyId) {
      checkConnection();
    }
  }, [companyId]);

  const checkConnection = async () => {
    if (!companyId) {
      console.log('No company ID provided');
      setIsAuthenticated(false);
      setUserData(null);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        setIsAuthenticated(false);
        setUserData(null);
        return;
      }

      console.log('Checking ML connection for company:', companyId);
      const { data: connection, error } = await supabase
        .from('mercadolivre_connections')
        .select()
        .eq('company_id', companyId)
        .neq('access_token', 'pending')
        .maybeSingle();

      if (error) {
        console.error('Error fetching ML connection:', error);
        setIsAuthenticated(false);
        setUserData(null);
        return;
      }

      if (!connection?.access_token) {
        setIsAuthenticated(false);
        setUserData(null);
        return;
      }

      try {
        const userResponse = await fetch('https://api.mercadolibre.com/users/me', {
          headers: {
            'Authorization': `Bearer ${connection.access_token}`
          }
        });
        
        if (!userResponse.ok) {
          console.error('Error response from ML API:', await userResponse.text());
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await userResponse.json();
        setIsAuthenticated(true);
        setUserData(userData);
      } catch (error) {
        console.error('Error fetching ML user data:', error);
        setIsAuthenticated(false);
        setUserData(null);
        
        // If we get a 401, the token is invalid or expired
        if (error instanceof Error && error.message.includes('401')) {
          // Clear the invalid connection
          await supabase
            .from('mercadolivre_connections')
            .delete()
            .eq('company_id', companyId);
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsAuthenticated(false);
      setUserData(null);
    }
  };

  return {
    isAuthenticated,
    userData,
    checkConnection
  };
};