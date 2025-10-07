// Aptos Blockchain Service
// This handles all interactions with Aptos blockchain and Move smart contracts

import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// Configuration
const APTOS_CONFIG = new AptosConfig({ 
  network: Network.TESTNET // Change to MAINNET for production
});
const aptos = new Aptos(APTOS_CONFIG);

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x1"; // PLACEHOLDER - Update after deploying Move contract

class AptosService {
  constructor() {
    this.wallet = null;
    this.account = null;
  }

  // Connect to Petra Wallet
  async connectWallet() {
    try {
      if (!window.aptos) {
        throw new Error('Petra Wallet not installed');
      }

      const response = await window.aptos.connect();
      this.account = response.address;
      this.wallet = window.aptos;
      
      return {
        success: true,
        address: this.account
      };
    } catch (error) {
      console.error('Wallet connection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Disconnect wallet
  async disconnectWallet() {
    try {
      if (this.wallet) {
        await this.wallet.disconnect();
      }
      this.wallet = null;
      this.account = null;
      return { success: true };
    } catch (error) {
      console.error('Disconnect failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if wallet is connected
  isConnected() {
    return this.wallet !== null && this.account !== null;
  }

  // Get account balance
  async getAccountBalance(address = this.account) {
    try {
      const resources = await aptos.getAccountResources({ accountAddress: address });
      const coinResource = resources.find(r => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>');
      
      if (coinResource) {
        return parseInt(coinResource.data.coin.value) / 100000000; // Convert from Octas to APT
      }
      return 0;
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  }

  // Create time-locked capsule
  async createTimeCapsule(capsuleData) {
    try {
      if (!this.isConnected()) {
        throw new Error('Wallet not connected');
      }

      const payload = {
        type: "entry_function_payload",
        function: `${CONTRACT_ADDRESS}::vault::create_time_capsule`,
        arguments: [
          capsuleData.title,
          capsuleData.description,
          capsuleData.ipfsHash,
          Math.floor(capsuleData.unlockTimestamp / 1000), // Convert to seconds
          this.getPriorityLevel(capsuleData.priority),
          capsuleData.encryptedKey
        ],
        type_arguments: []
      };

      const transaction = await this.wallet.signAndSubmitTransaction(payload);
      await aptos.waitForTransaction({ transactionHash: transaction.hash });
      
      return {
        success: true,
        transactionHash: transaction.hash,
        capsuleId: Date.now() // Mock ID - real ID comes from blockchain event
      };
    } catch (error) {
      console.error('Failed to create time capsule:', error);
      throw error;
    }
  }

  // Create geo-locked capsule
  async createGeoCapsule(capsuleData) {
    try {
      if (!this.isConnected()) {
        throw new Error('Wallet not connected');
      }

      const payload = {
        type: "entry_function_payload",
        function: `${CONTRACT_ADDRESS}::vault::create_geo_capsule`,
        arguments: [
          capsuleData.title,
          capsuleData.description,
          capsuleData.ipfsHash,
          Math.floor(capsuleData.unlockTimestamp / 1000),
          Math.floor(parseFloat(capsuleData.latitude) * 1000000), // Convert to micro-degrees
          Math.floor(parseFloat(capsuleData.longitude) * 1000000),
          parseInt(capsuleData.radius),
          this.getPriorityLevel(capsuleData.priority),
          capsuleData.encryptedKey
        ],
        type_arguments: []
      };

      const transaction = await this.wallet.signAndSubmitTransaction(payload);
      await aptos.waitForTransaction({ transactionHash: transaction.hash });
      
      return {
        success: true,
        transactionHash: transaction.hash,
        capsuleId: Date.now()
      };
    } catch (error) {
      console.error('Failed to create geo capsule:', error);
      throw error;
    }
  }

  // Unlock time capsule
  async unlockTimeCapsule(ownerAddress, capsuleId) {
    try {
      if (!this.isConnected()) {
        throw new Error('Wallet not connected');
      }

      const payload = {
        type: "entry_function_payload",
        function: `${CONTRACT_ADDRESS}::vault::unlock_time_capsule`,
        arguments: [ownerAddress, capsuleId],
        type_arguments: []
      };

      const transaction = await this.wallet.signAndSubmitTransaction(payload);
      await aptos.waitForTransaction({ transactionHash: transaction.hash });
      
      return {
        success: true,
        transactionHash: transaction.hash
      };
    } catch (error) {
      console.error('Failed to unlock capsule:', error);
      throw error;
    }
  }

  // Unlock geo capsule
  async unlockGeoCapsule(ownerAddress, capsuleId, userLatitude, userLongitude) {
    try {
      if (!this.isConnected()) {
        throw new Error('Wallet not connected');
      }

      const payload = {
        type: "entry_function_payload",
        function: `${CONTRACT_ADDRESS}::vault::unlock_geo_capsule`,
        arguments: [
          ownerAddress, 
          capsuleId,
          Math.floor(userLatitude * 1000000),
          Math.floor(userLongitude * 1000000)
        ],
        type_arguments: []
      };

      const transaction = await this.wallet.signAndSubmitTransaction(payload);
      await aptos.waitForTransaction({ transactionHash: transaction.hash });
      
      return {
        success: true,
        transactionHash: transaction.hash
      };
    } catch (error) {
      console.error('Failed to unlock geo capsule:', error);
      throw error;
    }
  }

  // Get user capsules
  async getUserCapsules(userAddress = this.account) {
    try {
      const capsules = await aptos.view({
        function: `${CONTRACT_ADDRESS}::vault::get_user_capsules`,
        arguments: [userAddress],
        type_arguments: []
      });
      
      return capsules[0] || [];
    } catch (error) {
      console.error('Failed to get capsules:', error);
      return [];
    }
  }

  // Check if capsule can be unlocked
  async canUnlockCapsule(ownerAddress, capsuleId, userLatitude, userLongitude) {
    try {
      const canUnlock = await aptos.view({
        function: `${CONTRACT_ADDRESS}::vault::can_unlock_capsule`,
        arguments: [
          ownerAddress,
          capsuleId,
          Math.floor(userLatitude * 1000000),
          Math.floor(userLongitude * 1000000)
        ],
        type_arguments: []
      });
      
      return canUnlock[0];
    } catch (error) {
      console.error('Failed to check unlock status:', error);
      return false;
    }
  }

  // Helper function to convert priority to number
  getPriorityLevel(priority) {
    switch (priority) {
      case 'standard': return 0;
      case 'classified': return 1;
      case 'top-secret': return 2;
      default: return 0;
    }
  }

  // Get total capsules count
  async getTotalCapsules() {
    try {
      const total = await aptos.view({
        function: `${CONTRACT_ADDRESS}::vault::get_total_capsules`,
        arguments: [],
        type_arguments: []
      });
      
      return total[0];
    } catch (error) {
      console.error('Failed to get total capsules:', error);
      return 0;
    }
  }
}

export default new AptosService();