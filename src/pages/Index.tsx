import { Button } from "@/components/ui/button";
import { handleAuth } from "@/utils/mercadoLivreAuth";
import { useToast } from "@/components/ui/use-toast";
import ApiTester from "@/components/ApiTester";
import StoreManager from "@/components/StoreManager";

const Index = () => {
  const { toast } = useToast();

  const startAuth = async () => {
    try {
      await handleAuth();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao iniciar processo de autenticação",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          Mercado Livre API Testing Environment
        </h1>

        <StoreManager />
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <Button
            onClick={startAuth}
            className="bg-meli-yellow hover:bg-meli-yellow/90 text-black w-full"
          >
            Conectar com Mercado Livre
          </Button>
        </div>

        <ApiTester />
      </div>
    </div>
  );
};

export default Index;