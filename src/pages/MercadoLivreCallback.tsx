import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { exchangeCodeForToken } from '@/utils/mercadoLivre';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { LogOut, Search, User } from "lucide-react";

const MercadoLivreCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null);
  const [mlbId, setMlbId] = useState('');
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error || !code) {
        console.error('Erro na autenticação:', errorDescription);
        toast({
          title: "Erro na autenticação",
          description: errorDescription || "Ocorreu um erro durante a autenticação",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      try {
        const verifier = localStorage.getItem('code_verifier');
        if (!verifier) {
          throw new Error('Code verifier não encontrado');
        }

        const tokenData = await exchangeCodeForToken(code, verifier);
        localStorage.setItem('ml_access_token', tokenData.access_token);
        localStorage.setItem('ml_refresh_token', tokenData.refresh_token);
        
        // Buscar dados do usuário
        const userResponse = await fetch('https://api.mercadolibre.com/users/me', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        });
        const userData = await userResponse.json();
        setUserData(userData);
        
        toast({
          title: "Sucesso",
          description: "Autenticação realizada com sucesso!",
        });
      } catch (error) {
        console.error('Erro ao trocar código por token:', error);
        toast({
          title: "Erro",
          description: "Falha ao completar autenticação",
          variant: "destructive",
        });
        navigate('/');
      }
    };

    if (!userData) {
      handleCallback();
    }
  }, [location, navigate, toast, userData]);

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

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Processando autenticação...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
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
              <User className="h-6 w-6" />
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
                  <Search className="h-4 w-4" />
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