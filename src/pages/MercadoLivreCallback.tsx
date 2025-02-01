import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { exchangeCodeForToken } from '@/utils/mercadoLivre';
import { saveMLConnection } from '@/utils/supabaseML';
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const MercadoLivreCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const validateConnection = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error || !code) {
        console.error('Erro de autenticação:', errorDescription);
        setStatus('error');
        setErrorMessage(errorDescription || 'Ocorreu um erro durante a autenticação');
        toast({
          variant: "destructive",
          title: "Erro de Autenticação",
          description: errorDescription || "Falha ao autenticar com o Mercado Livre",
        });
        return;
      }

      try {
        // Get user and code_verifier
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        console.log('Buscando conexão do ML para o usuário:', user.id);
        const { data: connection, error: connectionError } = await supabase
          .from('mercadolivre_connections')
          .select('code_verifier')
          .eq('user_id', user.id)
          .maybeSingle();

        if (connectionError) {
          console.error('Erro ao buscar conexão:', connectionError);
          throw new Error('Erro ao buscar conexão com Mercado Livre');
        }

        if (!connection?.code_verifier) {
          console.error('Code verifier não encontrado na conexão:', connection);
          throw new Error('Code verifier não encontrado. Por favor, tente conectar novamente.');
        }

        console.log('Iniciando troca de código por token...');
        const tokenData = await exchangeCodeForToken(code, connection.code_verifier);
        console.log('Resposta da troca de token:', tokenData);
        
        if (!tokenData || !tokenData.access_token) {
          throw new Error('Token de acesso não recebido');
        }

        // Validar token fazendo uma requisição de teste
        const userResponse = await fetch('https://api.mercadolibre.com/users/me', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        });

        if (!userResponse.ok) {
          console.error('Erro na resposta da API:', await userResponse.text());
          throw new Error('Falha ao validar token');
        }

        const userData = await userResponse.json();
        console.log('Dados do usuário recebidos:', userData);
        
        // Salvar dados no Supabase
        await saveMLConnection({
          ml_user_id: userData.id,
          ml_nickname: userData.nickname,
          ml_email: userData.email,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
        });

        console.log('Conexão salva com sucesso');
        
        setStatus('success');
        toast({
          title: "Sucesso",
          description: `Conectado como ${userData.nickname}`,
        });

        // Aguardar 3 segundos antes de redirecionar
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (error) {
        console.error('Erro detalhado durante autenticação:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido ocorreu');
        toast({
          variant: "destructive",
          title: "Erro de Autenticação",
          description: error instanceof Error ? error.message : "Falha ao completar processo de autenticação",
        });
      }
    };

    validateConnection();
  }, [location, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-6">
        {status === 'loading' && (
          <div className="text-center space-y-4">
            <Loader className="h-12 w-12 animate-spin mx-auto text-meli-yellow" />
            <h2 className="text-2xl font-semibold">Autenticando...</h2>
            <p className="text-gray-600">Aguarde enquanto conectamos sua conta</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-2xl font-semibold text-green-600">Conectado com Sucesso!</h2>
            <p className="text-gray-600">Redirecionando para a página inicial...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-2xl font-semibold text-red-600">Falha na Autenticação</h2>
            <p className="text-gray-600">{errorMessage}</p>
            <Button 
              onClick={() => navigate('/')}
              className="mt-4"
            >
              Voltar para a Página Inicial
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MercadoLivreCallback;