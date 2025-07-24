/**
 * Type definitions for AO plugin
 */

/**
 * Configuration options for AOService
 */
export interface AOServiceConfig {
  /**
   * Wallet credentials for signing messages
   * Can be a JWK object or Arweave wallet interface
   */
  wallet?: any;
  
  /**
   * Base URL for the Arweave gateway
   * @example 'https://arweave.net'
   */
  gatewayUrl?: string;
  
  /**
   * URL for the GraphQL endpoint
   * @example 'https://arweave.net/graphql'
   */
  graphqlUrl?: string;
  
  /**
   * URL for the Message Unit
   * @example 'https://mu-1.ao-testnet.xyz'
   */
  muUrl?: string;
  
  /**
   * URL for the Compute Unit
   * @example 'https://cu-1.ao-testnet.xyz'
   */
  cuUrl?: string;
  
  /**
   * Connection mode for aoconnect
   * @default 'legacy'
   */
  mode?: 'legacy' | 'mainnet';
  
  /**
   * Default timeout for operations in milliseconds
   * @default 30000
   */
  defaultTimeout?: number;
  
  /**
   * Index signature to make AOServiceConfig compatible with Metadata
   */
  [key: string]: any;
}

/**
 * Result of an AO message evaluation
 */
export interface AOResult {
  /**
   * Output from the process evaluation
   */
  Output: unknown;
  
  /**
   * Array of messages generated during evaluation
   */
  Messages: unknown[];
  
  /**
   * Array of processes spawned during evaluation
   */
  Spawns: unknown[];
  
  /**
   * Error information if evaluation failed
   */
  Error?: unknown;
}

/**
 * Parameters for spawning an AO process
 */
export interface SpawnProcessParams {
  /**
   * Module ID to use for the process
   */
  module: string;
  
  /**
   * Scheduler to assign the process to
   */
  scheduler: string;
  
  /**
   * Optional tags to attach to the spawn message
   */
  tags?: { name: string; value: string }[];
  
  /**
   * Optional data to include in the spawn message
   */
  data?: string;
}

/**
 * Parameters for sending a message to an AO process
 */
export interface SendMessageParams {
  /**
   * Process ID to send the message to
   */
  process: string;
  
  /**
   * Data to include in the message
   */
  data: string;
  
  /**
   * Optional tags to attach to the message
   */
  tags?: { name: string; value: string }[];
  
  /**
   * Optional anchor value
   */
  anchor?: string;
}

/**
 * Parameters for reading a result from an AO process
 */
export interface ReadResultParams {
  /**
   * Process ID to read from
   */
  process: string;
  
  /**
   * Message ID to read the result for
   */
  messageId: string;
}

/**
 * Parameters for executing a dry run on an AO process
 */
export interface DryRunParams {
  /**
   * Process ID to execute the dry run on
   */
  process: string;
  
  /**
   * Data to include in the dry run
   */
  data: string;
  
  /**
   * Optional tags to attach to the dry run
   */
  tags?: { name: string; value: string }[];
  
  /**
   * Optional anchor value
   */
  anchor?: string;
}
