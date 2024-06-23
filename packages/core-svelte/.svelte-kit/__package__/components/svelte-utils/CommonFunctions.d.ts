import type { Box } from "@freon4dsl/core";
import { FreEditor } from "@freon4dsl/core";
export declare function focusAndScrollIntoView(element: HTMLElement): void;
export declare function executeCustomKeyboardShortCut(event: KeyboardEvent, index: number, box: Box, editor: FreEditor): void;
export declare function isOdd(n: number): boolean;
export declare function isEven(n: number): boolean;
export declare function componentId(box: Box): string;
export declare function setBoxSizes(box: Box, rect: DOMRect): void;
/**
 * Replace HTML tags and spaces with HTML Entities.
 * Used to make text containing these acceptable as HTML Text.
 * SPACE => @nbsp;
 * "<"   => &lt;
 */
export declare function replaceHTML(s: string): string;
//# sourceMappingURL=CommonFunctions.d.ts.map