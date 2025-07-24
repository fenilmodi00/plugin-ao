import { describe, expect, it, vi, beforeEach } from 'vitest';
import { spawnAOProcessAction, sendAOMessageAction, readAOResultAction, dryRunAOAction } from '../actions';
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

describe('AO Actions', () => {
  let mockService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockService = {
      isInitialized: vi.fn().mockReturnValue(true),
      spawnProcess: vi.fn(),
      sendMessage: vi.fn(),
      readResult: vi.fn(),
      dryRun: vi.fn()
    };
    
    (mockRuntime.getService as any).mockReturnValue(mockService);
  });

  describe('spawnAOProcessAction', () => {
    it('should validate with valid input', async () => {
      const message: Memory = {
        content: {
          text: JSON.stringify({
            module: 'module-123',
            scheduler: 'scheduler-123'
          })
        }
      } as any;

      const isValid = await spawnAOProcessAction.validate(mockRuntime, message);
      expect(isValid).toBe(true);
    });

    it('should not validate with missing module', async () => {
      const message: Memory = {
        content: {
          text: JSON.stringify({
            scheduler: 'scheduler-123'
          })
        }
      } as any;

      const isValid = await spawnAOProcessAction.validate(mockRuntime, message);
      expect(isValid).toBe(false);
    });

    it('should spawn process successfully', async () => {
      const mockCallback = vi.fn();
      const mockProcessId = 'process-123';
      
      mockService.spawnProcess.mockResolvedValue(mockProcessId);
      
      const message: Memory = {
        content: {
          text: JSON.stringify({
            module: 'module-123',
            scheduler: 'scheduler-123'
          })
        }
      } as any;

      const result = await spawnAOProcessAction.handler(mockRuntime, message, undefined, {}, mockCallback);
      
      expect(mockService.spawnProcess).toHaveBeenCalledWith('module-123', 'scheduler-123', undefined, undefined);
      expect(mockCallback).toHaveBeenCalledWith({
        text: 'Spawning AO process with module module-123...',
        action: 'SPAWN_AO_PROCESS'
      });
      expect(result).toBeDefined();
      if (result) {
        expect(result.success).toBe(true);
        expect(result.text).toBe(`Successfully spawned AO process with ID: ${mockProcessId}`);
      }
    });
  });

  describe('sendAOMessageAction', () => {
    it('should validate with valid input', async () => {
      const message: Memory = {
        content: {
          text: JSON.stringify({
            process: 'process-123',
            data: 'test message'
          })
        }
      } as any;

      const isValid = await sendAOMessageAction.validate(mockRuntime, message);
      expect(isValid).toBe(true);
    });

    it('should not validate with missing process', async () => {
      const message: Memory = {
        content: {
          text: JSON.stringify({
            data: 'test message'
          })
        }
      } as any;

      const isValid = await sendAOMessageAction.validate(mockRuntime, message);
      expect(isValid).toBe(false);
    });

    it('should send message successfully', async () => {
      const mockCallback = vi.fn();
      const mockMessageId = 'message-123';
      
      mockService.sendMessage.mockResolvedValue(mockMessageId);
      
      const message: Memory = {
        content: {
          text: JSON.stringify({
            process: 'process-123',
            data: 'test message'
          })
        }
      } as any;

      const result = await sendAOMessageAction.handler(mockRuntime, message, undefined, {}, mockCallback);
      
      expect(mockService.sendMessage).toHaveBeenCalledWith('process-123', 'test message', undefined, undefined);
      expect(mockCallback).toHaveBeenCalledWith({
        text: 'Sending message to AO process process-123...',
        action: 'SEND_AO_MESSAGE'
      });
      expect(result).toBeDefined();
      if (result) {
        expect(result.success).toBe(true);
        expect(result.text).toBe(`Successfully sent message with ID: ${mockMessageId} to process: process-123`);
      }
    });
  });

  describe('readAOResultAction', () => {
    it('should validate with valid input', async () => {
      const message: Memory = {
        content: {
          text: JSON.stringify({
            process: 'process-123',
            messageId: 'message-123'
          })
        }
      } as any;

      const isValid = await readAOResultAction.validate(mockRuntime, message);
      expect(isValid).toBe(true);
    });

    it('should not validate with missing process', async () => {
      const message: Memory = {
        content: {
          text: JSON.stringify({
            messageId: 'message-123'
          })
        }
      } as any;

      const isValid = await readAOResultAction.validate(mockRuntime, message);
      expect(isValid).toBe(false);
    });

    it('should read result successfully', async () => {
      const mockCallback = vi.fn();
      const mockResult = {
        Output: { status: 'success' },
        Messages: [],
        Spawns: [],
        Error: null
      };
      
      mockService.readResult.mockResolvedValue(mockResult);
      
      const message: Memory = {
        content: {
          text: JSON.stringify({
            process: 'process-123',
            messageId: 'message-123'
          })
        }
      } as any;

      const result = await readAOResultAction.handler(mockRuntime, message, undefined, {}, mockCallback);
      
      expect(mockService.readResult).toHaveBeenCalledWith('process-123', 'message-123');
      expect(mockCallback).toHaveBeenCalledWith({
        text: 'Reading result for message message-123...',
        action: 'READ_AO_RESULT'
      });
      expect(result).toBeDefined();
      if (result) {
        expect(result.success).toBe(true);
        expect(result.text).toContain('Result for message message-123:');
        expect(result.text).toContain('Output: {"status":"success"}');
      }
    });
  });

  describe('dryRunAOAction', () => {
    it('should validate with valid input', async () => {
      const message: Memory = {
        content: {
          text: JSON.stringify({
            process: 'process-123',
            data: 'balance'
          })
        }
      } as any;

      const isValid = await dryRunAOAction.validate(mockRuntime, message);
      expect(isValid).toBe(true);
    });

    it('should not validate with missing process', async () => {
      const message: Memory = {
        content: {
          text: JSON.stringify({
            data: 'balance'
          })
        }
      } as any;

      const isValid = await dryRunAOAction.validate(mockRuntime, message);
      expect(isValid).toBe(false);
    });

    it('should execute dry run successfully', async () => {
      const mockCallback = vi.fn();
      const mockResult = {
        Output: { balance: 100 },
        Messages: [],
        Spawns: [],
        Error: null
      };
      
      mockService.dryRun.mockResolvedValue(mockResult);
      
      const message: Memory = {
        content: {
          text: JSON.stringify({
            process: 'process-123',
            data: 'balance'
          })
        }
      } as any;

      const result = await dryRunAOAction.handler(mockRuntime, message, undefined, {}, mockCallback);
      
      expect(mockService.dryRun).toHaveBeenCalledWith('process-123', 'balance', undefined, undefined);
      expect(mockCallback).toHaveBeenCalledWith({
        text: 'Executing dry run on process process-123...',
        action: 'DRY_RUN_AO'
      });
      expect(result).toBeDefined();
      if (result) {
        expect(result.success).toBe(true);
        expect(result.text).toContain('Dry run result for process process-123:');
        expect(result.text).toContain('Output: {"balance":100}');
      }
    });
  });
});
