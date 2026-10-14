import type { QueryEngineEntry } from '../interface/Config';
import type { MicrosoftRewardsBot } from '../index';
interface QueryManagerOptions {
    shuffle?: boolean;
    sourceOrder?: QueryEngineEntry[];
    langCode?: string;
    geoLocale?: string;
}
export declare function normalizeQueryKey(query: string): string;
export declare class QueryCore {
    private bot;
    constructor(bot: MicrosoftRewardsBot);
    private static readonly FALLBACK_THRESHOLD;
    private static readonly FALLBACK_LOCAL_SAMPLE;
    queryManager(options?: QueryManagerOptions): Promise<string[]>;
    getConfiguredSearchTopics(forceRefresh?: boolean): Promise<string[]>;
    getSearchCluster(mainTopic: string): Promise<string[]>;
    private normalizeAndDedupe;
    getGoogleTrends(geoLocale: string): Promise<string[]>;
    private extractJsonFromResponse;
    getBingSuggestions(query?: string, langCode?: string): Promise<string[]>;
    getBingRelatedTerms(query: string): Promise<string[]>;
    getWikipediaTrending(langCode?: string): Promise<string[]>;
    getRedditTopics(subreddit?: string): Promise<string[]>;
    getHackerNewsTopics(): Promise<string[]>;
    getWikipediaRandom(langCode?: string): Promise<string[]>;
    getRssTopics(selectors: string[]): Promise<string[]>;
    private resolveRssUrls;
    fetchRssTitles(url: string): Promise<string[]>;
    private parseRssTitles;
    getLocalQueryList(): string[];
    /**
     * 获取中国地区的热门搜索词（百度、抖音、微博、头条、知乎等）。
     * 数据源：gmya.net 热门词 API。
     * 策略：
     *   - appkey 配置在 searchSettings.chinaApi.appkey；留空走免费档。
     *   - 随机选取若干源聚合结果，分散 API 负载、增加搜索词多样性。
     *   - 免费档（无 appkey）有激进的频率限制：源与源之间插入随机退避，
     *     命中限流（403）后对后续源做指数退避；有 appkey 则不退避。
     *   - 某个源失败时自动 fallback 到剩余源，确保至少拿到 1 个源的数据。
     *
     * @param geoLocale - 地理区域代码，默认为'CN'
     * @returns 热搜标题字符串数组
     */
    getChinaTrends(geoLocale?: string): Promise<string[]>;
    /**
     * 构造 gmya.net 热搜 API 的请求 URL。
     */
    private buildChinaApiUrl;
    /**
     * 请求单个中国热搜源并解析标题。
     * 走 bot.http（统一代理、错误诊断、fingerprint headers），带 10s 超时。
     *
     * 诊断策略：正常就 return；任何异常都把"原始返回值"打到日志里，让看日志的人直接判断
     * 是限流、HTML 拦截页、维护 JSON 还是接口结构变更——比预先贴标签更有用。
     * 唯一例外是限流：上层退避需要它做控制流，所以用 ChinaApiRateLimitError 单独标记，
     * 但错误信息同样带上原始响应。
     *
     * 注：HttpClient（Impit）原生解压 gzip/br/zstd，fingerprint 注入的 accept-encoding
     * 无需像 axios 版本那样手动覆盖。
     */
    private fetchChinaHotWords;
    /**
     * 判断响应是否为 gmya.net 免费档限流。
     * 免费档限流响应：{ code: "403", msg: "您请求过于频繁，未使用账号appkey请求将限制请求频率" }
     * 没有 data 数组，需和真正的格式异常区分，否则会误导排查方向。
     */
    private isChinaRateLimited;
    /**
     * 把响应体序列化为可读字符串，诊断失败时用。
     * - 对象走 JSON.stringify
     * - 字符串原样返回（可能是 HTML 拦截/维护页）
     * - undefined/空记为 <无响应体>
     * - 非 UTF-8 响应体（gzip 压缩流 / GBK HTML 错误页 / CDN 二进制拦截页）：
     *   默认按 UTF-8 解码，非法字节被替换成 U+FFFD(�)，原始字节已丢失。
     *   原样写日志会产生乱码，且二进制流里的 0x0A(换行字节) 会把一条日志拆成
     *   多行、污染日志结构。这里检测到高密度替换符时改写为可读的诊断摘要。
     * 兜底截断到 1000 字符，防止上游误返回超大 HTML 污染日志。
     */
    private summarizeBody;
    /**
     * 描述 HttpClient 抛出的错误，返回可读文本 + 是否为限流。
     * - 带 status/response（HTTP 非 2xx，重试耗尽后抛出）：吐原始响应体，
     *   限流标记由 HTTP 状态码 403/429 判定
     * - 无 status/response（超时/断网/DNS）：吐错误 message
     */
    private describeFetchError;
}
export {};
//# sourceMappingURL=QueryEngine.d.ts.map