import type { IframelyMessage } from './types.js';
export declare function boot(): void;
export declare function postMessage(message: IframelyMessage | string, target_url?: string, target?: Window | null): void;
