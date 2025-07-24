import type { Action, ActionResult, HandlerCallback, IAgentRuntime, Memory, State } from '@elizaos/core';
import { z } from 'zod';
import { AOService } from '../services/AOService';
import { handleAOError, AOError, AOErrorCode } from '../utils/errors';
import { logger } from '@elizaos/core';

/**
 * Schema for validating send message action input
 */
const sendMessageSchema = z.object({
  process: z.string().min(1, 'Process ID is required'),
  data: z.string().min(1, 'Message data is required'),
  tags: z.array(z.object({
    name: z.string(),
    value: z.string()
  })).optional(),
  anchor: z.string().optional()
});

/**
 * Action to send a message to an AO process
 */
export const sendAOMessageAction: Action = {
  name: 'SEND_AO_MESSAGE',
  description: 'Send a message to an existing AO process',
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
      await sendMessageSchema.parseAsync(content);
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
      const validatedInput = await sendMessageSchema.parseAsync(input);
      
      // Send message
      const messageId = await service.sendMessage(
        validatedInput.process,
        validatedInput.data,
        validatedInput.tags,
        validatedInput.anchor
      );
      
      logger.info(`Sent message with ID: ${messageId} to process: ${validatedInput.process}`);
      
      // Send progress update
      if (callback) {
        await callback({
          text: `Sending message to AO process ${validatedInput.process}...`,
          action: 'SEND_AO_MESSAGE'
        });
      }
      
      // Return result
      return {
        success: true,
        text: `Successfully sent message with ID: ${messageId} to process: ${validatedInput.process}`,
        data: {
          actionName: 'SEND_AO_MESSAGE',
          messageId,
          processId: validatedInput.process
        }
      };
    } catch (error) {
      const response = handleAOError(error);
      
      if (callback) {
        await callback({
          text: `Failed to send message to AO process: ${response.message}`,
          error: true
        });
      }
      
      return {
        success: false,
        text: `Failed to send message to AO process: ${response.message}`,
        error: response.details ? new Error(response.details) : new Error(response.message),
        data: {
          actionName: 'SEND_AO_MESSAGE',
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
            data: 'Hello AO!',
            tags: [
              { name: 'Action', value: 'GREET' }
            ]
          })
        }
      },
      {
        name: '{{name2}}',
        content: {
          text: 'Successfully sent message with ID: MESSAGE_ID_012 to process: PROCESS_ID_789',
          action: 'SEND_AO_MESSAGE'
        }
      }
    ]
  ]
};
