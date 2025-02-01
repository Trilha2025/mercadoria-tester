import { useState, useEffect } from "react";
import ApiTester from "@/components/ApiTester";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { User, Search } from "lucide-react";

const Index = () => {
  const [mlbId, setMlbId] = useState("");
  const [accountName, setAccountName] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const accessToken = localStorage.getItem("ml_access_token");
        if (!accessToken) {
          setAccountName(null);
          return;
        }

        const response = await fetch("https://api.mercadolibre.com/users/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        setAccountName(userData.nickname);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch account information",
        });
      }
    };

    fetchUserData();
  }, [toast]);

  const handleVisitCheck = async () => {
    if (!mlbId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an MLB ID",
      });
      return;
    }

    try {
      const accessToken = localStorage.getItem("ml_access_token");
      if (!accessToken) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please connect your Mercado Livre account first",
        });
        return;
      }

      const response = await fetch(`https://api.mercadolibre.com/visits/items?ids=${mlbId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch visit data");
      }

      const visitData = await response.json();
      const visits = visitData[mlbId] || 0;

      toast({
        title: "Visit Count",
        description: `The item ${mlbId} has ${visits} visits`,
      });
    } catch (error) {
      console.error("Error checking visits:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch visit information",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          Mercado Livre API Testing Environment
        </h1>

        {/* Connected Account Display */}
        <div className="bg-white rounded-lg shadow p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-gray-600">Connected Account:</span>
            <span className="font-semibold">
              {accountName || "Not connected"}
            </span>
          </div>
          {accountName && (
            <Button
              variant="destructive"
              onClick={() => {
                localStorage.removeItem("ml_access_token");
                setAccountName(null);
                toast({
                  title: "Disconnected",
                  description: "Successfully disconnected from Mercado Livre",
                });
              }}
            >
              Disconnect
            </Button>
          )}
        </div>

        {/* MLB Visit Check Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Search className="h-5 w-5" />
            Check MLB Visit Count
          </h2>
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Enter MLB ID (e.g., MLB1234567)"
              value={mlbId}
              onChange={(e) => setMlbId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleVisitCheck}>
              Check Visits
            </Button>
          </div>
        </div>

        <ApiTester />
      </div>
    </div>
  );
};

export default Index;