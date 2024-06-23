import { writable } from 'svelte/store';
export class ViewportSizes {
    width = 0;
    height = 0;
    top = 0;
    left = 0;
    setSizes(height, width, top, left) {
        this.height = height;
        this.width = width;
        this.top = top;
        this.left = left;
    }
}
export const viewport = writable(new ViewportSizes());
