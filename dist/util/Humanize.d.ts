import type { MicrosoftRewardsBot } from '../index';
export declare function configureHumanize(botInstance: MicrosoftRewardsBot): void;
export declare function shouldSkipRunToday(): boolean;
export declare function markRunSucceeded(): void;
export declare function waitForQuietHours(): Promise<void>;
export declare function getSearchTargetRatio(): number;
export declare function getReadToEarnArticleLimit(defaultLimit: number): number;
//# sourceMappingURL=Humanize.d.ts.map