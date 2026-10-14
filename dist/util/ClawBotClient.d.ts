export interface ClawBotAuth {
    token: string;
    accountId: string;
    userId: string;
    contextToken?: string;
    getUpdatesBuf?: string;
    savedAt: string;
}
export type ClawBotSendResult = 'ok' | 'expired' | 'needs-activation' | 'error';
export declare function resolveClawBotAuthFile(customPath?: string): string;
export declare function loadClawBotAuth(customPath?: string): ClawBotAuth | null;
export declare function saveClawBotAuth(auth: ClawBotAuth, customPath?: string): void;
export declare function clearClawBotAuth(customPath?: string): void;
export declare function sendClawBotText(auth: ClawBotAuth, text: string): Promise<ClawBotSendResult>;
export interface ClawBotLoginResult {
    ok: boolean;
    auth?: ClawBotAuth;
    message: string;
}
/**
 * 交互式扫码登录：终端展示二维码，等待手机微信确认。
 * 总超时默认 5 分钟；期间处理数字配对码、二维码过期刷新与 IDC 重定向。
 */
export declare function loginClawBotInteractive(customAuthPath?: string, timeoutMs?: number): Promise<ClawBotLoginResult>;
/**
 * 激活等待：提示用户给「微信 ClawBot」发一条消息，通过 getupdates 长轮询抓取
 * 消息中的 context_token 并持久化。iLink 要求主动发送必须携带该 token
 * （无 token 时 sendmessage 返回 ret=-2 "prepare failed"）。
 */
export declare function waitForClawBotActivation(auth: ClawBotAuth, customAuthPath?: string, timeoutMs?: number): Promise<boolean>;
//# sourceMappingURL=ClawBotClient.d.ts.map