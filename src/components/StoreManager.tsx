import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Store, Building2, CheckCircle2, Loader2, TestTube2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import MLAuthButton from './mercadolivre/MLAuthButton';
import { useMercadoLivreAuth } from '@/hooks/useMercadoLivreAuth';
import { useNavigate } from 'react-router-dom';
import CompanyForm from './CompanyForm';

interface ManagedStore {
  id: string;
  store_name: string;
  is_active: boolean;
  ml_connection: {
    ml_nickname: string;
    ml_email: string;
  };
}

interface Company {
  id: string;
  company_name: string;
  is_active: boolean;
}

const StoreManager = () => {
  const [stores, setStores] = useState<ManagedStore[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, userData, checkConnection } = useMercadoLivreAuth();
  const navigate = useNavigate();

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as empresas",
      });
    }
  };

  const fetchStores = async () => {
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
        `);

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as lojas",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveStore = async (storeId: string) => {
    try {
      await supabase
        .from('managed_stores')
        .update({ is_active: false })
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
    fetchStores();
    fetchCompanies();
  }, []);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Store className="h-6 w-6" />
          Gerenciamento de Lojas
        </h2>
        {isAuthenticated && (
          <MLAuthButton 
            isAuthenticated={isAuthenticated}
            onLogout={async () => {
              await checkConnection();
              fetchStores();
            }}
            userData={userData}
          />
        )}
      </div>

      {!isAuthenticated ? (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Conecte-se ao Mercado Livre para gerenciar suas lojas
          </p>
          <MLAuthButton 
            isAuthenticated={isAuthenticated}
            onLogout={async () => {
              await checkConnection();
              fetchStores();
            }}
            userData={userData}
          />
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Empresas
              </h3>
              <Button
                onClick={() => setShowCompanyForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova Empresa
              </Button>
            </div>
            {showCompanyForm && (
              <CompanyForm
                onClose={() => setShowCompanyForm(false)}
                onSuccess={() => {
                  fetchCompanies();
                  setShowCompanyForm(false);
                }}
              />
            )}
            <div className="space-y-4">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{company.company_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {company.is_active ? 'Ativa' : 'Inativa'}
                    </p>
                  </div>
                </div>
              ))}
              {companies.length === 0 && !showCompanyForm && (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma empresa cadastrada.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
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
        </>
      )}
    </Card>
  );
};

export default StoreManager;