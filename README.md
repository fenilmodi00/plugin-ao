# AO Plugin for ElizaOS

This plugin integrates the Arweave-based AO (Always On) protocol with ElizaOS, enabling AI agents to interact with decentralized processes on the Arweave network.

## Features

### Actions
- **SPAWN_AO_PROCESS**: Spawn a new AO process with specified module and scheduler
- **SEND_AO_MESSAGE**: Send a message to an existing AO process
- **READ_AO_RESULT**: Read the result of an AO message evaluation
- **DRY_RUN_AO**: Execute a dry run on an AO process (read operation)

### Providers
- **AO_SERVICE_STATUS**: Provides current status of the AO service connection
- **AO_WALLET_INFO**: Provides information about the connected AO wallet

## Installation

```bash
bun add @your-org/plugin-ao
```

## Configuration

1. Add the plugin to your ElizaOS agent configuration
2. Set environment variables:
   - `AO_API_KEY`: Your AO API key (optional)
   - `AO_GATEWAY_URL`: Arweave gateway URL (default: https://arweave.net)
   - `AO_GRAPHQL_URL`: Arweave GraphQL URL (default: https://arweave.net/graphql)
   - `AO_MU_URL`: Message Unit URL (optional)
   - `AO_CU_URL`: Compute Unit URL (optional)
   - `AO_MODE`: Connection mode (default: legacy)
   - `AO_DEFAULT_TIMEOUT`: Default timeout in milliseconds (default: 30000)

## Usage

### Spawning a Process
```
Spawn an AO process with module MODULE_ID_123 and scheduler SCHEDULER_ID_456
```

### Sending a Message
```
Send message "Hello AO!" to process PROCESS_ID_789
```

### Reading a Result
```
Read result for message MESSAGE_ID_012 from process PROCESS_ID_789
```

### Dry Run
```
Execute dry run with data "balance" on process PROCESS_ID_789
```

### Checking Status
```
Check AO service status
```

### Wallet Information
```
Show AO wallet information
```

## Workflow

1. **Initialize**: Configure the plugin with your AO settings
2. **Spawn**: Create a new AO process with a specific module and scheduler
3. **Interact**: Send messages to the process to trigger operations
4. **Query**: Read results or execute dry runs to get information
5. **Monitor**: Check service status and wallet information as needed

## Security

- API keys should be stored securely using environment variables
- The plugin follows AO best practices for process management and message signing
- All operations include comprehensive error handling with user-friendly messages
- Sensitive operations require proper authentication and authorization

## Development

### Running Tests
```bash
bun test
```

### Building
```bash
bun run build
```

## License

MIT
