"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOT_SCORE_WARNING = void 0;
exports.detectFlyoutBotWarning = detectFlyoutBotWarning;
exports.mapFlyoutToDashboard = mapFlyoutToDashboard;
exports.BOT_SCORE_WARNING = 'Fraud_UserWarning_BotScore_UX';
function detectFlyoutBotWarning(data) {
    const attributes = data.userInfo?.profile?.attributes;
    const counters = data.flyoutResult?.userStatus?.counters;
    const pcSearchMax = sumCounterMaximum(counters?.PCSearch ?? counters?.pcSearch);
    const activityAndQuizMax = sumCounterMaximum(counters?.ActivityAndQuiz ?? counters?.activityAndQuiz);
    const dailyPointMax = sumCounterMaximum(counters?.DailyPoint ?? counters?.dailyPoint);
    const hasBotProfileMarkers = String(attributes?.rbs ?? '').trim() === '1' &&
        Boolean(attributes?.SerpBotScore_upd) &&
        Boolean(attributes?.AdsBotScore_upd);
    const hasCollapsedActivities = activityAndQuizMax === 0 && pcSearchMax !== null && dailyPointMax !== null && dailyPointMax === pcSearchMax;
    return {
        likelyLimited: hasBotProfileMarkers && hasCollapsedActivities,
        hasBotProfileMarkers,
        hasCollapsedActivities,
        pcSearchMax,
        activityAndQuizMax,
        dailyPointMax
    };
}
function mapFlyoutToDashboard(data) {
    const userInfo = data.userInfo;
    const flyout = data.flyoutResult;
    const profile = userInfo?.profile;
    const flyoutStatus = flyout?.userStatus;
    if (data.isError || !userInfo?.isRewardsUser || !profile || !flyout || !flyoutStatus?.isRewardsUser) {
        const message = data.errorMessage ?? userInfo?.errorMessage ?? 'Flyout response is missing Rewards account data';
        throw new Error(message);
    }
    const counters = flyoutStatus.counters ?? {};
    const highValuePromotions = flyout.highValueActionPromotions ?? [];
    const additionalPromotions = uniquePromotions([
        ...(flyout.edgeHighValueActionPromotions ?? []),
        ...(flyout.exploreOnBingPromotions ?? []),
        ...(flyout.exploreOnOutlookPromotions ?? []),
        ...(flyout.onboardingChecklistPromotions ?? [])
    ]);
    const botDetection = detectFlyoutBotWarning(data);
    const dashboard = {
        ...flyout,
        userStatus: {
            ...flyoutStatus,
            availablePoints: numberOrFallback(flyoutStatus.availablePoints, userInfo.balance),
            lifetimePoints: numberOrFallback(flyoutStatus.lifetimePoints, 0),
            lifetimePointsRedeemed: numberOrFallback(flyoutStatus.lifetimePointsRedeemed, 0),
            lifetimeGivingPoints: numberOrFallback(flyoutStatus.lifetimeGivingPoints, userInfo.lifetimeGivingPoints),
            isRewardsUser: true,
            counters: {
                pcSearch: counters.PCSearch ?? counters.pcSearch ?? [],
                mobileSearch: counters.MobileSearch ?? counters.mobileSearch ?? [],
                activityAndQuiz: counters.ActivityAndQuiz ?? counters.activityAndQuiz ?? [],
                dailyPoint: counters.DailyPoint ?? counters.dailyPoint ?? []
            }
        },
        userWarnings: botDetection.likelyLimited ? [{ name: exports.BOT_SCORE_WARNING }] : [],
        userProfile: profile,
        promotionalItem: highValuePromotions[0] ?? null,
        promotionalItems: uniquePromotions([...highValuePromotions.slice(1), ...additionalPromotions]),
        dailySetPromotions: flyout.dailySetPromotions ?? {},
        morePromotions: flyout.morePromotions ?? [],
        morePromotionsWithoutPromotionalItems: [],
        punchCards: [],
        componentImpressionPromotions: flyout.impressionPromotions ?? []
    };
    return {
        dashboard,
        profile
    };
}
function sumCounterMaximum(counters) {
    if (!counters?.length)
        return null;
    return counters.reduce((total, counter) => total + Math.max(0, Number(counter.pointProgressMax) || 0), 0);
}
function numberOrFallback(primary, fallback) {
    const primaryNumber = Number(primary);
    if (Number.isFinite(primaryNumber))
        return primaryNumber;
    const fallbackNumber = Number(fallback);
    return Number.isFinite(fallbackNumber) ? fallbackNumber : 0;
}
function uniquePromotions(promotions) {
    return [...new Map(promotions.filter(Boolean).map(promotion => [promotion.offerId, promotion])).values()];
}
//# sourceMappingURL=FlyoutDashboard.js.map