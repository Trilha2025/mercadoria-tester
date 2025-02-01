import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { MLUser } from "@/types/mercadoLivre";

interface UseMercadoLivreAuthReturn {
  isAuthenticated: boolean;
  userData: MLUser | null;
  checkConnection: () => Promise<void>;
}

export const useMercadoLivreAuth = (): UseMercadoLivreAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<MLUser | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        return;
      }

      console.log('Checking ML connection for user:', user.id);
      const { data: connection, error } = await supabase
        .from('mercadolivre_connections')
        .select()
        .eq('user_id', user.id)
        .neq('access_token', 'pending')
        .maybeSingle();

      if (error) {
        console.error('Error fetching ML connection:', error);
        return;
      }

      if (connection?.access_token) {
        setIsAuthenticated(true);
        try {
          const userResponse = await fetch('https://api.mercadolibre.com/users/me', {
            headers: {
              'Authorization': `Bearer ${connection.access_token}`
            }
          });
          
          if (!userResponse.ok) {
            throw new Error('Failed to fetch user data');
          }
          
          const userData = await userResponse.json();
          setUserData(userData);
        } catch (error) {
          console.error('Error fetching ML user data:', error);
          setIsAuthenticated(false);
          setUserData(null);
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  return {
    isAuthenticated,
    userData,
    checkConnection
  };
};