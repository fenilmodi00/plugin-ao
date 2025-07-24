import type { Action, ActionResult, HandlerCallback, IAgentRuntime, Memory, State } from '@elizaos/core';
import { z } from 'zod';
import { AOService } from '../services/AOService';
import { formatAOResult } from '../utils/format';
import { handleAOError, AOError, AOErrorCode } from '../utils/errors';
import { logger } from '@elizaos/core';

/**
 * Schema for validating dry run action input
 */
const dryRunSchema = z.object({
  process: z.string().min(1, 'Process ID is required'),
  data: z.string().min(1, 'Data is required'),
  tags: z.array(z.object({
    name: z.string(),
    value: z.string()
  })).optional(),
  anchor: z.string().optional()
});

/**
 * Action to execute a dry run on an AO process
 */
export const dryRunAOAction: Action = {
  name: 'DRY_RUN_AO',
  description: 'Execute a dry run on an AO process (read operation)',
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
      await dryRunSchema.parseAsync(content);
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
      const validatedInput = await dryRunSchema.parseAsync(input);
      
      // Execute dry run
      const result = await service.dryRun(
        validatedInput.process,
        validatedInput.data,
        validatedInput.tags,
        validatedInput.anchor
      );
      
      logger.info(`Executed dry run on process: ${validatedInput.process}`);
      
      // Format result for display
      const resultText = `Dry run result for process ${validatedInput.process}:\n${formatAOResult(result)}`;
      
      // Send progress update
      if (callback) {
        await callback({
          text: `Executing dry run on process ${validatedInput.process}...`,
          action: 'DRY_RUN_AO'
        });
      }
      
      // Return result
      return {
        success: true,
        text: resultText,
        data: {
          actionName: 'DRY_RUN_AO',
          processId: validatedInput.process,
          result
        }
      };
    } catch (error) {
      const response = handleAOError(error);
      
      if (callback) {
        await callback({
          text: `Failed to execute dry run on AO process: ${response.message}`,
          error: true
        });
      }
      
      return {
        success: false,
        text: `Failed to execute dry run on AO process: ${response.message}`,
        error: response.details ? new Error(response.details) : new Error(response.message),
        data: {
          actionName: 'DRY_RUN_AO',
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
            process: 'PROCESS_ID_789',
            data: 'balance',
            tags: [
              { name: 'Action', value: 'Balance' }
            ]
          })
        }
      },
      {
        name: '{{name2}}',
        content: {
          text: 'Dry run result for process PROCESS_ID_789:\nOutput: {"balance":100}\nMessages: 0 message(s)\nSpawns: 0 spawn(s)\nError: None',
          action: 'DRY_RUN_AO'
        }
      }
    ]
  ]
};
