import { useParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import MLEndpointTester from '@/components/mercadolivre/MLEndpointTester';
import MLAuthButton from '@/components/mercadolivre/MLAuthButton';
import { useMercadoLivreAuth } from '@/hooks/useMercadoLivreAuth';
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ApiSidebar } from "@/components/api/ApiSidebar";

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <ApiSidebar storeName={storeName} />
        <main className="flex-1 p-8">
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
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ApiTesterPage;