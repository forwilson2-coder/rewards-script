"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendServerChan = sendServerChan;
exports.flushServerChanQueue = flushServerChanQueue;
const Http_1 = require("../util/Http");
const p_queue_1 = __importDefault(require("p-queue"));
const Queue_1 = require("./Queue");
const serverChanQueue = new p_queue_1.default({
    interval: 1000,
    intervalCap: 2,
    carryoverConcurrencyCount: true
});
async function sendServerChan(config, content) {
    if (!config?.sendKey)
        return;
    const request = {
        method: 'POST',
        url: `https://sctapi.ft07.com/${config.sendKey}.send`,
        headers: { 'Content-Type': 'application/json' },
        data: {
            title: config.title ?? 'Microsoft-Rewards-Script',
            desp: content
        },
        timeout: 10000
    };
    await serverChanQueue.add(async () => {
        try {
            await (0, Http_1.httpRequest)(request);
        }
        catch (err) {
            const status = err?.response?.status;
            if (status === 429)
                return;
        }
    });
}
function flushServerChanQueue(timeoutMs = 5000) {
    return (0, Queue_1.flushQueue)(serverChanQueue, timeoutMs);
}
//# sourceMappingURL=ServerChan.js.map