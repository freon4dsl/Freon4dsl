import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

export class ViewportSizes {
    width: number = 0;
    height: number = 0;
    top: number = 0;
    left: number = 0;

    setSizes(height, width, top, left) {
        this.height = height;
        this.width = width;
        this.top = top;
        this.left = left;
    }
}

export const viewport: Writable<ViewportSizes> = writable<ViewportSizes>(new ViewportSizes());
