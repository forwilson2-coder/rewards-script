"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiSearchOnBing = void 0;
const BaseActivity_1 = require("../BaseActivity");
const SearchOnBingShared_1 = require("../search/SearchOnBingShared");
const BingSearchApi_1 = require("./BingSearchApi");
class ApiSearchOnBing extends BaseActivity_1.BaseActivity {
    searchApi = new BingSearchApi_1.BingSearchApi(this.bot);
    gainedPoints = 0;
    success = false;
    oldBalance = 0;
    async doSearchOnBing(promotion) {
        const offerId = promotion.offerId;
        this.oldBalance = Number(this.bot.userData.currentPoints ?? 0);
        this.gainedPoints = 0;
        this.success = false;
        this.bot.logger.info(this.bot.isMobile, 'SEARCH-ON-BING', `开始 SearchOnBing | offerId=${offerId} | 标题="${promotion.title}" | 当前余额=${this.oldBalance}`);
        try {
            if (!(await (0, SearchOnBingShared_1.activateSearchOnBing)(this.bot, promotion))) {
                this.bot.logger.warn(this.bot.isMobile, 'SEARCH-ON-BING', `搜索活动无法激活，中止 | offerId=${offerId}`);
                return;
            }
            const queries = await (0, SearchOnBingShared_1.getSearchOnBingQueries)(this.bot, promotion);
            await this.searchBing(queries, promotion);
            if (this.success) {
                this.bot.logger.info(this.bot.isMobile, 'SEARCH-ON-BING', `SearchOnBing 完成 | offerId=${offerId} | 获得积分=${this.gainedPoints} | 当前余额=${this.bot.userData.currentPoints} | 原余额=${this.oldBalance}`, 'green');
            }
            else {
                this.bot.logger.warn(this.bot.isMobile, 'SEARCH-ON-BING', `SearchOnBing 失败 | offerId=${offerId} | 获得积分=${this.gainedPoints} | 当前余额=${this.bot.userData.currentPoints} | 原余额=${this.oldBalance}`);
            }
        }
        catch (error) {
            this.bot.logger.error(this.bot.isMobile, 'SEARCH-ON-BING', `doSearchOnBing 出错 | offerId=${offerId} | 错误=${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async searchBing(queries, promotion) {
        queries = [...new Set(queries)];
        const offerId = promotion.offerId;
        const cgDashboard = (await this.bot.browser.func.getDashboardData()).dashboard;
        const cg = this.buildCategoryGroup(cgDashboard, offerId);
        this.bot.logger.debug(this.bot.isMobile, 'SEARCH-ON-BING-SEARCH', `分类组 | cg=${cg || '(none)'}`);
        this.bot.logger.debug(this.bot.isMobile, 'SEARCH-ON-BING-SEARCH', `开始搜索循环 | 查询数=${queries.length} | 目标积分=${promotion.pointProgressMax} | 当前余额=${this.oldBalance}`);
        let lastBalance = this.oldBalance;
        for (const [index, query] of queries.entries()) {
            try {
                this.bot.logger.debug(this.bot.isMobile, 'SEARCH-ON-BING-SEARCH', `处理查询 | 查询="${query}"`);
                const { ig } = await this.searchApi.report(query, cg ? { cg } : undefined);
                if (!ig) {
                    this.bot.logger.warn(this.bot.isMobile, 'SEARCH-ON-BING-SEARCH', `查询 "${query}" 未返回 IG - 跳过该查询`);
                    continue;
                }
                await this.bot.utils.wait(this.bot.utils.randomDelay(5000, 7000));
                const dashboard = (await this.bot.browser.func.getDashboardData()).dashboard;
                const newBalance = dashboard.userStatus.availablePoints;
                const offer = (0, SearchOnBingShared_1.findSearchOnBingOffer)(dashboard, offerId);
                const delta = newBalance - lastBalance;
                if (delta > 0) {
                    this.bot.userData.gainedPoints = (this.bot.userData.gainedPoints ?? 0) + delta;
                    lastBalance = newBalance;
                }
                this.bot.userData.currentPoints = newBalance;
                this.gainedPoints = newBalance - this.oldBalance;
                const offerProgress = offer ? `${offer.pointProgress}/${offer.pointProgressMax}` : 'unknown';
                const offerComplete = !!offer &&
                    (offer.complete || (offer.pointProgressMax > 0 && offer.pointProgress >= offer.pointProgressMax));
                this.bot.logger.debug(this.bot.isMobile, 'SEARCH-ON-BING-SEARCH', `进度检查 | 查询="${query}" | 活动进度=${offerProgress} | 活动完成=${offerComplete} | 当前余额=${newBalance}`);
                if (offerComplete) {
                    this.success = true;
                    this.bot.logger.info(this.bot.isMobile, 'SEARCH-ON-BING-SEARCH', `SearchOnBing 活动完成 | 获得积分=${this.gainedPoints} | 当前余额=${newBalance} | 查询="${query}" | 活动进度=${offerProgress}`, 'green');
                    return;
                }
                this.bot.logger.warn(this.bot.isMobile, 'SEARCH-ON-BING-SEARCH', `${index + 1}/${queries.length} | 活动未完成 | 活动进度=${offerProgress} | 查询="${query}"`);
            }
            catch (error) {
                this.bot.logger.error(this.bot.isMobile, 'SEARCH-ON-BING-SEARCH', `搜索循环出错 | 查询="${query}" | 错误=${error instanceof Error ? error.message : String(error)}`);
            }
            finally {
                if (!this.success && index < queries.length - 1) {
                    await this.bot.utils.wait(this.bot.utils.randomDelay(5000, 15000));
                }
            }
        }
        this.bot.logger.warn(this.bot.isMobile, 'SEARCH-ON-BING-SEARCH', `所有查询已用完但活动未完成 | 已尝试查询数=${queries.length} | offerId=${offerId} | 获得积分=${this.gainedPoints} | 当前余额=${this.bot.userData.currentPoints} | 原余额=${this.oldBalance}`);
    }
    buildCategoryGroup(dashboard, targetOfferId) {
        const pools = [
            ...Object.values(dashboard.dailySetPromotions ?? {}).flat(),
            ...(dashboard.morePromotions ?? []),
            ...(dashboard.promotionalItems ?? []),
            ...(dashboard.promotionalItem ? [dashboard.promotionalItem] : [])
        ];
        const categoryOf = (id) => {
            const m = id.match(/(?:^|_)([a-z0-9]+)_exploreonbing/i);
            return m?.[1]?.toLowerCase() ?? null;
        };
        const categories = new Set();
        const target = categoryOf(targetOfferId);
        if (target)
            categories.add(target);
        for (const offer of pools) {
            const cat = categoryOf(offer.offerId ?? '');
            if (cat)
                categories.add(cat);
        }
        return [...categories].join(',');
    }
}
exports.ApiSearchOnBing = ApiSearchOnBing;
//# sourceMappingURL=ApiSearchOnBing.js.map