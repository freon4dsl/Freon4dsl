import { PiActions } from "./PiAction";
import { Box } from "./boxes/Box";
import { PiProjection } from "./PiProjection";
import { PiElement } from "./../language/PiModel";
import { InternalBehavior } from "./InternalBehavior";
import { KeyboardShortcutBehavior } from "./PiAction"
import { PiCaret } from "./../util/BehaviorUtils";

export interface IPiEditor {
    readonly actions?: PiActions;
    readonly projection: PiProjection;
    readonly behaviors: InternalBehavior[];
    keyboardActions: KeyboardShortcutBehavior[];
    selectedPosition: PiCaret;
    projectedElement: HTMLDivElement | null;
    selectElement(element: PiElement, role?: string, caretPosition?: PiCaret);
    selectBox(box: Box | null, caretPosition?: PiCaret);
    selectedBox: Box;
    rootBox: Box;
    selectParentBox();
    selectFirstLeafChildBox();
    selectNextLeaf();
    selectPreviousLeaf();
    deleteBox(box: Box);
    selectFirstEditableChildBox();
    rootElement: PiElement;
}
