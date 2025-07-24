import type { IAgentRuntime, Metadata } from '@elizaos/core';
import { Service } from '@elizaos/core';
import { logger } from '@elizaos/core';
import { 
  connect, 
  createSigner, 
  spawn, 
  message, 
  result, 
  dryrun
} from '@permaweb/aoconnect';
import type { AOServiceConfig, AOResult } from '../types';

/**
 * Configuration interface for AOService
 */

/**
 * Service class for interacting with AO processes
 * Handles spawning processes, sending messages, and reading results
 */
export class AOService extends Service {
  static override serviceType = 'ao';
  
  private signer: ReturnType<typeof createSigner> | undefined = undefined;
  private initialized = false;
  config: AOServiceConfig;

  constructor(runtime: IAgentRuntime, config: AOServiceConfig = {}) {
    super(runtime);
    this.config = config;
  }

  /**
   * Initialize the AO service with wallet and connection settings
   */
  async initialize(runtime: IAgentRuntime): Promise<void> {
    try {
      // Get configuration from global store
      const config = (global as any).__aoConfig;
      
      // Initialize signer if wallet is provided
      if (this.config.wallet) {
        this.signer = createSigner(this.config.wallet);
        logger.info('AOService: Signer initialized');
      }

      // Setup aoconnect with custom configuration if provided
      const connectArgs: any = {};
      if (this.config.mode || config?.AO_MODE) {
        connectArgs.MODE = this.config.mode || config.AO_MODE;
      }
      if (this.config.gatewayUrl || config?.AO_GATEWAY_URL) {
        connectArgs.GATEWAY_URL = this.config.gatewayUrl || config.AO_GATEWAY_URL;
      }
      if (this.config.graphqlUrl || config?.AO_GRAPHQL_URL) {
        connectArgs.GRAPHQL_URL = this.config.graphqlUrl || config.AO_GRAPHQL_URL;
      }
      if (this.config.muUrl || config?.AO_MU_URL) {
        connectArgs.MU_URL = this.config.muUrl || config.AO_MU_URL;
      }
      if (this.config.cuUrl || config?.AO_CU_URL) {
        connectArgs.CU_URL = this.config.cuUrl || config.AO_CU_URL;
      }

      if (Object.keys(connectArgs).length > 0) {
        connect(connectArgs);
      }

      this.initialized = true;
      logger.info('AOService initialized successfully');
    } catch (error) {
      logger.error('AOService initialization failed:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.initialized = false;
    this.signer = undefined;
    logger.info('AOService stopped');
  }

  get capabilityDescription(): string {
    return 'Service for interacting with AO processes for spawning, messaging, and reading results';
  }

  /**
   * Check if service is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('AOService not initialized. Call initialize() first.');
    }
  }

  /**
   * Spawn a new AO process
   * @param module - The module ID to use for the process
   * @param scheduler - The scheduler to assign the process to
   * @param tags - Optional tags to attach to the spawn message
   * @param data - Optional data to include in the spawn message
   * @returns The process ID of the newly spawned process
   */
  async spawnProcess(
    module: string,
    scheduler: string,
    tags?: { name: string; value: string }[],
    data?: string
  ): Promise<string> {
    this.ensureInitialized();
    
    try {
      const processId = await spawn({
        module,
        scheduler,
        signer: this.signer,
        tags,
        data
      });
      
      logger.info(`AOService: Process spawned with ID ${processId}`);
      return processId;
    } catch (error) {
      logger.error('AOService: Failed to spawn process:', error);
      throw error;
    }
  }

  /**
   * Send a message to an existing AO process
   * @param process - The process ID to send the message to
   * @param data - The data to include in the message
   * @param tags - Optional tags to attach to the message
   * @param anchor - Optional anchor value
   * @returns The message ID of the sent message
   */
  async sendMessage(
    process: string,
    data: string,
    tags?: { name: string; value: string }[],
    anchor?: string
  ): Promise<string> {
    this.ensureInitialized();
    
    try {
      const messageId = await message({
        process,
        data,
        tags,
        anchor,
        signer: this.signer
      });
      
      logger.info(`AOService: Message sent with ID ${messageId} to process ${process}`);
      return messageId;
    } catch (error) {
      logger.error(`AOService: Failed to send message to process ${process}:`, error);
      throw error;
    }
  }

  /**
   * Read the result of a message evaluation from an AO process
   * @param process - The process ID to read from
   * @param messageId - The message ID to read the result for
   * @returns The result of the message evaluation
   */
  async readResult(process: string, messageId: string): Promise<AOResult> {
    this.ensureInitialized();
    
    try {
      const resultData = await result({
        process,
        message: messageId
      });
      
      logger.info(`AOService: Read result for message ${messageId} from process ${process}`);
      return resultData;
    } catch (error) {
      logger.error(`AOService: Failed to read result for message ${messageId} from process ${process}:`, error);
      throw error;
    }
  }

  /**
   * Execute a dry run on an AO process (read operation)
   * @param process - The process ID to execute the dry run on
   * @param data - The data to include in the dry run
   * @param tags - Optional tags to attach to the dry run
   * @param anchor - Optional anchor value
   * @returns The result of the dry run
   */
  async dryRun(
    process: string,
    data: string,
    tags?: { name: string; value: string }[],
    anchor?: string
  ): Promise<AOResult> {
    this.ensureInitialized();
    
    try {
      const resultData = await dryrun({
        process,
        data,
        tags,
        anchor
      });
      
      logger.info(`AOService: Dry run executed for process ${process}`);
      return resultData;
    } catch (error) {
      logger.error(`AOService: Failed to execute dry run for process ${process}:`, error);
      throw error;
    }
  }

  /**
   * Get the current signer (if initialized)
   */
  getSigner(): ReturnType<typeof createSigner> | undefined {
    return this.signer;
  }

  /**
   * Get initialization status
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}
