import type { Action, ActionResult, HandlerCallback, IAgentRuntime, Memory, State } from '@elizaos/core';
import { z } from 'zod';
import { AOService } from '../services/AOService';
import { formatAOResult } from '../utils/format';
import { handleAOError, AOError, AOErrorCode } from '../utils/errors';
import { logger } from '@elizaos/core';

/**
 * Schema for validating read result action input
 */
const readResultSchema = z.object({
  process: z.string().min(1, 'Process ID is required'),
  messageId: z.string().min(1, 'Message ID is required')
});

/**
 * Action to read the result of an AO message evaluation
 */
export const readAOResultAction: Action = {
  name: 'READ_AO_RESULT',
  description: 'Read the result of an AO message evaluation',
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
      await readResultSchema.parseAsync(content);
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
      const validatedInput = await readResultSchema.parseAsync(input);
      
      // Read result
      const result = await service.readResult(
        validatedInput.process,
        validatedInput.messageId
      );
      
      logger.info(`Read result for message: ${validatedInput.messageId} from process: ${validatedInput.process}`);
      
      // Format result for display
      const resultText = formatAOResult(result);
      
      // Send progress update
      if (callback) {
        await callback({
          text: `Reading result for message ${validatedInput.messageId}...`,
          action: 'READ_AO_RESULT'
        });
      }
      
      // Return result
      return {
        success: true,
        text: resultText,
        data: {
          actionName: 'READ_AO_RESULT',
          processId: validatedInput.process,
          messageId: validatedInput.messageId,
          result
        }
      };
    } catch (error) {
      const response = handleAOError(error);
      
      if (callback) {
        await callback({
          text: `Failed to read result from AO process: ${response.message}`,
          error: true
        });
      }
      
      return {
        success: false,
        text: `Failed to read result from AO process: ${response.message}`,
        error: response.details ? new Error(response.details) : new Error(response.message),
        data: {
          actionName: 'READ_AO_RESULT',
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
            messageId: 'MESSAGE_ID_012'
          })
        }
      },
      {
        name: '{{name2}}',
        content: {
          text: 'Result for message MESSAGE_ID_012:\nOutput: {"status":"success"}\nMessages: 1 message(s)\nSpawns: 0 spawn(s)\nError: None',
          action: 'READ_AO_RESULT'
        }
      }
    ]
  ]
};
