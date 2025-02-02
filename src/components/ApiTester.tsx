import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { disconnectMercadoLivre } from '@/services/mercadoLivre';
import MLAuthButton from './mercadolivre/MLAuthButton';
import MLEndpointTester from './mercadolivre/MLEndpointTester';
import { useMercadoLivreAuth } from '@/hooks/useMercadoLivreAuth';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';

const ApiTester = () => {
  const { storeId } = useParams();
  const { toast } = useToast();
  const { isAuthenticated, userData, checkConnection } = useMercadoLivreAuth(storeId);

  const handleLogout = useCallback(async () => {
    try {
      await disconnectMercadoLivre();
      await checkConnection();
      toast({
        title: "Sucesso",
        description: "Desconectado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast({
        title: "Erro",
        description: "Falha ao desconectar",
        variant: "destructive",
      });
    }
  }, [checkConnection, toast]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Mercado Livre API Tester</h2>
        
        <div className="mb-6">
          <MLAuthButton 
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
            userData={userData}
            companyId={storeId || ''}
          />
        </div>

        <MLEndpointTester storeId={storeId || ''} />
      </Card>
    </div>
  );
};

export default ApiTester;