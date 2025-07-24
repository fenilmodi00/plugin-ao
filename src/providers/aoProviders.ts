import type { Provider, ProviderResult, IAgentRuntime, Memory, State } from '@elizaos/core';
import { AOService } from '../services/AOService';

/**
 * Provider to get AO service status
 */
export const aoServiceStatusProvider: Provider = {
  name: 'AO_SERVICE_STATUS',
  description: 'Provides current status of the AO service',

  get: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<ProviderResult> => {
    try {
      const service = runtime.getService<AOService>('ao');
      
      if (!service) {
        return {
          text: 'AO service is not available',
          values: {
            available: false,
            initialized: false
          },
          data: {
            serviceAvailable: false
          }
        };
      }

      const isInitialized = service.isInitialized();
      
      return {
        text: `AO service is ${isInitialized ? 'initialized' : 'not initialized'}`,
        values: {
          available: true,
          initialized: isInitialized
        },
        data: {
          serviceAvailable: true,
          serviceInitialized: isInitialized
        }
      };
    } catch (error) {
      return {
        text: 'Error checking AO service status',
        values: {
          available: false,
          initialized: false
        },
        data: {
          serviceAvailable: false,
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }
};

/**
 * Provider to get wallet information
 */
export const aoWalletInfoProvider: Provider = {
  name: 'AO_WALLET_INFO',
  description: 'Provides information about the connected wallet',

  get: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<ProviderResult> => {
    try {
      const service = runtime.getService<AOService>('ao');
      
      if (!service) {
        return {
          text: 'AO service is not available',
          values: {
            connected: false
          },
          data: {
            walletConnected: false
          }
        };
      }

      const signer = service.getSigner();
      const isInitialized = service.isInitialized();
      
      if (!signer || !isInitialized) {
        return {
          text: 'Wallet is not connected',
          values: {
            connected: false
          },
          data: {
            walletConnected: false
          }
        };
      }

      // In a real implementation, we would extract wallet address from signer
      // For now, we'll just indicate that a wallet is connected
      return {
        text: 'Wallet is connected and ready for transactions',
        values: {
          connected: true,
          address: 'Not available in this context' // Would be extracted from signer in real implementation
        },
        data: {
          walletConnected: true,
          address: 'Not available in this context'
        }
      };
    } catch (error) {
      return {
        text: 'Error checking wallet status',
        values: {
          connected: false
        },
        data: {
          walletConnected: false,
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }
};
