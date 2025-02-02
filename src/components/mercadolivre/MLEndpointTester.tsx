import { useState, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getMLConnection } from '@/utils/supabaseML';

interface MLEndpointTesterProps {
  storeId: string;
}

const MLEndpointTester = ({ storeId }: MLEndpointTesterProps) => {
  const [endpoint, setEndpoint] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTest = useCallback(async () => {
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
      const connection = await getMLConnection(storeId);
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (connection) {
        headers['Authorization'] = `Bearer ${connection.access_token}`;
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
  }, [endpoint, storeId, toast]);

  return (
    <>
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Digite o endpoint da API"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          className="flex-1"
        />
        <Button
          onClick={handleTest}
          disabled={loading}
          className="bg-meli-yellow hover:bg-meli-yellow/90 text-black"
        >
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
    </>
  );
};

export default MLEndpointTester;