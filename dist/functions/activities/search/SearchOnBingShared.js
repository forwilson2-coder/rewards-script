"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateSearchOnBing = activateSearchOnBing;
exports.findSearchOnBingOffer = findSearchOnBingOffer;
exports.getSearchOnBingQueries = getSearchOnBingQueries;
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const urls_1 = require("../../../constants/urls");
async function activateSearchOnBing(bot, promotion) {
    const offerId = promotion.offerId;
    const actionId = bot.nextActions.reportActivity;
    if (!actionId) {
        bot.logger.warn(bot.isMobile, 'SEARCH-ON-BING-ACTIVATE', `跳过 ${offerId}: 未在 bundle 中发现 "reportActivity"`);
        return false;
    }
    const live = await bot.browser.func.ensureOffer(offerId);
    const hash = live?.hash ?? promotion.hash ?? null;
    if (!hash) {
        bot.logger.warn(bot.isMobile, 'SEARCH-ON-BING-ACTIVATE', `跳过 ${offerId}: 激活活动无可用 hash`);
        return false;
    }
    try {
        const { status, acknowledged } = await bot.browser.func.reportServerAction(actionId, [
            hash,
            11,
            {
                offerid: offerId,
                isPromotional: '$undefined',
                timezoneOffset: bot.userData.timezoneOffset
            }
        ]);
        bot.logger.info(bot.isMobile, 'SEARCH-ON-BING-ACTIVATE', `活动已激活 | offerId=${offerId} | 状态=${status} | 已确认=${acknowledged}`);
        return acknowledged;
    }
    catch (error) {
        bot.logger.error(bot.isMobile, 'SEARCH-ON-BING-ACTIVATE', `激活失败 | offerId=${offerId} | 错误=${error instanceof Error ? error.message : String(error)}`);
        return false;
    }
}
function findSearchOnBingOffer(dashboard, offerId) {
    const offers = [
        ...Object.values(dashboard.dailySetPromotions ?? {}).flat(),
        ...(dashboard.morePromotions ?? []),
        ...(dashboard.promotionalItems ?? []),
        ...(dashboard.promotionalItem ? [dashboard.promotionalItem] : [])
    ];
    return offers.find(offer => offer.offerId === offerId);
}
async function getSearchOnBingQueries(bot, promotion) {
    try {
        let activities;
        if (bot.config.searchOnBingLocalQueries) {
            bot.logger.debug(bot.isMobile, 'SEARCH-ON-BING-QUERY', '使用本地查询词配置文件');
            activities = JSON.parse(fs.readFileSync(path_1.default.join(__dirname, '../../bing-search-activity-queries.json'), 'utf8'));
        }
        else {
            bot.logger.debug(bot.isMobile, 'SEARCH-ON-BING-QUERY', '从远程仓库获取查询词配置');
            activities = (await bot.http.request({
                method: 'GET',
                url: urls_1.URLs.github.searchOnBingQueries
            })).data;
        }
        const match = activities.find(activity => bot.utils.normalizeString(activity.title) === bot.utils.normalizeString(promotion.title));
        if (match?.queries.length) {
            const shuffled = bot.utils.shuffleArray(match.queries);
            bot.logger.info(bot.isMobile, 'SEARCH-ON-BING-QUERY', `为 "${promotion.title}" 找到 ${shuffled.length} 条查询词 | 来源=${bot.config.searchOnBingLocalQueries ? '本地' : '远程'}`);
            return shuffled;
        }
        bot.logger.info(bot.isMobile, 'SEARCH-ON-BING-QUERY', `"${promotion.title}" 无精选查询词，回退使用活动标题与描述`);
        return fallbackQueries(promotion);
    }
    catch (error) {
        bot.logger.error(bot.isMobile, 'SEARCH-ON-BING-QUERY', `解析查询词出错 | 标题="${promotion.title}" | 错误=${error instanceof Error ? error.message : String(error)} | 回退=标题与描述`);
        return fallbackQueries(promotion);
    }
}
function fallbackQueries(promotion) {
    const title = (promotion.title ?? '').trim();
    const description = (promotion.description ?? '').trim();
    const derived = extractSearchTerm(description);
    return [...new Set([derived, title, description].map(value => value.trim()).filter(Boolean))];
}
// Microsoft currently supplies English instruction prefixes for this fallback path.
function extractSearchTerm(description) {
    if (!description)
        return '';
    return description
        .trim()
        .replace(/^\s*(?:search(?:\s+on\s+bing|\s+bing|\s+the\s+web)?\s+for|look\s+up|find|explore|discover)\b[\s:]+/i, '')
        .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
        .replace(/[.!?]+$/g, '')
        .trim();
}
//# sourceMappingURL=SearchOnBingShared.js.map