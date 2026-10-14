import { BrowserContext } from 'patchright';
import { BrowserFingerprintWithHeaders } from 'fingerprint-generator';
import type { MicrosoftRewardsBot } from '../index';
import type { Account } from '../interface/Account';
interface BrowserCreationResult {
    context: BrowserContext;
    fingerprint: BrowserFingerprintWithHeaders;
}
declare class Browser {
    private readonly bot;
    private readonly fingerprintGenerator;
    private readonly userAgentManager;
    private static readonly BROWSER_ARGS;
    constructor(bot: MicrosoftRewardsBot);
    createBrowser(account: Account): Promise<BrowserCreationResult>;
    generateFingerprint(isMobile: boolean): Promise<BrowserFingerprintWithHeaders>;
    /**
     * headless 下真实 Edge 的 navigator.userAgent 会被标记为 HeadlessChrome。
     * 读取原始值并替换为真实形态（Chrome/{major}.0.0.0 ... Edg/{major}.0.0.0），
     * 供 newContext 显式覆盖 navigator 与 HTTP 头。
     */
    private resolveNativeUserAgent;
    /**
     * 从真实浏览器环境读取 UA 与 Client Hints，构造 HTTP 层使用的"真指纹"。
     * 仅在真实 Edge 桌面端（不注入合成指纹）时使用。
     */
    private captureNativeFingerprint;
}
export default Browser;
//# sourceMappingURL=Browser.d.ts.map