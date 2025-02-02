import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Building2, ArrowLeft, Link, Store, TestTube2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import MLAuthButton from '@/components/mercadolivre/MLAuthButton';
import { useMercadoLivreAuth } from '@/hooks/useMercadoLivreAuth';

interface Company {
  id: string;
  company_name: string;
  is_active: boolean;
}

interface ManagedStore {
  id: string;
  store_name: string;
  is_active: boolean;
  ml_connection: {
    ml_nickname: string;
    ml_email: string;
  };
}

const CompanyManagementPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [stores, setStores] = useState<ManagedStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated, userData, checkConnection } = useMercadoLivreAuth(companyId);

  const fetchCompany = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (error) throw error;
      setCompany(data);
    } catch (error) {
      console.error('Error fetching company:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados da empresa",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStores = async () => {
    if (!companyId) return;
    
    try {
      const { data, error } = await supabase
        .from('managed_stores')
        .select(`
          id,
          store_name,
          is_active,
          ml_connection:mercadolivre_connections (
            ml_nickname,
            ml_email
          )
        `)
        .eq('company_id', companyId);

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as lojas",
      });
    }
  };

  const setActiveStore = async (storeId: string) => {
    try {
      await supabase
        .from('managed_stores')
        .update({ is_active: false })
        .eq('company_id', companyId)
        .neq('id', storeId);

      const { error } = await supabase
        .from('managed_stores')
        .update({ is_active: true })
        .eq('id', storeId);

      if (error) throw error;

      fetchStores();
      
      toast({
        title: "Loja Ativa",
        description: "A loja selecionada está agora ativa",
      });
    } catch (error) {
      console.error('Error setting active store:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível ativar a loja",
      });
    }
  };

  useEffect(() => {
    fetchCompany();
    fetchStores();
  }, [companyId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <p>Carregando...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <p>Empresa não encontrada</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Voltar
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/')}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                {company.company_name}
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-accent/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Link className="h-5 w-5" />
                Conexão com Mercado Livre
              </h3>
              <MLAuthButton
                isAuthenticated={isAuthenticated}
                onLogout={async () => {
                  await checkConnection();
                }}
                userData={userData}
                companyId={company.id}
              />
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Store className="h-5 w-5" />
                Lojas
              </h3>
              <div className="space-y-4">
                {stores.map((store) => (
                  <div
                    key={store.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <h3 className="font-medium">{store.store_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {store.ml_connection.ml_nickname || store.ml_connection.ml_email}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/api-tester/${store.id}`)}
                        className="flex items-center gap-2"
                      >
                        <TestTube2 className="h-4 w-4" />
                        Gerenciar
                      </Button>
                      {store.is_active ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="text-sm font-medium">Ativa</span>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setActiveStore(store.id)}
                        >
                          Ativar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {stores.length === 0 && (
                  <div className="text-center py-8">
                    <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Nenhuma loja conectada.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CompanyManagementPage;