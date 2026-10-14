// Ambient declarations for CJS deps lacking published @types.
// TSC runs before npm's --no-global install can lay down @types/ms & @types/semver.

declare module "ms" {
    export type StringValue = string;
    interface MsFn {
        (value: string): number | undefined;
        (value: number, options?: { long?: boolean }): string;
    }
    const ms: MsFn;
    export default ms;
}

declare module "semver" {
    export function valid(v: string): string | null;
    export function gt(a: string, b: string): boolean;
    export function lt(a: string, b: string): boolean;
    export function gte(a: string, b: string): boolean;
    export function lte(a: string, b: string): boolean;
    export function satisfies(v: string, range: string): boolean;
    export function coerce(v: string): { version: string } | null;
    const semver: {
        valid(v: string): string | null;
        gt(a: string, b: string): boolean;
        lt(a: string, b: string): boolean;
        satisfies(v: string, range: string): boolean;
        coerce(v: string): { version: string } | null;
    };
    export default semver;
}