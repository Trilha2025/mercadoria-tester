import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { exchangeCodeForToken } from '@/utils/mercadoLivre';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader, CheckCircle, XCircle } from "lucide-react";

const MercadoLivreCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error || !code) {
        console.error('Authentication error:', errorDescription);
        setStatus('error');
        setErrorMessage(errorDescription || 'An error occurred during authentication');
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: errorDescription || "Failed to authenticate with Mercado Livre",
        });
        return;
      }

      try {
        const verifier = localStorage.getItem('code_verifier');
        if (!verifier) {
          throw new Error('Code verifier not found');
        }

        console.log('Exchanging code for token...');
        const tokenData = await exchangeCodeForToken(code, verifier);
        
        if (!tokenData || !tokenData.access_token) {
          throw new Error('No access token received');
        }

        console.log('Token received successfully');
        localStorage.setItem('ml_access_token', tokenData.access_token);
        if (tokenData.refresh_token) {
          localStorage.setItem('ml_refresh_token', tokenData.refresh_token);
        }

        // Validate token by making a test request
        const userResponse = await fetch('https://api.mercadolibre.com/users/me', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error('Failed to validate token');
        }

        const userData = await userResponse.json();
        console.log('Successfully authenticated as:', userData.nickname);
        
        setStatus('success');
        toast({
          title: "Success",
          description: `Successfully connected as ${userData.nickname}`,
        });

        // Redirect after a short delay to show the success message
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (error) {
        console.error('Error during authentication:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Failed to complete authentication process",
        });
      }
    };

    handleCallback();
  }, [location, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-6">
        {status === 'loading' && (
          <div className="text-center space-y-4">
            <Loader className="h-12 w-12 animate-spin mx-auto text-meli-yellow" />
            <h2 className="text-2xl font-semibold">Authenticating...</h2>
            <p className="text-gray-600">Please wait while we connect your account</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-2xl font-semibold text-green-600">Successfully Connected!</h2>
            <p className="text-gray-600">Redirecting to home page...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-2xl font-semibold text-red-600">Authentication Failed</h2>
            <p className="text-gray-600">{errorMessage}</p>
            <Button 
              onClick={() => navigate('/')}
              className="mt-4"
            >
              Return to Home
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MercadoLivreCallback;