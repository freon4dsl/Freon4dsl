import type {FreError} from "../validator/index.js";
import type {FreNode} from "../ast/index.js";
import {isNullOrUndefined, notNullOrUndefined} from "../util/index.js";
import type {Box} from "./boxes/index.js";
import {ElementBox, isActionBox, isSelectBox, isTextBox} from "./boxes/index.js";
import type {FreEditor} from "./FreEditor.js";
import {FreLogger} from "../logging/index.js";
import {UndefinedRectangle} from "./ClientRectangleTypes.js";

const LOGGER: FreLogger = new FreLogger("FreErrorDecorator").mute();

// Margin, measure in number of pixels, used to identify whether boxes are on the same 'line'.
const LINE_HEIGHT_MARGIN: number = 6;

/**
 * Creates a unique key for an error to enable fast comparison
 */
function errorKey(err: FreError): string {
    if (Array.isArray(err.reportedOn)) {
        return err.reportedOn.map(n => n?.freId?.() ?? 'null').join(',') + '|' + (err.propertyName ?? '') + '|' + err.message;
    }
    return (err.reportedOn?.freId?.() ?? 'null') + '|' + (err.propertyName ?? '') + '|' + err.message;
}

/**
 * Checks if two error lists are equivalent (same errors, possibly different order)
 */
function errorsAreEqual(a: FreError[], b: FreError[]): boolean {
    if (a.length !== b.length) return false;
    if (a.length === 0) return true;

    const aKeys = new Set(a.map(errorKey));
    return b.every(err => aKeys.has(errorKey(err)));
}

export class FreErrorDecorator {
    private myEditor: FreEditor;
    // The list of errors from the previous run of the validator
    private previousList: FreError[] = [];
    // The list of erroneous boxes from the latest run of the validator
    private erroneousBoxes: Box[] = [];
    // Cache of node ID to box mapping for faster lookups
    private boxCache: Map<string, Box> = new Map();
    // Track boxes that currently have errors set (for efficient clearing)
    private currentErrorBoxes: Set<Box> = new Set();

    constructor(editor: FreEditor) {
        this.myEditor = editor;
    }

    /**
     * Clears the box cache. Should be called when projections change.
     */
    clearCache(): void {
        this.boxCache.clear();
    }

    /**
     * Clears all error state. Should be called when switching between models/studies
     * to prevent stale box references from causing errors.
     */
    clearAll(): void {
        this.boxCache.clear();
        this.previousList = [];
        this.erroneousBoxes = [];
        this.currentErrorBoxes.clear();
    }

    /**
     * This method makes sure that for all boxes that display nodes that are in the error list,
     * the hasError setter is being called.
     *
     * OPTIMIZATIONS:
     * 1. Early exit if errors haven't changed
     * 2. Cache box lookups to avoid repeated tree traversals
     * 3. Batch DOM updates by deferring isDirty() calls
     * 4. Only process boxes that actually changed
     *
     * @param errors
     */
    setErrors(errors: FreError[]) {
        // OPTIMIZATION 1: Early exit if errors haven't changed
        if (errorsAreEqual(this.previousList, errors)) {
            LOGGER.log("setErrors: errors unchanged, skipping update")
            return
        }

        const startTime = performance?.now()

        // Collect all boxes that need updating before making any changes
        // This avoids triggering multiple re-renders
        const boxesToClear: Box[] = []
        const boxesToSet: { box: Box; message: string }[] = []
        const newErrorBoxes: Set<Box> = new Set()

        // OPTIMIZATION 2: Build a set of node IDs that have errors in the new list
        // for quick lookup when deciding what to clear
        const newErrorNodeIds = new Set<string>()
        errors.forEach((err) => {
            if (Array.isArray(err.reportedOn)) {
                err.reportedOn.forEach((n) => {
                    if (n?.freId) newErrorNodeIds.add(this.makeNodeKey(n, err.propertyName))
                })
            } else if (err.reportedOn?.freId) {
                newErrorNodeIds.add(this.makeNodeKey(err.reportedOn, err.propertyName))
            }
        })

        // OPTIMIZATION 3: Only clear boxes that won't be set again
        // (avoids unnecessary clear+set cycles)
        this.currentErrorBoxes.forEach((box) => {
            if (box && notNullOrUndefined(box.node)) {
                const nodeKey = this.makeNodeKey(box.node, box.propertyName)
                if (!newErrorNodeIds.has(nodeKey)) {
                    boxesToClear.push(box)
                }
            }
        })

        // Find boxes for new errors
        errors.forEach((err) => {
            if (Array.isArray(err.reportedOn)) {
                err.reportedOn.forEach((x, index) => {
                    const box = this.findBoxForNodeCached(x, err.propertyName, index)
                    if (box) {
                        boxesToSet.push({ box, message: err.message })
                        newErrorBoxes.add(box)
                    }
                })
            } else {
                const box = this.findBoxForNodeCached(err.reportedOn, err.propertyName)
                if (box) {
                    boxesToSet.push({ box, message: err.message })
                    newErrorBoxes.add(box)
                }
            }
        })

        // OPTIMIZATION 4: Batch the updates
        // First, clear old errors (without triggering isDirty for each)
        boxesToClear.forEach((box) => {
            if (box) {
                this.clearErrorOnBoxSilent(box)
            }
        })

        // Then set new errors
        this.erroneousBoxes = []
        boxesToSet.forEach(({ box, message }) => {
            this.setErrorOnBoxSilent(box, message)
            if (!this.erroneousBoxes.includes(box)) {
                this.erroneousBoxes.push(box)
            }
        })

        // OPTIMIZATION 5: Single batch refresh for all affected boxes
        // Instead of calling isDirty() on each box, we trigger one refresh
        const allAffectedBoxes = new Set([...boxesToClear, ...boxesToSet.map((b) => b.box)])
        allAffectedBoxes.forEach((box) => {
            if (box?.refreshComponent) {
                try {
                    // Verify box is still in the tree before refreshing
                    // This prevents errors when switching between units
                    if (this.myEditor.isBoxInTree(box)) {
                        box.refreshComponent("error state changed")
                    }
                } catch (e) {
                    // Box may have been orphaned during study switch, ignore
                    LOGGER.log(`refreshComponent failed for box ${box.id}: ${e}`)
                }
            }
        })

        // Update tracking
        this.previousList = errors
        this.currentErrorBoxes = newErrorBoxes

        // Defer gutter gathering to next frame to avoid layout thrashing
        if (this.erroneousBoxes.length > 0) {
            if (typeof requestAnimationFrame !== "undefined") {
                requestAnimationFrame(() => {
                    this.gatherMessagesForGutter()
                })
            }
        }

        const endTime = performance?.now()
        if (startTime !== undefined && endTime !== undefined && endTime - startTime > 50) {
            console.warn(`FreErrorDecorator.setErrors took ${(endTime-startTime).toFixed(2)}ms for ${errors.length} errors`)
        }
    }

    /**
     * Creates a unique key for a node + property combination
     */
    private makeNodeKey(node: FreNode, propertyName?: string, propertyIndex?: number): string {
        const nodeId = node?.freId?.() ?? 'null';
        return `${nodeId}|${propertyName ?? ''}|${propertyIndex ?? ''}`;
    }

    /**
     * Cached version of findBoxForNode to avoid repeated tree traversals
     */
    private findBoxForNodeCached(node: FreNode, propertyName?: string, propertyIndex?: number): Box | null {
        if (!node) return null;

        const cacheKey = this.makeNodeKey(node, propertyName, propertyIndex);

        // Check cache first
        if (this.boxCache.has(cacheKey)) {
            const cachedBox = this.boxCache.get(cacheKey);
            // Verify the cached box is still valid (in the tree)
            if (cachedBox && this.myEditor.isBoxInTree(cachedBox)) {
                return cachedBox;
            }
            // Cache is stale, remove it
            this.boxCache.delete(cacheKey);
        }

        // Find the box
        let box: Box = this.myEditor.findBoxForNode(node, propertyName, propertyIndex);
        if (notNullOrUndefined(box)) {
            if (box instanceof ElementBox) {
                box = box.children[0];
            }
            // Cache the result
            this.boxCache.set(cacheKey, box);
            return box;
        }

        return null;
    }

    /**
     * Sets error on a box without triggering isDirty()
     * The caller is responsible for batching the refresh
     */
    private setErrorOnBoxSilent(box: Box, errorMessage: string): void {
        if (!box) return;

        // Directly set the internal state without triggering isDirty
        (box as any)._hasError = true;

        // Add error message without triggering isDirty
        const messages = (box as any)._errorMessages as string[];
        if (!messages.includes(errorMessage)) {
            messages.push(errorMessage);
        }
    }

    /**
     * Clears error on a box without triggering isDirty()
     * The caller is responsible for batching the refresh
     */
    private clearErrorOnBoxSilent(box: Box): void {
        if (!box) return;

        // Directly set the internal state without triggering isDirty
        (box as any)._hasError = false;
        (box as any)._errorMessages = [];

        if (isTextBox(box) || isActionBox(box) || isSelectBox(box)) {
            (box as any).isFirstInLine = false;
        }
    }

    public gatherMessagesForGutter() {
        if (this.erroneousBoxes.length === 0) {
            return;
        }

        const rectangle = this.erroneousBoxes[0]?.getClientRectangle()
        if (isNullOrUndefined(this.erroneousBoxes[0]) || rectangle === UndefinedRectangle) {
            // Too early, wait for the rendering to be done
            return;
        }

        // OPTIMIZATION: Cache rectangle values to avoid repeated layout calculations
        const boxRects = new Map<Box, { x: number; y: number }>();
        this.erroneousBoxes.forEach(box => {
            if (box) {
                const rect = box.getClientRectangle();
                boxRects.set(box, { x: rect.x, y: rect.y });
            }
        });

        // Sort the erroneous boxes based on their y-coordinate
        const sortedBoxes = [...this.erroneousBoxes].filter(b => b && boxRects.has(b));
        sortedBoxes.sort((a, b) => (boxRects.get(a)!.y > boxRects.get(b)!.y) ? 1 : -1);

        // Group the boxes per 'line'
        let lines: Box[][] = [];
        let lineIndex: number = 0;
        let prevLineEnd: number = 0;

        for (let i: number = 0; i < sortedBoxes.length - 1; i++) {
            const currentY = boxRects.get(sortedBoxes[i])!.y;
            const nextY = boxRects.get(sortedBoxes[i + 1])!.y;
            if (currentY < nextY - LINE_HEIGHT_MARGIN) {
                lines[lineIndex++] = sortedBoxes.slice(prevLineEnd, i + 1);
                prevLineEnd = i + 1;
            }
        }
        // Make the final line
        if (sortedBoxes.length > 0) {
            lines[lineIndex] = sortedBoxes.slice(prevLineEnd);
        }

        // For each 'line' get the box on the left, and put all error messages on the line in that box
        lines.forEach(line => {
            if (!line || line.length === 0) return;

            // Sort by x-coordinate using cached values
            line.sort((a, b) => (boxRects.get(a)!.x > boxRects.get(b)!.x) ? 1 : -1);

            let first = line[0];
            for (let i: number = 1; i < line.length; i++) {
                const box = line[i];
                if (box) {
                    // Use silent version to avoid triggering isDirty
                    const messages = (box as any)._errorMessages as string[];
                    if (messages && messages.length > 0) {
                        const firstMessages = (first as any)._errorMessages as string[];
                        messages.forEach(msg => {
                            if (!firstMessages.includes(msg)) {
                                firstMessages.push(msg);
                            }
                        });
                    }
                    if (!isTextBox(box) && !isActionBox(box) && !isSelectBox(box)) {
                        (box as any)._errorMessages = [];
                    }
                }
            }
            if (isTextBox(first) || isActionBox(first) || isSelectBox(first)) {
                (first as any).isFirstInLine = true;
            }
        });
    }
}
