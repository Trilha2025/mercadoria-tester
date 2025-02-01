import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useMercadoLivreAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const { toast } = useToast();

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
        const userResponse = await fetch('https://api.mercadolibre.com/users/me', {
          headers: {
            'Authorization': `Bearer ${connection.access_token}`
          }
        });
        const userData = await userResponse.json();
        setUserData(userData);
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