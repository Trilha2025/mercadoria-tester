import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CompanyFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CompanyForm = ({ onClose, onSuccess }: CompanyFormProps) => {
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O nome da empresa é obrigatório",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('companies')
        .insert({
          company_name: companyName.trim(),
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Empresa cadastrada com sucesso",
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating company:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível cadastrar a empresa",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">Nova Empresa</h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            placeholder="Nome da empresa"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CompanyForm;