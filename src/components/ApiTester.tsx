import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { disconnectMercadoLivre } from '@/services/mercadoLivre';
import MLAuthButton from './mercadolivre/MLAuthButton';
import MLEndpointTester from './mercadolivre/MLEndpointTester';
import { useMercadoLivreAuth } from '@/hooks/useMercadoLivreAuth';

const ApiTester = () => {
  const { isAuthenticated, userData, checkConnection } = useMercadoLivreAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
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
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Mercado Livre API Tester</h2>
        
        <div className="mb-6">
          <MLAuthButton 
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
            userData={userData}
          />
        </div>

        <MLEndpointTester />
      </Card>
    </div>
  );
};

export default ApiTester;