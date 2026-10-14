"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSession = loadSession;
exports.saveStorageState = saveStorageState;
exports.saveFingerprint = saveFingerprint;
exports.loadResolvedRegion = loadResolvedRegion;
exports.saveResolvedRegion = saveResolvedRegion;
exports.closeSessionStore = closeSessionStore;
const node_sqlite_1 = require("node:sqlite");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
let db = null;
function platformOf(isMobile) {
    return isMobile ? 'mobile' : 'desktop';
}
function removeExpiredCookies(storageState) {
    const now = Date.now() / 1000;
    const cookies = storageState.cookies.filter(cookie => cookie.expires === -1 || !Number.isFinite(cookie.expires) || cookie.expires > now);
    const expiredCookiesRemoved = storageState.cookies.length - cookies.length;
    return {
        storageState: expiredCookiesRemoved ? { ...storageState, cookies } : storageState,
        expiredCookiesRemoved
    };
}
function getDb(sessionPath) {
    if (db)
        return db;
    const dir = node_path_1.default.resolve(process.cwd(), sessionPath);
    node_fs_1.default.mkdirSync(dir, { recursive: true, mode: 0o700 });
    try {
        node_fs_1.default.chmodSync(dir, 0o700);
    }
    catch { }
    const dbPath = node_path_1.default.join(dir, 'sessions.db');
    db = new node_sqlite_1.DatabaseSync(dbPath);
    try {
        node_fs_1.default.chmodSync(dbPath, 0o600);
    }
    catch { }
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA busy_timeout = 5000');
    db.exec('PRAGMA synchronous = NORMAL');
    db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
            email         TEXT NOT NULL,
            platform      TEXT NOT NULL,
            storage_state TEXT,
            fingerprint   TEXT,
            updated_at    INTEGER NOT NULL,
            PRIMARY KEY (email, platform)
        )
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS account_metadata (
            email           TEXT PRIMARY KEY COLLATE NOCASE,
            resolved_region TEXT,
            updated_at      INTEGER NOT NULL
        )
    `);
    return db;
}
function loadSession(sessionPath, email, isMobile, maxAgeMs) {
    const database = getDb(sessionPath);
    const row = database
        .prepare('SELECT storage_state, fingerprint, updated_at FROM sessions WHERE email = ? AND platform = ?')
        .get(email, platformOf(isMobile));
    if (!row)
        return null;
    if (maxAgeMs && Date.now() - row.updated_at > maxAgeMs) {
        return null;
    }
    const storedState = row.storage_state ? JSON.parse(row.storage_state) : null;
    const sanitized = storedState ? removeExpiredCookies(storedState) : { storageState: null, expiredCookiesRemoved: 0 };
    if (sanitized.expiredCookiesRemoved) {
        database
            .prepare('UPDATE sessions SET storage_state = ? WHERE email = ? AND platform = ?')
            .run(JSON.stringify(sanitized.storageState), email, platformOf(isMobile));
    }
    return {
        storageState: sanitized.storageState,
        fingerprint: row.fingerprint ? JSON.parse(row.fingerprint) : null,
        updatedAt: row.updated_at,
        expiredCookiesRemoved: sanitized.expiredCookiesRemoved
    };
}
function saveStorageState(sessionPath, email, isMobile, storageState) {
    const sanitized = removeExpiredCookies(storageState).storageState;
    getDb(sessionPath)
        .prepare(`INSERT INTO sessions (email, platform, storage_state, updated_at)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(email, platform)
             DO UPDATE SET storage_state = excluded.storage_state, updated_at = excluded.updated_at`)
        .run(email, platformOf(isMobile), JSON.stringify(sanitized), Date.now());
}
function saveFingerprint(sessionPath, email, isMobile, fingerprint) {
    getDb(sessionPath)
        .prepare(`INSERT INTO sessions (email, platform, fingerprint, updated_at)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(email, platform)
             DO UPDATE SET fingerprint = excluded.fingerprint, updated_at = excluded.updated_at`)
        .run(email, platformOf(isMobile), JSON.stringify(fingerprint), Date.now());
}
function loadResolvedRegion(sessionPath, email) {
    const row = getDb(sessionPath)
        .prepare('SELECT resolved_region FROM account_metadata WHERE email = ?')
        .get(email);
    return row?.resolved_region ?? undefined;
}
function saveResolvedRegion(sessionPath, email, region) {
    if (!/^[A-Z]{2}$/.test(region)) {
        throw new Error(`Invalid resolved account region: ${region}`);
    }
    getDb(sessionPath)
        .prepare(`INSERT INTO account_metadata (email, resolved_region, updated_at)
             VALUES (?, ?, ?)
             ON CONFLICT(email)
             DO UPDATE SET resolved_region = excluded.resolved_region, updated_at = excluded.updated_at`)
        .run(email, region, Date.now());
}
function closeSessionStore() {
    if (!db)
        return;
    try {
        db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
        db.close();
    }
    catch { }
    db = null;
}
//# sourceMappingURL=SessionStore.js.map