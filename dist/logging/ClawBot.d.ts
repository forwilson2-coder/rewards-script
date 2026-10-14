import type { WebhookClawBotConfig } from '../interface/Config';
export declare function sendClawBot(config: WebhookClawBotConfig, content: string): Promise<void>;
export declare function flushClawBotQueue(timeoutMs?: number): Promise<void>;
/**
 * 启动钩子：配置开启 ClawBot 时确保推送通道就绪。
 * - 无凭证：弹出扫码登录（5 分钟超时），登录后自动进入激活等待
 * - 有凭证但无 contextToken：提示在微信给「微信 ClawBot」发条消息，长轮询抓取（2 分钟超时）
 * 超时或失败仅跳过推送，不阻塞任务。
 */
export declare function ensureClawBotReady(config?: WebhookClawBotConfig): Promise<boolean>;
//# sourceMappingURL=ClawBot.d.ts.map