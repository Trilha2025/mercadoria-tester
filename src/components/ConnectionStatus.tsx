import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { User, LogOut } from "lucide-react";

const ConnectionStatus = () => {
  const [userData, setUserData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const accessToken = localStorage.getItem('ml_access_token');
    console.log("Checking connection status - Token present:", !!accessToken);
    
    if (!accessToken) {
      console.log("No access token found");
      return;
    }

    try {
      const response = await fetch('https://api.mercadolibre.com/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
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
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ml_access_token');
    localStorage.removeItem('ml_refresh_token');
    localStorage.removeItem('code_verifier');
    setUserData(null);
    toast({
      title: "Desconectado",
      description: "Sua conta foi desconectada com sucesso",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <User className="h-6 w-6" />
        Status da Conexão
      </h2>
      
      {userData ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              Conectado como: <span className="font-semibold">{userData.nickname}</span>
            </p>
            <p className="text-sm text-green-600 mt-1">
              ID: {userData.id}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Desconectar
          </Button>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Nenhuma conta conectada
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;