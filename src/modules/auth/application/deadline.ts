export class AccessUnavailable extends Error {
  constructor() { super("O acesso da equipe está temporariamente indisponível."); }
}

/** Bound the entire Auth check, including SDK retries and non-cooperative transports. */
export async function withAccessDeadline<T>(read: (signal: AbortSignal) => Promise<T>, timeoutMs = 5000): Promise<T> {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 15000) throw new AccessUnavailable();
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => { reject(new AccessUnavailable()); controller.abort(); }, timeoutMs);
    });
    return await Promise.race([Promise.resolve().then(() => read(controller.signal)), deadline]);
  } finally { if (timer !== undefined) clearTimeout(timer); }
}
