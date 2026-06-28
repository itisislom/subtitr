import { Response } from 'express';

const clients = new Map<string, Response[]>();

export function addClient(projectId: string, res: Response): void {
  const existing = clients.get(projectId) || [];
  existing.push(res);
  clients.set(projectId, existing);

  res.on('close', () => {
    const list = clients.get(projectId);
    if (list) {
      const filtered = list.filter((c) => c !== res);
      if (filtered.length === 0) {
        clients.delete(projectId);
      } else {
        clients.set(projectId, filtered);
      }
    }
  });
}

export function sendProgress(projectId: string, stage: string, progress: number): void {
  const list = clients.get(projectId);
  if (!list) return;
  const data = JSON.stringify({ stage, progress });
  for (const client of list) {
    client.write(`data: ${data}\n\n`);
  }
}
