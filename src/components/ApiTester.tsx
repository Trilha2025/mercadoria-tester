import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const ApiTester = () => {
  const [endpoint, setEndpoint] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTest = async () => {
    if (!endpoint) {
      toast({
        title: "Error",
        description: "Please enter an endpoint",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setResponse(data);
      toast({
        title: "Success",
        description: "API call completed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data from API",
        variant: "destructive",
      });
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Mercado Livre API Tester</h2>
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Enter API endpoint"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleTest}
            disabled={loading}
            className="bg-meli-yellow hover:bg-meli-yellow/90 text-black"
          >
            {loading ? "Testing..." : "Test Endpoint"}
          </Button>
        </div>
        
        {response && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Response:</h3>
            <pre className="bg-meli-gray p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ApiTester;