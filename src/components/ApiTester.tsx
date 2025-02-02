import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { disconnectMercadoLivre } from '@/services/mercadoLivre';
import MLAuthButton from './mercadolivre/MLAuthButton';
import { useMercadoLivreAuth } from '@/hooks/useMercadoLivreAuth';
import { useCallback, useState } from 'react';
import { TestTube2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
        description: "Desconectado do Mercado Livre",
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível desconectar",
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
      const { data: connection, error } = await supabase
        .from('mercadolivre_connections')
        .select('access_token')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !connection) {
        throw new Error('No valid ML connection found');
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${connection.access_token}`
      };

      const res = await fetch(endpoint, { headers });
      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }
      
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
        <h2 className="text-2xl font-bold mb-6">Testar API do Mercado Livre</h2>
        
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