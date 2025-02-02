import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Building2, Loader2, Plus, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import CompanyForm from './CompanyForm';
import type { Company } from '@/types/mercadoLivre';

const StoreManager = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          ml_connection:mercadolivre_connections(
            id,
            ml_user_id,
            ml_nickname,
            ml_email,
            access_token,
            refresh_token
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCompanies: Company[] = (data || []).map(company => ({
        id: company.id,
        company_name: company.company_name,
        is_active: company.is_active,
        ml_connection: company.ml_connection?.[0] || null
      }));

      setCompanies(formattedCompanies);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as empresas",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageCompany = (companyId: string) => {
    navigate(`/company/${companyId}`);
  };

  useEffect(() => {
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
                  {company.ml_connection ? 'Ativa' : 'Inativa'}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => handleManageCompany(company.id)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Gerenciar
              </Button>
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
    </Card>
  );
};

export default StoreManager;