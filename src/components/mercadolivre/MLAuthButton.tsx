import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { initializeAuth, disconnectMercadoLivre } from '@/services/mercadoLivre';

interface MLAuthButtonProps {
  isAuthenticated: boolean;
  onLogout: () => Promise<void>;
  userData: any;
}

const MLAuthButton = ({ isAuthenticated, onLogout, userData }: MLAuthButtonProps) => {
  const { toast } = useToast();

  const handleAuth = async () => {
    try {
      const { authUrl } = await initializeAuth();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error in authentication:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha no processo de autenticação",
        variant: "destructive",
      });
    }
  };

  if (isAuthenticated) {
    return (
      <>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-green-800">
            Conectado como: {userData?.nickname || userData?.email || 'Carregando...'}
          </p>
        </div>
        <Button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white mb-4 w-full"
        >
          Desconectar do Mercado Livre
        </Button>
      </>
    );
  }

  return (
    <Button
      onClick={handleAuth}
      className="bg-meli-yellow hover:bg-meli-yellow/90 text-black mb-4 w-full"
    >
      Autenticar com Mercado Livre
    </Button>
  );
};

export default MLAuthButton;