import ApiTester from "@/components/ApiTester";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <h1 className="text-4xl font-bold text-center mb-8">
          Mercado Livre API Testing Environment
        </h1>
        <ApiTester />
      </div>
    </div>
  );
};

export default Index;