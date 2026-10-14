"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchQueryQueue = void 0;
const QueryEngine_1 = require("./QueryEngine");
class SearchQueryQueue {
    bot;
    queryCore;
    topics = [];
    topicIndex = 0;
    activeCluster = [];
    activeMainTopic = '';
    activeClusterSize = 0;
    activeClusterIndex = 0;
    seenTopics = new Set();
    seenQueries = new Set();
    refillCount = 0;
    constructor(bot, queryCore = new QueryEngine_1.QueryCore(bot)) {
        this.bot = bot;
        this.queryCore = queryCore;
    }
    async prepare() {
        if (!this.topics.length)
            await this.refillTopics();
        this.bot.logger.debug(this.bot.isMobile, 'QUERY-QUEUE', `队列已准备 | 主题数=${this.topics.length} | 聚类搜索=${this.bot.config.searchSettings.clusterSearch}`);
        return this.topics.length;
    }
    async next() {
        while (!this.activeCluster.length) {
            if (this.activeMainTopic) {
                this.bot.logger.debug(this.bot.isMobile, 'QUERY-QUEUE', `聚类已用尽 | 主题="${this.activeMainTopic}" | 已发出=${this.activeClusterIndex}/${this.activeClusterSize}`);
            }
            const mainTopic = await this.nextMainTopic();
            if (!mainTopic) {
                this.bot.logger.debug(this.bot.isMobile, 'QUERY-QUEUE', `队列已耗尽 | 已见主题=${this.seenTopics.size} | 已见查询=${this.seenQueries.size}`);
                return null;
            }
            const cluster = await this.queryCore.getSearchCluster(mainTopic);
            let skippedSeen = 0;
            this.activeCluster = cluster.filter(query => {
                const key = (0, QueryEngine_1.normalizeQueryKey)(query);
                if (!key || this.seenQueries.has(key)) {
                    skippedSeen++;
                    return false;
                }
                this.seenQueries.add(key);
                return true;
            });
            this.activeMainTopic = mainTopic;
            this.activeClusterSize = this.activeCluster.length;
            this.activeClusterIndex = 0;
            this.bot.logger.debug(this.bot.isMobile, 'QUERY-QUEUE', `聚类已激活 | 主题="${mainTopic}" | 主题序号=${this.topicIndex}/${this.topics.length} | 接收=${cluster.length} | 入队=${this.activeCluster.length} | 跳过已见=${skippedSeen}`);
        }
        const query = this.activeCluster.shift() ?? null;
        if (!query)
            return null;
        this.activeClusterIndex++;
        this.bot.logger.debug(this.bot.isMobile, 'QUERY-QUEUE', `出队查询 | 主题="${this.activeMainTopic}" | 查询=${this.activeClusterIndex}/${this.activeClusterSize} | 剩余=${this.activeCluster.length} | 值="${query}"`);
        return query;
    }
    async nextMainTopic() {
        while (this.topicIndex >= this.topics.length) {
            if ((await this.refillTopics()) === 0)
                return null;
        }
        const topic = this.topics[this.topicIndex++];
        if (!topic)
            return null;
        this.seenTopics.add((0, QueryEngine_1.normalizeQueryKey)(topic));
        return topic;
    }
    async refillTopics() {
        const topics = await this.queryCore.getConfiguredSearchTopics(this.refillCount > 0);
        this.refillCount++;
        this.topics = topics.filter(topic => {
            const key = (0, QueryEngine_1.normalizeQueryKey)(topic);
            return key.length > 0 && !this.seenTopics.has(key);
        });
        this.topicIndex = 0;
        this.bot.logger.debug(this.bot.isMobile, 'QUERY-QUEUE', `主题池已补充 | 接收=${topics.length} | 入队=${this.topics.length} | 此前已见=${this.seenTopics.size}`);
        return this.topics.length;
    }
}
exports.SearchQueryQueue = SearchQueryQueue;
//# sourceMappingURL=SearchQueryQueue.js.map