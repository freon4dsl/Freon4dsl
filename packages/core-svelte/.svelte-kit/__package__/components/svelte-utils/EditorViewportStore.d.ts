/// <reference types="svelte" />
import type { Writable } from 'svelte/store';
export declare class ViewportSizes {
    width: number;
    height: number;
    top: number;
    left: number;
    setSizes(height: number, width: number, top: number, left: number): void;
}
export declare const viewport: Writable<ViewportSizes>;
//# sourceMappingURL=EditorViewportStore.d.ts.map