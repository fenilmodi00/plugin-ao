import type { Plugin } from '@elizaos/core';
import { logger } from '@elizaos/core';
import { z } from 'zod';

// Import services
import { AOService } from './services/AOService';

// Import actions
import {
  spawnAOProcessAction,
  sendAOMessageAction,
  readAOResultAction,
  dryRunAOAction
} from './actions';

// Import providers
import { aoServiceStatusProvider, aoWalletInfoProvider } from './providers/aoProviders';

/**
 * Configuration schema for AO plugin
 */
const configSchema = z.object({
  AO_API_KEY: z.string().min(1, 'API key is required').optional(),
  AO_GATEWAY_URL: z.string().url().default('https://arweave.net'),
  AO_GRAPHQL_URL: z.string().url().default('https://arweave.net/graphql'),
  AO_MU_URL: z.string().url().optional(),
  AO_CU_URL: z.string().url().optional(),
  AO_MODE: z.enum(['legacy', 'mainnet']).default('legacy'),
  AO_DEFAULT_TIMEOUT: z.number().default(30000),
});

export const aoPlugin: Plugin = {
  name: 'plugin-ao',
  description: 'AO protocol integration for process management and messaging on Arweave',
  
  config: {
    AO_API_KEY: process.env.AO_API_KEY,
    AO_GATEWAY_URL: process.env.AO_GATEWAY_URL,
    AO_GRAPHQL_URL: process.env.AO_GRAPHQL_URL,
    AO_MU_URL: process.env.AO_MU_URL,
    AO_CU_URL: process.env.AO_CU_URL,
    AO_MODE: process.env.AO_MODE as 'legacy' | 'mainnet' | undefined,
    AO_DEFAULT_TIMEOUT: process.env.AO_DEFAULT_TIMEOUT ? parseInt(process.env.AO_DEFAULT_TIMEOUT) : undefined,
  },

  async init(config: Record<string, any>) {
    logger.info('Initializing AO plugin...');
    
    try {
      // Validate configuration
      const validatedConfig = await configSchema.parseAsync(config);
      
      // Store config for services to access
      (global as any).__aoConfig = validatedConfig;
      
      logger.info('AO plugin initialized successfully');
      logger.info(`Mode: ${validatedConfig.AO_MODE || 'legacy'}`);
      logger.info(`Gateway URL: ${validatedConfig.AO_GATEWAY_URL || 'https://arweave.net'}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new Error(`Invalid AO plugin configuration: ${errors}`);
      }
      throw error;
    }
  },

  // Services that manage state and external integrations
  services: [AOService],

  // Actions that handle user commands
  actions: [
    spawnAOProcessAction,
    sendAOMessageAction,
    readAOResultAction,
    dryRunAOAction,
  ],

  // Providers that supply context
  providers: [
    aoServiceStatusProvider,
    aoWalletInfoProvider
  ],

  // Evaluators for post-interaction processing
  evaluators: [],

  // API routes (if needed)
  routes: [
    {
      name: 'ao-status',
      path: '/api/ao/status',
      type: 'GET',
      handler: async (_req: any, res: any) => {
        try {
          const config = (global as any).__aoConfig;
          res.json({
            status: 'active',
            mode: config?.AO_MODE || 'unknown',
            configured: !!config,
            gateway: config?.AO_GATEWAY_URL || 'https://arweave.net',
          });
        } catch (error) {
          res.status(500).json({
            status: 'error',
            error: String(error),
          });
        }
      },
    },
  ],

  // Event handlers
  events: {
    TRANSACTION_CONFIRMED: [
      async (params) => {
        logger.info('AO transaction confirmed:', params);
        // Handle transaction confirmation events
      },
    ],
    TRANSACTION_FAILED: [
      async (params) => {
        logger.error('AO transaction failed:', params);
        // Handle transaction failure events
      },
    ],
  },
};

export default aoPlugin;
