import type { WebhookServerChanConfig } from '../interface/Config';
export declare function sendServerChan(config: WebhookServerChanConfig, content: string): Promise<void>;
export declare function flushServerChanQueue(timeoutMs?: number): Promise<void>;
//# sourceMappingURL=ServerChan.d.ts.map