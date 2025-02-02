import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Building2, ArrowLeft, Link } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import MLAuthButton from '@/components/mercadolivre/MLAuthButton';
import { useMercadoLivreAuth } from '@/hooks/useMercadoLivreAuth';

interface Company {
  id: string;
  company_name: string;
  is_active: boolean;
}

const CompanyManagementPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated, userData, checkConnection } = useMercadoLivreAuth(companyId);

  useEffect(() => {
    fetchCompany();
  }, [companyId]);

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
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CompanyManagementPage;