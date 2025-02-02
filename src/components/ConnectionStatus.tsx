import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ConnectionStatus = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No authenticated user");
        setIsLoading(false);
        return;
      }

      console.log("Checking ML connection for user:", user.id);
      const { data: connection, error: connectionError } = await supabase
        .from('mercadolivre_connections')
        .select('access_token')
        .eq('user_id', user.id)
        .single();

      if (connectionError || !connection?.access_token) {
        console.log("No valid ML connection found");
        setIsLoading(false);
        return;
      }

      console.log("Fetching user data with token");
      const response = await fetch('https://api.mercadolibre.com/users/me', {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`
        }
      });

      if (!response.ok) {
        console.error("Error response from API:", response.status);
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      console.log("Connected user data:", data);
      setUserData(data);
      toast({
        title: "Conectado",
        description: `Conectado como ${data.nickname}`,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Não foi possível verificar sua conexão com o Mercado Livre",
      });

      // If we get a 401, clear the invalid connection
      if (error instanceof Error && error.message.includes('401')) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('mercadolivre_connections')
            .delete()
            .eq('user_id', user.id);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('mercadolivre_connections')
          .delete()
          .eq('user_id', user.id);
      }
      setUserData(null);
      toast({
        title: "Desconectado",
        description: "Sua conta foi desconectada com sucesso",
      });
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível desconectar sua conta",
      });
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
            <div className="mt-2 space-y-1">
              <p className="text-green-700">
                Nome: <span className="font-semibold">{userData.nickname}</span>
              </p>
              <p className="text-sm text-green-600">
                ID da conta: {userData.id}
              </p>
              {userData.email && (
                <p className="text-sm text-green-600">
                  Email: {userData.email}
                </p>
              )}
            </div>
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
          <p className="text-sm text-yellow-600 mt-1">
            Conecte sua conta do Mercado Livre para começar
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;