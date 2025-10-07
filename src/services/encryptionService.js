// Client-side Encryption Service
// Handles AES-256 encryption/decryption for files before IPFS storage

class EncryptionService {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
  }

  // Generate a random encryption key
  async generateKey() {
    try {
      const key = await window.crypto.subtle.generateKey(
        {
          name: this.algorithm,
          length: this.keyLength
        },
        true, // extractable
        ['encrypt', 'decrypt']
      );
      
      return key;
    } catch (error) {
      console.error('Failed to generate encryption key:', error);
      throw error;
    }
  }

  // Export key to raw format for storage
  async exportKey(key) {
    try {
      const exported = await window.crypto.subtle.exportKey('raw', key);
      return new Uint8Array(exported);
    } catch (error) {
      console.error('Failed to export key:', error);
      throw error;
    }
  }

  // Import key from raw format
  async importKey(keyData) {
    try {
      const key = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        {
          name: this.algorithm,
          length: this.keyLength
        },
        true,
        ['encrypt', 'decrypt']
      );
      
      return key;
    } catch (error) {
      console.error('Failed to import key:', error);
      throw error;
    }
  }

  // Encrypt file
  async encryptFile(file, key) {
    try {
      // Read file as ArrayBuffer
      const fileBuffer = await this.fileToArrayBuffer(file);
      
      // Generate random IV
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt the file
      const encrypted = await window.crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        fileBuffer
      );
      
      // Combine IV and encrypted data
      const encryptedArray = new Uint8Array(encrypted);
      const combined = new Uint8Array(iv.length + encryptedArray.length);
      combined.set(iv);
      combined.set(encryptedArray, iv.length);
      
      // Create encrypted file blob
      const encryptedBlob = new Blob([combined], { type: 'application/octet-stream' });
      
      return {
        success: true,
        encryptedFile: encryptedBlob,
        originalSize: file.size,
        encryptedSize: encryptedBlob.size
      };
    } catch (error) {
      console.error('File encryption failed:', error);
      throw error;
    }
  }

  // Decrypt file
  async decryptFile(encryptedBlob, key) {
    try {
      // Read encrypted blob as ArrayBuffer
      const encryptedBuffer = await this.blobToArrayBuffer(encryptedBlob);
      const encryptedArray = new Uint8Array(encryptedBuffer);
      
      // Extract IV and encrypted data
      const iv = encryptedArray.slice(0, 12);
      const encryptedData = encryptedArray.slice(12);
      
      // Decrypt the data
      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        encryptedData
      );
      
      return {
        success: true,
        decryptedData: new Uint8Array(decrypted),
        size: decrypted.byteLength
      };
    } catch (error) {
      console.error('File decryption failed:', error);
      throw error;
    }
  }

  // Encrypt key with user's wallet signature
  async encryptKeyWithWallet(key, walletSignature) {
    try {
      // Use wallet signature as password for key encryption
      const passwordKey = await this.deriveKeyFromPassword(walletSignature);
      
      // Export the encryption key
      const keyData = await this.exportKey(key);
      
      // Generate IV for key encryption
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt the key
      const encryptedKey = await window.crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        passwordKey,
        keyData
      );
      
      // Combine IV and encrypted key
      const encryptedArray = new Uint8Array(encryptedKey);
      const combined = new Uint8Array(iv.length + encryptedArray.length);
      combined.set(iv);
      combined.set(encryptedArray, iv.length);
      
      // Convert to base64 for storage
      return this.arrayBufferToBase64(combined);
    } catch (error) {
      console.error('Key encryption failed:', error);
      throw error;
    }
  }

  // Decrypt key with user's wallet signature
  async decryptKeyWithWallet(encryptedKeyBase64, walletSignature) {
    try {
      // Convert from base64
      const encryptedKeyArray = this.base64ToArrayBuffer(encryptedKeyBase64);
      const encryptedArray = new Uint8Array(encryptedKeyArray);
      
      // Extract IV and encrypted key
      const iv = encryptedArray.slice(0, 12);
      const encryptedKey = encryptedArray.slice(12);
      
      // Derive password key from wallet signature
      const passwordKey = await this.deriveKeyFromPassword(walletSignature);
      
      // Decrypt the key
      const decryptedKey = await window.crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        passwordKey,
        encryptedKey
      );
      
      // Import the decrypted key
      return await this.importKey(new Uint8Array(decryptedKey));
    } catch (error) {
      console.error('Key decryption failed:', error);
      throw error;
    }
  }

  // Derive key from password (wallet signature)
  async deriveKeyFromPassword(password) {
    try {
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);
      
      // Import password as key material
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );
      
      // Derive key using PBKDF2
      const salt = encoder.encode('digital_vault_salt'); // Use consistent salt
      const derivedKey = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        {
          name: this.algorithm,
          length: this.keyLength
        },
        false,
        ['encrypt', 'decrypt']
      );
      
      return derivedKey;
    } catch (error) {
      console.error('Key derivation failed:', error);
      throw error;
    }
  }

  // Helper functions
  async fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  async blobToArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  }

  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  base64ToArrayBuffer(base64) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

export default new EncryptionService();