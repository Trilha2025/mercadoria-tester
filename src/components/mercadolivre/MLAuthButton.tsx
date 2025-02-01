import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { generateCodeChallenge } from '@/utils/mercadoLivre';
import { supabase } from "@/integrations/supabase/client";

interface MLAuthButtonProps {
  isAuthenticated: boolean;
  onLogout: () => Promise<void>;
  userData: any;
}

const MLAuthButton = ({ isAuthenticated, onLogout, userData }: MLAuthButtonProps) => {
  const { toast } = useToast();

  const handleAuth = async () => {
    try {
      const { verifier, challenge } = await generateCodeChallenge();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: existingConnection } = await supabase
        .from('mercadolivre_connections')
        .select()
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingConnection) {
        await supabase
          .from('mercadolivre_connections')
          .update({ code_verifier: verifier })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('mercadolivre_connections')
          .insert([{
            user_id: user.id,
            code_verifier: verifier,
            access_token: 'temporary',
            refresh_token: 'temporary',
            ml_user_id: 'temporary'
          }]);
      }
      
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