import { useParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import MLEndpointTester from '@/components/mercadolivre/MLEndpointTester';
import MLAuthButton from '@/components/mercadolivre/MLAuthButton';
import { useMercadoLivreAuth } from '@/hooks/useMercadoLivreAuth';
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

const ApiTesterPage = () => {
  const { storeId } = useParams();
  const [storeName, setStoreName] = useState('');
  const { isAuthenticated, userData, checkConnection } = useMercadoLivreAuth();

  useEffect(() => {
    const fetchStoreName = async () => {
      if (storeId) {
        const { data, error } = await supabase
          .from('managed_stores')
          .select('store_name')
          .eq('id', storeId)
          .single();

        if (!error && data) {
          setStoreName(data.store_name);
        }
      }
    };

    fetchStoreName();
  }, [storeId]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          Mercado Livre API Tester
        </h1>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Testando API para: {storeName}</h2>
          
          <div className="mb-6">
            <MLAuthButton 
              isAuthenticated={isAuthenticated}
              onLogout={checkConnection}
              userData={userData}
            />
          </div>

          <MLEndpointTester />
        </Card>
      </div>
    </div>
  );
};

export default ApiTesterPage;