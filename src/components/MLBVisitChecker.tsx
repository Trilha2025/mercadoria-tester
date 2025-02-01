import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Search } from "lucide-react";

const MLBVisitChecker = () => {
  const [mlbId, setMlbId] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheck = async () => {
    if (!mlbId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, insira um MLB ID",
      });
      return;
    }

    const accessToken = localStorage.getItem('ml_access_token');
    if (!accessToken) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, conecte sua conta do Mercado Livre primeiro",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://api.mercadolibre.com/visits/items?ids=${mlbId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar dados de visitas');
      }

      const data = await response.json();
      const visits = data[mlbId] || 0;

      toast({
        title: "Sucesso",
        description: `O item ${mlbId} tem ${visits} visitas`,
      });
    } catch (error) {
      console.error('Erro ao verificar visitas:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao buscar informações de visitas",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Search className="h-6 w-6" />
        Verificar Visitas MLB
      </h2>
      
      <div className="flex gap-4">
        <Input
          placeholder="Digite o MLB ID (ex: MLB1234567)"
          value={mlbId}
          onChange={(e) => setMlbId(e.target.value)}
          className="flex-1"
        />
        <Button
          onClick={handleCheck}
          disabled={loading}
          className="bg-meli-yellow hover:bg-meli-yellow/90 text-black"
        >
          {loading ? "Verificando..." : "Verificar"}
        </Button>
      </div>
    </div>
  );
};

export default MLBVisitChecker;