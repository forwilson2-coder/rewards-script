"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureHumanize = configureHumanize;
exports.shouldSkipRunToday = shouldSkipRunToday;
exports.markRunSucceeded = markRunSucceeded;
exports.waitForQuietHours = waitForQuietHours;
exports.getSearchTargetRatio = getSearchTargetRatio;
exports.getReadToEarnArticleLimit = getReadToEarnArticleLimit;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const ConfigSync_1 = require("./ConfigSync");
const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const STATE_FILE = node_path_1.default.join((0, ConfigSync_1.getProjectRoot)(), 'logs', 'last-success.txt');
let bot = null;
function configureHumanize(botInstance) {
    bot = botInstance;
}
function humanizeConfig() {
    return bot?.config?.humanize;
}
function enabled() {
    return Boolean(humanizeConfig()?.enabled);
}
// ---------- 当天去重（skipWhenCompletedToday） ----------
const DATE_TZ = 'Asia/Shanghai';
function todayKey() {
    // 统一使用北京时间，避免服务器 UTC 时区导致跨天误判（凌晨任务场景）
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: DATE_TZ,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());
}
function shouldSkipRunToday() {
    if (!enabled() || !humanizeConfig()?.skipWhenCompletedToday)
        return false;
    try {
        return node_fs_1.default.readFileSync(STATE_FILE, 'utf8').trim() === todayKey();
    }
    catch {
        return false;
    }
}
function markRunSucceeded() {
    try {
        node_fs_1.default.mkdirSync(node_path_1.default.dirname(STATE_FILE), { recursive: true });
        node_fs_1.default.writeFileSync(STATE_FILE, todayKey());
    }
    catch {
        // 状态文件写入失败不影响主流程
    }
}
// ---------- 静默时段（quietHours） ----------
function parseHHMM(value) {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
    if (!match)
        return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59)
        return null;
    return hours * 60 + minutes;
}
function ruleAppliesToday(rule, dayKey) {
    return (rule.days ?? []).some(day => {
        const normalized = String(day).trim().toLowerCase();
        return normalized !== '' && dayKey.startsWith(normalized);
    });
}
function quietWaitMs() {
    const rules = enabled() ? humanizeConfig()?.quietHours : undefined;
    if (!rules?.length)
        return 0;
    const now = new Date();
    const dayKey = DAY_KEYS[now.getDay()] ?? '';
    const nowMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    let best = Number.POSITIVE_INFINITY;
    for (const rule of rules) {
        if (!ruleAppliesToday(rule, dayKey))
            continue;
        const start = parseHHMM(rule.start);
        const end = parseHHMM(rule.end);
        if (start === null || end === null || start === end)
            continue;
        let wait = -1;
        if (start < end) {
            if (nowMinutes >= start && nowMinutes < end)
                wait = end - nowMinutes;
        }
        else if (nowMinutes >= start || nowMinutes < end) {
            wait = nowMinutes >= start ? 1440 - nowMinutes + end : end - nowMinutes;
        }
        if (wait > 0)
            best = Math.min(best, wait);
    }
    return Number.isFinite(best) ? Math.max(Math.round(best * 60_000), 1000) : 0;
}
function formatClock(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}
async function waitForQuietHours() {
    for (let attempt = 0; attempt < 3; attempt++) {
        const waitMs = quietWaitMs();
        if (waitMs <= 0)
            return;
        const resumeAt = new Date(Date.now() + waitMs);
        bot?.logger.info('main', 'HUMANIZE', `当前处于静默时段，挂起到 ${formatClock(resumeAt)}（humanize.quietHours）`);
        await new Promise(resolve => setTimeout(resolve, waitMs));
    }
}
// ---------- 拟人化随机参数 ----------
function getSearchTargetRatio() {
    const range = enabled() ? humanizeConfig()?.searchTargetRatio : undefined;
    if (!range)
        return 1;
    const min = Math.min(Math.max(Number(range.min) || 0, 0), 1);
    const max = Math.min(Math.max(Number(range.max) || 0, min), 1);
    return min + Math.random() * (max - min);
}
function getReadToEarnArticleLimit(defaultLimit) {
    const range = enabled() ? humanizeConfig()?.readToEarnArticles : undefined;
    if (!range)
        return defaultLimit;
    const min = Math.max(1, Math.floor(Number(range.min) || defaultLimit));
    const max = Math.max(min, Math.floor(Number(range.max) || defaultLimit));
    return min + Math.floor(Math.random() * (max - min + 1));
}
//# sourceMappingURL=Humanize.js.map