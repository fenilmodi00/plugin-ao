export function formatTransactionHash(hash: string): string {
  if (!hash || hash.length < 10) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export function formatProcessId(id: string): string {
  return formatTransactionHash(id);
}

export function formatMessageId(id: string): string {
  return formatTransactionHash(id);
}

export function formatAOAmount(amount: number): string {
  return `${amount.toLocaleString()} AR`;
}

export function formatAOResult(result: any): string {
  const lines = [
    `Output: ${JSON.stringify(result.Output, null, 2)}`,
    `Messages: ${result.Messages.length} message(s)`,
    `Spawns: ${result.Spawns.length} spawn(s)`,
    `Error: ${result.Error ? JSON.stringify(result.Error, null, 2) : 'None'}`
  ];

  return lines.join('\n');
}
