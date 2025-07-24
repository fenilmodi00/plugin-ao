import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AOService } from '../services/AOService';
import type { IAgentRuntime } from '@elizaos/core';
import { logger } from '@elizaos/core';

// Mock dependencies
vi.mock('@permaweb/aoconnect', async () => {
  const { vi } = await import('vitest');
  return {
    connect: vi.fn(),
    createSigner: vi.fn(),
    spawn: vi.fn().mockResolvedValue('process-123'),
    message: vi.fn().mockResolvedValue('message-123'),
    result: vi.fn().mockResolvedValue({
      Output: { status: 'success' },
      Messages: [],
      Spawns: [],
      Error: null
    }),
    dryrun: vi.fn().mockResolvedValue({
      Output: { balance: 100 },
      Messages: [],
      Spawns: [],
      Error: null
    })
  };
});

// Mock runtime
const mockRuntime = {
  getService: vi.fn(),
  setService: vi.fn()
} as unknown as IAgentRuntime;

describe('AOService', () => {
  let service: AOService;

  beforeEach(() => {
    service = new AOService(mockRuntime);
  });

  it('should initialize with default config', async () => {
    await service.initialize(mockRuntime);
    
    expect(service.isInitialized()).toBe(true);
  });

  it('should initialize with wallet and create signer', async () => {
    const mockWallet = { key: 'test' };
    
    service = new AOService(mockRuntime, { wallet: mockWallet });
    await service.initialize(mockRuntime);
    
    expect(service.getSigner()).toBeDefined();
  });

  it('should initialize with custom gateway configuration', async () => {
    const config = {
      gatewayUrl: 'https://gateway.test',
      graphqlUrl: 'https://graphql.test',
      muUrl: 'https://mu.test',
      cuUrl: 'https://cu.test',
      mode: 'legacy' as const
    };
    
    service = new AOService(mockRuntime, config);
    await service.initialize(mockRuntime);
    
    // The mock is already set up in mock.module, so we just need to verify initialization
    expect(service.isInitialized()).toBe(true);
  });

  it('should spawn process successfully', async () => {
    service = new AOService(mockRuntime, { wallet: {} });
    await service.initialize(mockRuntime);
    
    const result = await service.spawnProcess('module-123', 'scheduler-123');
    
    expect(result).toBe('process-123');
  });

  it('should send message successfully', async () => {
    service = new AOService(mockRuntime, { wallet: {} });
    await service.initialize(mockRuntime);
    
    const result = await service.sendMessage('process-123', 'test data');
    
    expect(result).toBe('message-123');
  });

  it('should read result successfully', async () => {
    service = new AOService(mockRuntime);
    await service.initialize(mockRuntime);
    
    const result = await service.readResult('process-123', 'message-123');
    
    expect(result).toBeDefined();
    expect(result.Output).toEqual({ status: 'success' });
  });

  it('should execute dry run successfully', async () => {
    service = new AOService(mockRuntime);
    await service.initialize(mockRuntime);
    
    const result = await service.dryRun('process-123', 'balance');
    
    expect(result).toBeDefined();
    expect(result.Output).toEqual({ balance: 100 });
  });

  it('should throw error when not initialized', async () => {
    await expect(service.spawnProcess('module-123', 'scheduler-123'))
      .rejects
      .toThrow('AOService not initialized. Call initialize() first.');
    
    await expect(service.sendMessage('process-123', 'test data'))
      .rejects
      .toThrow('AOService not initialized. Call initialize() first.');
    
    await expect(service.readResult('process-123', 'message-123'))
      .rejects
      .toThrow('AOService not initialized. Call initialize() first.');
    
    await expect(service.dryRun('process-123', 'balance'))
      .rejects
      .toThrow('AOService not initialized. Call initialize() first.');
  });

  it('should stop service and clear state', async () => {
    service = new AOService(mockRuntime, { wallet: {} });
    await service.initialize(mockRuntime);
    
    expect(service.isInitialized()).toBe(true);
    
    await service.stop();
    
    expect(service.isInitialized()).toBe(false);
    expect(service.getSigner()).toBeUndefined();
    expect(logger.info).toHaveBeenCalledWith('AOService stopped');
  });
});
