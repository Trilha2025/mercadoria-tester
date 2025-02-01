import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { exchangeCodeForToken } from '@/utils/mercadoLivre';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader, CheckCircle, XCircle, AlertCircle, LogOut, Search } from "lucide-react";

const MercadoLivreCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null);
  const [mlbId, setMlbId] = useState('');
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error || !code) {
        console.error('Erro na autenticação:', errorDescription);
        setAuthStatus('error');
        setAuthError(errorDescription || 'Ocorreu um erro durante a autenticação');
        toast({
          title: "Erro na autenticação",
          description: errorDescription || "Ocorreu um erro durante a autenticação",
          variant: "destructive",
        });
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        const verifier = localStorage.getItem('code_verifier');
        if (!verifier) {
          throw new Error('Code verifier não encontrado');
        }

        const tokenData = await exchangeCodeForToken(code, verifier);
        if (!tokenData || !tokenData.access_token) {
          throw new Error('Token de acesso não recebido');
        }

        localStorage.setItem('ml_access_token', tokenData.access_token);
        localStorage.setItem('ml_refresh_token', tokenData.refresh_token);
        
        // Buscar dados do usuário
        const userResponse = await fetch('https://api.mercadolibre.com/users/me', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error('Falha ao buscar dados do usuário');
        }

        const userData = await userResponse.json();
        setUserData(userData);
        setAuthStatus('success');
        
        toast({
          title: "Sucesso",
          description: "Autenticação realizada com sucesso!",
        });
      } catch (error) {
        console.error('Erro ao trocar código por token:', error);
        setAuthStatus('error');
        setAuthError(error instanceof Error ? error.message : 'Erro desconhecido');
        toast({
          title: "Erro",
          description: "Falha ao completar autenticação",
          variant: "destructive",
        });
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [location, navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem('ml_access_token');
    localStorage.removeItem('ml_refresh_token');
    localStorage.removeItem('code_verifier');
    toast({
      title: "Sucesso",
      description: "Desconectado com sucesso",
    });
    navigate('/');
  };

  const handleSearchVisits = async () => {
    if (!mlbId) {
      toast({
        title: "Erro",
        description: "Por favor, insira um MLB ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const accessToken = localStorage.getItem('ml_access_token');
      const response = await fetch(`https://api.mercadolibre.com/items/${mlbId}/visits`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Falha ao buscar visitas');
      }

      const data = await response.json();
      setVisitCount(data.total_visits || 0);
      toast({
        title: "Sucesso",
        description: "Visitas consultadas com sucesso",
      });
    } catch (error) {
      console.error('Erro ao buscar visitas:', error);
      toast({
        title: "Erro",
        description: "Falha ao buscar número de visitas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="h-12 w-12 animate-spin mx-auto text-meli-yellow" />
          <h2 className="text-2xl font-semibold">Processando autenticação...</h2>
        </div>
      </div>
    );
  }

  if (authStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-semibold text-red-500">Erro na autenticação</h2>
          <p className="text-gray-600">{authError}</p>
          <p className="text-sm text-gray-500">Redirecionando para a página inicial...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="h-12 w-12 animate-spin mx-auto text-meli-yellow" />
          <h2 className="text-2xl font-semibold">Carregando dados do usuário...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl mx-auto">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-semibold">
                {userData.nickname || userData.email}
              </h2>
            </div>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Desconectar
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Consultar Visitas MLB</h3>
              <div className="flex gap-4">
                <Input
                  placeholder="Digite o MLB ID (ex: MLB123456789)"
                  value={mlbId}
                  onChange={(e) => setMlbId(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleSearchVisits}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {loading ? "Buscando..." : "Buscar Visitas"}
                </Button>
              </div>
            </div>

            {visitCount !== null && (
              <div className="bg-meli-gray p-4 rounded-lg">
                <p className="text-lg">
                  Total de visitas para {mlbId}: <strong>{visitCount}</strong>
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MercadoLivreCallback;