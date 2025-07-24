import { describe, expect, it, vi } from 'vitest';
import { aoServiceStatusProvider, aoWalletInfoProvider } from '../providers/aoProviders';
import type { IAgentRuntime, Memory } from '@elizaos/core';
import { AOService } from '../services/AOService';

// Mock dependencies
vi.mock('../services/AOService', async () => {
  const { vi } = await import('vitest');
  return {
    AOService: vi.fn(),
    StarterService: vi.fn()
  };
});

// Mock runtime
const mockRuntime = {
  getService: vi.fn()
} as unknown as IAgentRuntime;

describe('AO Providers', () => {
  it('aoServiceStatusProvider should return status when service is available and initialized', async () => {
    const mockService = {
      isInitialized: vi.fn().mockReturnValue(true)
    };
    
    (mockRuntime.getService as any).mockReturnValue(mockService);
    
    const result = await aoServiceStatusProvider.get(mockRuntime, {} as Memory, undefined as any);
    
    expect(result.text).toBe('AO service is initialized');
    expect(result.values).toEqual({
      available: true,
      initialized: true
    });
    expect(result.data).toEqual({
      serviceAvailable: true,
      serviceInitialized: true
    });
  });

  it('aoServiceStatusProvider should return status when service is available but not initialized', async () => {
    const mockService = {
      isInitialized: vi.fn().mockReturnValue(false)
    };
    
    (mockRuntime.getService as any).mockReturnValue(mockService);
    
    const result = await aoServiceStatusProvider.get(mockRuntime, {} as Memory, undefined as any);
    
    expect(result.text).toBe('AO service is not initialized');
    expect(result.values).toEqual({
      available: true,
      initialized: false
    });
    expect(result.data).toEqual({
      serviceAvailable: true,
      serviceInitialized: false
    });
  });

  it('aoServiceStatusProvider should return status when service is not available', async () => {
    (mockRuntime.getService as any).mockReturnValue(null);
    
    const result = await aoServiceStatusProvider.get(mockRuntime, {} as Memory, undefined as any);
    
    expect(result.text).toBe('AO service is not available');
    expect(result.values).toEqual({
      available: false,
      initialized: false
    });
    expect(result.data).toEqual({
      serviceAvailable: false
    });
  });

  it('aoServiceStatusProvider should handle errors gracefully', async () => {
    (mockRuntime.getService as any).mockImplementation(() => {
      throw new Error('Service error');
    });
    
    const result = await aoServiceStatusProvider.get(mockRuntime, {} as Memory, undefined as any);
    
    expect(result.text).toBe('Error checking AO service status');
    expect(result.values).toEqual({
      available: false,
      initialized: false
    });
    expect(result.data).toEqual({
      serviceAvailable: false,
      error: 'Service error'
    });
  });

  it('aoWalletInfoProvider should return info when wallet is connected', async () => {
    const mockSigner = {};
    const mockService = {
      isInitialized: vi.fn().mockReturnValue(true),
      getSigner: vi.fn().mockReturnValue(mockSigner)
    };
    
    (mockRuntime.getService as any).mockReturnValue(mockService);
    
    const result = await aoWalletInfoProvider.get(mockRuntime, {} as Memory, undefined as any);
    
    expect(result.text).toBe('Wallet is connected and ready for transactions');
    expect(result.values).toEqual({
      connected: true,
      address: 'Not available in this context'
    });
    expect(result.data).toEqual({
      walletConnected: true,
      address: 'Not available in this context'
    });
  });

  it('aoWalletInfoProvider should return info when wallet is not connected', async () => {
    const mockService = {
      isInitialized: vi.fn().mockReturnValue(true),
      getSigner: vi.fn().mockReturnValue(undefined)
    };
    
    (mockRuntime.getService as any).mockReturnValue(mockService);
    
    const result = await aoWalletInfoProvider.get(mockRuntime, {} as Memory, undefined as any);
    
    expect(result.text).toBe('Wallet is not connected');
    expect(result.values).toEqual({
      connected: false
    });
    expect(result.data).toEqual({
      walletConnected: false
    });
  });

  it('aoWalletInfoProvider should return info when service is not available', async () => {
    (mockRuntime.getService as any).mockReturnValue(null);
    
    const result = await aoWalletInfoProvider.get(mockRuntime, {} as Memory, undefined as any);
    
    expect(result.text).toBe('AO service is not available');
    expect(result.values).toEqual({
      connected: false
    });
    expect(result.data).toEqual({
      walletConnected: false
    });
  });

  it('aoWalletInfoProvider should handle errors gracefully', async () => {
    (mockRuntime.getService as any).mockImplementation(() => {
      throw new Error('Service error');
    });
    
    const result = await aoWalletInfoProvider.get(mockRuntime, {} as Memory, undefined as any);
    
    expect(result.text).toBe('Error checking wallet status');
    expect(result.values).toEqual({
      connected: false
    });
    expect(result.data).toEqual({
      walletConnected: false,
      error: 'Service error'
    });
  });
});
