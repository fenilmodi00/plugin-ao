import { aoPlugin } from './plugin.ts';

// Export the plugin as default
export default aoPlugin;

// Export the plugin by name
export { aoPlugin };

// Export services for direct use if needed
export { AOService } from './services';

// Export actions for direct use if needed
export { 
  spawnAOProcessAction, 
  sendAOMessageAction, 
  readAOResultAction, 
  dryRunAOAction 
} from './actions';

// Export providers
export { aoServiceStatusProvider, aoWalletInfoProvider } from './providers';

// Export types
export * from './types';

// Export utilities
export * from './utils/errors';
export * from './utils/format';
