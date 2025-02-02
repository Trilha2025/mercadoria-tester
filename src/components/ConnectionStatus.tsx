import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { User } from "lucide-react";

const ConnectionStatus = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    const accessToken = localStorage.getItem('ml_access_token');
    console.log("Checking connection status - Token present:", !!accessToken);
    
    if (!accessToken) {
      console.log("No access token found");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Fetching user data with token:", accessToken);
      const response = await fetch('https://api.mercadolibre.com/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        console.error("Error response from API:", response.status);
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      console.log("Connected user data:", data);
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('ml_access_token');
      localStorage.removeItem('ml_refresh_token');
      setUserData(null);
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Não foi possível verificar sua conexão com o Mercado Livre",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <User className="h-6 w-6" />
          Status da Conexão
        </h2>
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-meli-yellow"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <User className="h-6 w-6" />
        Status da Conexão
      </h2>
      
      {userData ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">
              Conta Conectada
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Nenhuma conta conectada
          </p>
          <p className="text-sm text-yellow-600 mt-1">
            Conecte sua conta do Mercado Livre para começar
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;