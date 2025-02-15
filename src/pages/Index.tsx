
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-bold">MELI Tester</h2>
          <div className="hidden md:flex space-x-6">
            <a href="#features" className="hover:text-gray-300">Recursos</a>
            <a href="#docs" className="hover:text-gray-300">Documentação</a>
            <a href="#community" className="hover:text-gray-300">Comunidade</a>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/auth">
            <Button variant="outline" className="text-white border-white hover:bg-white/10">
              Login
            </Button>
          </Link>
          <Link to="/auth">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
              Começar
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-col items-center text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Ambiente de Testes
            <br />
            para suas lojas
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-8">
            MELI Tester é uma plataforma completa para testar e gerenciar suas integrações com a API do Mercado Livre.
          </p>
          <Link to="/auth">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-500 text-lg px-8 py-6">
              Experimente Gratuitamente →
            </Button>
          </Link>
        </div>

        {/* Preview Image */}
        <div className="relative rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent pointer-events-none"></div>
          <img 
            src="/lovable-uploads/a494f3e8-4e7b-4a0b-933b-0825068fb89f.png" 
            alt="Interface Preview" 
            className="w-full"
          />
        </div>

        {/* Features Section */}
        <div className="mt-20 text-center">
          <p className="text-sm text-gray-400">Tudo que você precisa para testar suas integrações:</p>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-gray-300">
            <span>Gerenciador de Lojas</span>
            <span>•</span>
            <span>Testes de API</span>
            <span>•</span>
            <span>Autenticação OAuth</span>
            <span>•</span>
            <span>Validador de Links</span>
            <span>•</span>
            <span>Documentação</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
