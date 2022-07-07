import type { Box } from "@projectit/core";

export function isOdd(n: number): boolean {
    return (n & 1) === 1;
}
export function isEven(n: number): boolean {
    return (n & 1) === 0;
}
export function componentId(box: Box): string {
    return `${box?.element.piId()}-${box?.role}`;

}

