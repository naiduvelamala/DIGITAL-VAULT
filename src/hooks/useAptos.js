import { useState, useEffect } from 'react';
import aptosService from '../services/aptosService';

export function useAptos() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      if (window.aptos) {
        const account = await window.aptos.account();
        if (account) {
          setWalletAddress(account.address);
          setIsConnected(true);
          aptosService.account = account.address;
          aptosService.wallet = window.aptos;
          
          // Get balance
          const bal = await aptosService.getAccountBalance(account.address);
          setBalance(bal);
        }
      }
    } catch (error) {
      console.log('No existing connection');
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    try {
      const result = await aptosService.connectWallet();
      
      if (result.success) {
        setWalletAddress(result.address);
        setIsConnected(true);
        
        // Get balance
        const bal = await aptosService.getAccountBalance(result.address);
        setBalance(bal);
        
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      alert('Failed to connect wallet: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await aptosService.disconnectWallet();
      setWalletAddress('');
      setIsConnected(false);
      setBalance(0);
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  const refreshBalance = async () => {
    if (isConnected && walletAddress) {
      const bal = await aptosService.getAccountBalance(walletAddress);
      setBalance(bal);
    }
  };

  return {
    walletAddress,
    isConnected,
    balance,
    loading,
    connectWallet,
    disconnectWallet,
    refreshBalance
  };
}