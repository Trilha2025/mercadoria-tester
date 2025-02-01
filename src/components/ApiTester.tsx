import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { generateCodeChallenge, exchangeCodeForToken, getUserData, refreshToken } from '@/utils/mercadoLivre';

const ApiTester = () => {
  const [endpoint, setEndpoint] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const accessToken = localStorage.getItem('ml_access_token');
    setIsAuthenticated(!!accessToken);
  }, []);

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
      toast({
        title: "Erro",
        description: "Falha ao buscar dados da API",
        variant: "destructive",
      });
      console.error('Erro na API:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    try {
      const { verifier, challenge } = await generateCodeChallenge();
      localStorage.setItem('code_verifier', verifier);
      
      const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${import.meta.env.VITE_ML_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_ML_REDIRECT_URI}&code_challenge_method=S256&code_challenge=${challenge}`;
      
      window.location.href = authUrl;
    } catch (error) {
      console.error('Erro na autenticação:', error);
      toast({
        title: "Erro",
        description: "Falha no processo de autenticação",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ml_access_token');
    localStorage.removeItem('ml_refresh_token');
    localStorage.removeItem('code_verifier');
    setIsAuthenticated(false);
    toast({
      title: "Sucesso",
      description: "Desconectado com sucesso",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Mercado Livre API Tester</h2>
        
        <div className="mb-6">
          {isAuthenticated ? (
            <Button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white mb-4 w-full"
            >
              Desconectar do Mercado Livre
            </Button>
          ) : (
            <Button
              onClick={handleAuth}
              className="bg-meli-yellow hover:bg-meli-yellow/90 text-black mb-4 w-full"
            >
              Autenticar com Mercado Livre
            </Button>
          )}
        </div>

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
      </Card>
    </div>
  );
};

export default ApiTester;