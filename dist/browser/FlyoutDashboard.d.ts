import type { ActivityAndQuiz, BasePromotion, DashboardData, DashboardImpression, Profile } from '../interface/DashboardData';
export declare const BOT_SCORE_WARNING = "Fraud_UserWarning_BotScore_UX";
type FlyoutProfileAttributes = Profile['attributes'] & {
    rbs?: string | number;
    rbs_upd?: string;
    SerpBotScore_upd?: string;
    AdsBotScore_upd?: string;
};
interface FlyoutProfile extends Omit<Profile, 'attributes'> {
    attributes: FlyoutProfileAttributes;
}
interface FlyoutCounters {
    PCSearch?: DashboardImpression[];
    MobileSearch?: DashboardImpression[];
    ActivityAndQuiz?: ActivityAndQuiz[];
    DailyPoint?: DashboardImpression[];
    pcSearch?: DashboardImpression[];
    mobileSearch?: DashboardImpression[];
    activityAndQuiz?: ActivityAndQuiz[];
    dailyPoint?: DashboardImpression[];
}
interface FlyoutUserStatus {
    availablePoints?: number;
    lifetimePoints?: number;
    lifetimeGivingPoints?: number;
    lifetimePointsRedeemed?: number;
    isRewardsUser?: boolean;
    counters?: FlyoutCounters;
    [key: string]: unknown;
}
interface FlyoutResult {
    userStatus?: FlyoutUserStatus;
    dailySetPromotions?: Record<string, BasePromotion[]>;
    morePromotions?: BasePromotion[];
    highValueActionPromotions?: BasePromotion[];
    edgeHighValueActionPromotions?: BasePromotion[];
    exploreOnBingPromotions?: BasePromotion[];
    exploreOnOutlookPromotions?: BasePromotion[];
    onboardingChecklistPromotions?: BasePromotion[];
    impressionPromotions?: BasePromotion[];
    [key: string]: unknown;
}
interface FlyoutUserInfo {
    isRewardsUser?: boolean;
    balance?: number;
    lifetimeGivingPoints?: number;
    errorCode?: number;
    errorMessage?: string | null;
    profile?: FlyoutProfile;
    [key: string]: unknown;
}
export interface RewardsFlyoutData {
    isError?: boolean;
    errorMessage?: string | null;
    userInfo?: FlyoutUserInfo;
    flyoutResult?: FlyoutResult;
    [key: string]: unknown;
}
export interface FlyoutBotDetection {
    likelyLimited: boolean;
    hasBotProfileMarkers: boolean;
    hasCollapsedActivities: boolean;
    pcSearchMax: number | null;
    activityAndQuizMax: number | null;
    dailyPointMax: number | null;
}
export declare function detectFlyoutBotWarning(data: RewardsFlyoutData): FlyoutBotDetection;
export declare function mapFlyoutToDashboard(data: RewardsFlyoutData): DashboardData;
export {};
//# sourceMappingURL=FlyoutDashboard.d.ts.map