import { logger } from '@elizaos/core';

export enum AOErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PROTOCOL_ERROR = 'PROTOCOL_ERROR',
  SECURITY_ERROR = 'SECURITY_ERROR',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  SERVICE_NOT_INITIALIZED = 'SERVICE_NOT_INITIALIZED',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}

export interface AOErrorResponse {
  code: AOErrorCode;
  message: string;
  details?: any;
  suggestions?: string[];
}

export class AOError extends Error {
  code: AOErrorCode;
  details?: any;
  suggestions?: string[];

  constructor(code: AOErrorCode, message: string, details?: any, suggestions?: string[]) {
    super(message);
    this.name = 'AOError';
    this.code = code;
    this.details = details;
    this.suggestions = suggestions;
  }

  toResponse(): AOErrorResponse {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      suggestions: this.suggestions,
    };
  }
}

export function handleAOError(error: unknown): AOErrorResponse {
  logger.error('AO plugin error:', error);

  if (error instanceof AOError) {
    return error.toResponse();
  }

  if (error instanceof Error) {
    // Check for common errors
    if (error.message.includes('insufficient funds')) {
      return new AOError(
        AOErrorCode.INSUFFICIENT_BALANCE,
        'Insufficient balance to complete transaction',
        { originalError: error.message },
        ['Check your wallet balance', 'Ensure you have enough AR for fees']
      ).toResponse();
    }

    if (error.message.includes('network') || error.message.includes('connection')) {
      return new AOError(
        AOErrorCode.NETWORK_ERROR,
        'Network connection error',
        { originalError: error.message },
        ['Check your internet connection', 'Verify gateway is accessible']
      ).toResponse();
    }

    if (error.message.includes('reverted')) {
      return new AOError(
        AOErrorCode.TRANSACTION_FAILED,
        'Transaction reverted on chain',
        { originalError: error.message },
        ['Check transaction parameters', 'Ensure contract state allows this operation']
      ).toResponse();
    }
  }

  // Generic error
  return new AOError(
    AOErrorCode.PROTOCOL_ERROR,
    'An unexpected error occurred',
    { originalError: String(error) },
    ['Please try again', 'Contact support if the issue persists']
  ).toResponse();
}
