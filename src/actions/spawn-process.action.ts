import type { Action, ActionResult, HandlerCallback, IAgentRuntime, Memory, State } from '@elizaos/core';
import { z } from 'zod';
import { AOService } from '../services/AOService';
import { handleAOError, AOError, AOErrorCode } from '../utils/errors';
import { logger } from '@elizaos/core';

/**
 * Schema for validating spawn process action input
 */
const spawnProcessSchema = z.object({
  module: z.string().min(1, 'Module ID is required'),
  scheduler: z.string().min(1, 'Scheduler ID is required'),
  data: z.string().optional(),
  tags: z.array(z.object({
    name: z.string(),
    value: z.string()
  })).optional()
});

/**
 * Action to spawn a new AO process
 */
export const spawnAOProcessAction: Action = {
  name: 'SPAWN_AO_PROCESS',
  description: 'Spawn a new AO process with specified module and scheduler',
  validate: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<boolean> => {
    try {
      const service = runtime.getService<AOService>('ao');
      if (!service || !service.isInitialized()) {
        return false;
      }
      
      // Extract JSON content if present
      let content;
      try {
        content = typeof message.content.text === 'string' 
          ? JSON.parse(message.content.text) 
          : message.content.text;
      } catch (error) {
        return false;
      }
      
      // Validate input structure
      await spawnProcessSchema.parseAsync(content);
      return true;
    } catch (error) {
      return false;
    }
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    options: Record<string, unknown> = {},
    callback?: HandlerCallback
  ): Promise<ActionResult> => {
    try {
      const service = runtime.getService<AOService>('ao');
      if (!service) {
        throw new AOError(
          AOErrorCode.SERVICE_NOT_INITIALIZED,
          'AOService not found',
          undefined,
          ['Ensure the AO plugin is properly initialized']
        );
      }

      // Parse input
      const input = typeof message.content.text === 'string' 
        ? JSON.parse(message.content.text) 
        : message.content.text;
      
      // Validate input
      const validatedInput = await spawnProcessSchema.parseAsync(input);
      
      // Spawn process
      const processId = await service.spawnProcess(
        validatedInput.module,
        validatedInput.scheduler,
        validatedInput.tags,
        validatedInput.data
      );
      
      logger.info(`Spawned AO process with ID: ${processId}`);
      
      // Send progress update
      if (callback) {
        await callback({
          text: `Spawning AO process with module ${validatedInput.module}...`,
          action: 'SPAWN_AO_PROCESS'
        });
      }
      
      // Return result
      return {
        success: true,
        text: `Successfully spawned AO process with ID: ${processId}`,
        data: {
          actionName: 'SPAWN_AO_PROCESS',
          processId,
          module: validatedInput.module,
          scheduler: validatedInput.scheduler
        }
      };
    } catch (error) {
      const response = handleAOError(error);
      
      if (callback) {
        await callback({
          text: `Failed to spawn AO process: ${response.message}`,
          error: true
        });
      }
      
      return {
        success: false,
        text: `Failed to spawn AO process: ${response.message}`,
        error: response.details ? new Error(response.details) : new Error(response.message),
        data: {
          actionName: 'SPAWN_AO_PROCESS',
          errorMessage: response.message,
          suggestions: response.suggestions
        }
      };
    }
  },
  examples: [
    [
      {
        name: '{{name1}}',
        content: {
          text: JSON.stringify({
            module: 'MODULE_ID_123',
            scheduler: 'SCHEDULER_ID_456',
            data: 'Initial process data',
            tags: [
              { name: 'App-Name', value: 'MyApp' },
              { name: 'Version', value: '1.0.0' }
            ]
          })
        }
      },
      {
        name: '{{name2}}',
        content: {
          text: 'Successfully spawned AO process with ID: PROCESS_ID_789',
          action: 'SPAWN_AO_PROCESS'
        }
      }
    ]
  ]
};
