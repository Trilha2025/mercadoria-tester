import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { disconnectMercadoLivre } from '@/services/mercadoLivre';
import MLAuthButton from './mercadolivre/MLAuthButton';
import { useMercadoLivreAuth } from '@/hooks/useMercadoLivreAuth';
import { useCallback, useState } from 'react';
import { Link, TestTube2 } from "lucide-react";

const ApiTester = () => {
  const { toast } = useToast();
  const [endpoint, setEndpoint] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, userData, checkConnection } = useMercadoLivreAuth();

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

  const handleTest = async () => {
    if (!endpoint) {
      toast({
        title: "Erro",
        description: "Por favor, insira um endpoint",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const accessToken = localStorage.getItem('ml_access_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const res = await fetch(endpoint, { headers });
      const data = await res.json();
      setResponse(data);
      toast({
        title: "Sucesso",
        description: "Chamada à API completada com sucesso",
      });
    } catch (error) {
      console.error('Erro na API:', error);
      toast({
        title: "Erro",
        description: "Falha ao buscar dados da API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Digite o endpoint da API"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleTest}
              disabled={loading}
              className="bg-meli-yellow hover:bg-meli-yellow/90 text-black flex items-center gap-2"
            >
              <TestTube2 className="h-4 w-4" />
              {loading ? "Testando..." : "Testar Endpoint"}
            </Button>
          </div>
          
          {response && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Resposta:</h3>
              <pre className="bg-meli-gray p-4 rounded-lg overflow-auto max-h-96">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ApiTester;