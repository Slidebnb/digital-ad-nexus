import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface WalletInfo {
  id?: string;
  wallet_address: string;
  cryptocurrency: string;
  wallet_type: string;
  is_primary: boolean;
  is_verified: boolean;
  last_used_at?: string;
}

export interface WalletConnection {
  address: string;
  type: string;
  connected: boolean;
}

export function useCryptoWallet() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [connections, setConnections] = useState<Record<string, WalletConnection>>({});
  const [loading, setLoading] = useState(false);

  // Fetch user's saved wallets
  const fetchWallets = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .order('last_used_at', { ascending: false });

      if (error) throw error;
      setWallets(data || []);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
    }
  }, [user?.id]);

  // Connect MetaMask (ETH)
  const connectMetaMask = async (): Promise<string | null> => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask nicht gefunden",
        description: "Bitte installieren Sie MetaMask um Ethereum zu nutzen.",
        variant: "destructive"
      });
      return null;
    }

    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const address = accounts[0];
      setConnections(prev => ({
        ...prev,
        ETH: { address, type: 'metamask', connected: true }
      }));

      toast({
        title: "MetaMask verbunden",
        description: `Adresse: ${address.slice(0, 6)}...${address.slice(-4)}`
      });

      return address;
    } catch (error) {
      toast({
        title: "MetaMask Verbindung fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Connect Phantom (SOL)
  const connectPhantom = async (): Promise<string | null> => {
    if (!window.solana?.isPhantom) {
      toast({
        title: "Phantom nicht gefunden",
        description: "Bitte installieren Sie Phantom um Solana zu nutzen.",
        variant: "destructive"
      });
      return null;
    }

    try {
      setLoading(true);
      const response = await window.solana.connect();
      const address = response.publicKey.toString();

      setConnections(prev => ({
        ...prev,
        SOL: { address, type: 'phantom', connected: true }
      }));

      toast({
        title: "Phantom verbunden",
        description: `Adresse: ${address.slice(0, 6)}...${address.slice(-4)}`
      });

      return address;
    } catch (error) {
      toast({
        title: "Phantom Verbindung fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Connect Unisat (BTC)
  const connectUnisat = async (): Promise<string | null> => {
    if (!window.unisat) {
      toast({
        title: "Unisat nicht gefunden",
        description: "Bitte installieren Sie Unisat um Bitcoin zu nutzen.",
        variant: "destructive"
      });
      return null;
    }

    try {
      setLoading(true);
      const accounts = await window.unisat.requestAccounts();
      const address = accounts[0];

      setConnections(prev => ({
        ...prev,
        BTC: { address, type: 'unisat', connected: true }
      }));

      toast({
        title: "Unisat verbunden",
        description: `Adresse: ${address.slice(0, 6)}...${address.slice(-4)}`
      });

      return address;
    } catch (error) {
      toast({
        title: "Unisat Verbindung fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Save wallet to database
  const saveWallet = async (
    address: string, 
    crypto: string, 
    walletType: string,
    isPrimary: boolean = false
  ) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_wallets')
        .upsert({
          user_id: user.id,
          wallet_address: address,
          cryptocurrency: crypto,
          wallet_type: walletType,
          is_primary: isPrimary,
          last_used_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,wallet_address,cryptocurrency'
        });

      if (error) throw error;

      await fetchWallets();
      
      toast({
        title: "Wallet gespeichert",
        description: `${crypto} Wallet erfolgreich hinzugefügt`
      });
    } catch (error) {
      toast({
        title: "Fehler beim Speichern",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive"
      });
    }
  };

  // Disconnect wallet
  const disconnectWallet = (crypto: string) => {
    setConnections(prev => ({
      ...prev,
      [crypto]: { address: '', type: '', connected: false }
    }));

    toast({
      title: "Wallet getrennt",
      description: `${crypto} Wallet wurde getrennt`
    });
  };

  // Get wallet for specific crypto
  const getWallet = (crypto: string): WalletInfo | null => {
    return wallets.find(w => w.cryptocurrency === crypto && w.is_primary) || 
           wallets.find(w => w.cryptocurrency === crypto) || 
           null;
  };

  // Check if crypto is supported
  const isSupportedCrypto = (crypto: string): boolean => {
    return ['SOL', 'BTC', 'ETH'].includes(crypto);
  };

  useEffect(() => {
    if (user?.id) {
      fetchWallets();
    }
  }, [user?.id, fetchWallets]);

  return {
    wallets,
    connections,
    loading,
    connectMetaMask,
    connectPhantom,
    connectUnisat,
    saveWallet,
    disconnectWallet,
    getWallet,
    isSupportedCrypto,
    fetchWallets
  };
}