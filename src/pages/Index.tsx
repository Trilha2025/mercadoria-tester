import StoreManager from "@/components/StoreManager";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Mercado Livre API Testing Environment
      </h1>

      <div className="max-w-4xl mx-auto">
        <StoreManager />
      </div>
    </div>
  );
};

export default Index;