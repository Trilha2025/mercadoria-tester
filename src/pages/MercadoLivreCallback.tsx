import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { exchangeCodeForToken } from '@/utils/mercadoLivre';
import { useToast } from "@/components/ui/use-toast";

const MercadoLivreCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

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
        
        toast({
          title: "Sucesso",
          description: "Autenticação realizada com sucesso!",
        });
        
        navigate('/');
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

    handleCallback();
  }, [location, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Processando autenticação...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
};

export default MercadoLivreCallback;