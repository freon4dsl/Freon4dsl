/**
 *   An object describing how the dropdown should be positioned and constrained:
 *     - left/top: position within the overlay
 *     - minWidth: typically matches the anchor width
 *     - maxHeight: available vertical space (above or below)
 */
export type DropdownLayout = {
    left: number;
    top: number;
    minWidth: number;
    maxHeight: number;
};

/**
 * Computes the layout for a dropdown relative to an anchor within a shared overlay.
 *
 * This is a **pure function**: it does not touch the DOM. It only calculates the
 * position and size constraints that should be applied by the caller.
 *
 * All inputs are expected to be in **viewport coordinates** (as returned by
 * `getBoundingClientRect`). The returned layout is expressed in coordinates
 * relative to the overlayRect.
 *
 * @param anchorRect
 *   The bounding rect of the anchor element (the element the dropdown is attached to).
 *
 * @param contentRect
 *   The bounding rect of the dropdown content (used to determine required width/height).
 *
 * @param overlayRect
 *   The bounding rect of the overlay container (typically a fixed-position root).
 *   This defines the coordinate space and available area for positioning.
 *
 * @returns DropdownLayout
 *
 * Layout rules:
 *   - Prefer placing the dropdown below the anchor
 *   - Flip above if there is insufficient space below
 *   - Clamp horizontally and vertically to stay within overlay bounds
 *   - Ensure the dropdown is at least as wide as the anchor
 *   - Limit height to the available space (above or below)
 *
 * Note:
 *   Positioning is based on the provided contentRect (not the outer panel).
 *   Callers must ensure that any additional panel styling (padding, borders)
 *   does not introduce unintended visual offsets.
 *
 * In short:
 *   Anchor defines where, overlay defines space, content defines size,
 *   this function defines the layout — the caller applies it.
 */
export function computeDropdownLayout(
    anchorRect: DOMRect,
    contentRect: DOMRect,
    overlayRect: DOMRect
): DropdownLayout {
    const ow = overlayRect.width;
    const oh = overlayRect.height;

    const anchorLeft = anchorRect.left - overlayRect.left;
    const anchorTop = anchorRect.top - overlayRect.top;
    const anchorBottom = anchorRect.bottom - overlayRect.top;

    let left = anchorLeft;
    let top = anchorBottom;

    // overflow right
    if (left + contentRect.width > ow) {
        left = Math.max(0, ow - contentRect.width);
    }

    // flip above
    if (top + contentRect.height > oh) {
        top = Math.max(0, anchorTop - contentRect.height);
    }

    // clamp
    left = Math.max(0, Math.min(left, ow - contentRect.width));
    top = Math.max(0, Math.min(top, oh - contentRect.height));

    const spaceBelow = oh - anchorBottom;
    const availableHeight = top === anchorBottom ? spaceBelow : anchorTop;

    return {
        left,
        top,
        minWidth: anchorRect.width,
        maxHeight: availableHeight
    };
}
