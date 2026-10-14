import chalk from 'chalk';
import type { MicrosoftRewardsBot } from '../index';
export type Platform = boolean | 'main';
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type ColorKey = keyof typeof chalk;
export interface IpcLog {
    content: string;
    level: LogLevel;
}
/**
 * 本地时区的 YYYY-MM-DD HH:mm:ss(.sss) 时间戳，用于日志与推送展示
 */
export declare function formatLocalTimestamp(date: Date, withMilliseconds?: boolean): string;
export declare class Logger {
    private bot;
    constructor(bot: MicrosoftRewardsBot);
    info(isMobile: Platform, title: string, message: string, color?: ColorKey): void;
    warn(isMobile: Platform, title: string, message: string | Error, color?: ColorKey): void;
    error(isMobile: Platform, title: string, message: string | Error, color?: ColorKey): void;
    debug(isMobile: Platform, title: string, message: string | Error, color?: ColorKey): void;
    private baseLog;
    private shouldPassFilter;
}
//# sourceMappingURL=Logger.d.ts.map