import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { deleteMLConnection, getMLConnection } from '@/utils/supabaseML';
import { useToast } from "@/components/ui/use-toast";
import MLAuthButton from './mercadolivre/MLAuthButton';
import MLEndpointTester from './mercadolivre/MLEndpointTester';

const ApiTester = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const connection = await getMLConnection();
      if (connection) {
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
      console.error('Erro ao verificar conexão:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await deleteMLConnection();
      setIsAuthenticated(false);
      setUserData(null);
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