import { useState, useEffect } from 'react';
import aptosService from '../services/aptosService';
import ipfsService from '../services/ipfsService';
import encryptionService from '../services/encryptionService';

export function useCapsules(walletAddress) {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load user capsules when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      loadCapsules();
    }
  }, [walletAddress]);

  const loadCapsules = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    setError('');
    
    try {
      const userCapsules = await aptosService.getUserCapsules(walletAddress);
      setCapsules(userCapsules);
    } catch (err) {
      console.error('Failed to load capsules:', err);
      setError('Failed to load capsules from blockchain');
    } finally {
      setLoading(false);
    }
  };

  const createCapsule = async (capsuleData) => {
    setLoading(true);
    setError('');
    
    try {
      // Step 1: Generate encryption key
      const encryptionKey = await encryptionService.generateKey();
      
      // Step 2: Encrypt the file
      const encryptionResult = await encryptionService.encryptFile(capsuleData.file, encryptionKey);
      
      // Step 3: Upload encrypted file to IPFS
      const ipfsResult = await ipfsService.uploadFile(encryptionResult.encryptedFile, {
        fileName: `encrypted_${capsuleData.file.name}`,
        originalName: capsuleData.file.name,
        fileType: capsuleData.file.type,
        fileSize: capsuleData.file.size,
        priority: capsuleData.priority
      });
      
      // Step 4: Encrypt the key with wallet signature
      const walletSignature = await getWalletSignature();
      const encryptedKey = await encryptionService.encryptKeyWithWallet(encryptionKey, walletSignature);
      
      // Step 5: Create capsule on blockchain
      const blockchainData = {
        ...capsuleData,
        ipfsHash: ipfsResult.ipfsHash,
        encryptedKey: encryptedKey
      };
      
      let result;
      if (capsuleData.hasGeoLock) {
        result = await aptosService.createGeoCapsule(blockchainData);
      } else {
        result = await aptosService.createTimeCapsule(blockchainData);
      }
      
      // Step 6: Reload capsules
      await loadCapsules();
      
      return {
        success: true,
        capsuleId: result.capsuleId,
        transactionHash: result.transactionHash,
        ipfsHash: ipfsResult.ipfsHash
      };
      
    } catch (error) {
      console.error('Error creating capsule:', error);
      setError('Failed to create capsule: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unlockCapsule = async (capsule, userLocation = null) => {
    setLoading(true);
    setError('');
    
    try {
      // Step 1: Unlock on blockchain
      let result;
      if (capsule.hasGeoLock && userLocation) {
        result = await aptosService.unlockGeoCapsule(
          capsule.owner,
          capsule.id,
          userLocation.latitude,
          userLocation.longitude
        );
      } else {
        result = await aptosService.unlockTimeCapsule(capsule.owner, capsule.id);
      }
      
      // Step 2: Get wallet signature for key decryption
      const walletSignature = await getWalletSignature();
      
      // Step 3: Decrypt the encryption key
      const decryptionKey = await encryptionService.decryptKeyWithWallet(
        capsule.encryptedKey,
        walletSignature
      );
      
      // Step 4: Download encrypted file from IPFS
      const ipfsResult = await ipfsService.downloadFile(capsule.ipfsHash);
      
      // Step 5: Decrypt the file
      const decryptionResult = await encryptionService.decryptFile(ipfsResult.file, decryptionKey);
      
      // Step 6: Create download blob
      const decryptedBlob = new Blob([decryptionResult.decryptedData]);
      
      // Step 7: Trigger download
      const url = URL.createObjectURL(decryptedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = capsule.fileName || 'decrypted_file';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Step 8: Reload capsules
      await loadCapsules();
      
      return {
        success: true,
        transactionHash: result.transactionHash
      };
      
    } catch (error) {
      console.error('Error unlocking capsule:', error);
      setError('Failed to unlock capsule: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const canUnlockCapsule = async (capsule, userLocation = null) => {
    try {
      if (!userLocation && capsule.hasGeoLock) {
        return false;
      }
      
      const canUnlock = await aptosService.canUnlockCapsule(
        capsule.owner,
        capsule.id,
        userLocation?.latitude || 0,
        userLocation?.longitude || 0
      );
      
      return canUnlock;
    } catch (error) {
      console.error('Error checking unlock status:', error);
      return false;
    }
  };

  // Get wallet signature for encryption/decryption
  const getWalletSignature = async () => {
    try {
      if (!window.aptos) {
        throw new Error('Petra wallet not available');
      }
      
      const message = 'Digital Vault - Authorize file access';
      const signature = await window.aptos.signMessage({
        message: message,
        nonce: Date.now().toString()
      });
      
      return signature.signature;
    } catch (error) {
      console.error('Failed to get wallet signature:', error);
      throw error;
    }
  };

  return {
    capsules,
    loading,
    error,
    createCapsule,
    unlockCapsule,
    canUnlockCapsule,
    loadCapsules
  };
}