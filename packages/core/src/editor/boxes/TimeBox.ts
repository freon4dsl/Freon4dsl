import { FreUtils } from "../../util";
import { FreCaret, FreCaretPosition } from "../util";
import { FreNode } from "../../ast";
import { Box } from "./Box";
import { FreLogger } from "../../logging";
import { CharAllowed } from "./CharAllowed";

const LOGGER: FreLogger = new FreLogger("TextBox");

export class TimeBox extends Box {
    kind: string = "TimeBox";
    /**
     * If true, the element will be deleted when the text becomes
     * empty because of removing the last character in the text.
     * Usable for e.g. numeric values.
     */
    deleteWhenEmpty: boolean = false;

    /**
     * If true, delete element when Erase key is pressed while the element is empty.
     */
    deleteWhenEmptyAndErase: boolean = false;

    placeHolder: string = "<enter>";
    caretPosition: number = -1;
    $getTime: () => string;
    $setTime: (newValue: string) => void;

    /**
     * Run the setText() as defined by the user of this box inside a mobx action.
     * @param newValue
     */
    setTime(newValue: string): void {
        LOGGER.log("setText to " + newValue);
        this.$setTime(newValue);
        this.isDirty();
    }

    getTime(): string {
        return this.$getTime();
    }

    isCharAllowed: (currentText: string, key: string, index: number) => CharAllowed = () => {
        return CharAllowed.OK;
    };

    constructor(node: FreNode, role: string, getTime: () => string, setTime: (text: string) => void, initializer?: Partial<TimeBox>, cssClass?: string) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        this.$getTime = getTime;
        this.$setTime = setTime;
        this.cssClass = cssClass;
    }

    public deleteWhenEmpty1(): boolean {
        return this.deleteWhenEmpty;
    }

    // INTERNAL FUNCTIONS

    /** @internal
     */
    setCaret: (caret: FreCaret) => void = (caret: FreCaret) => {
        LOGGER.log("setCaret: " + caret.position);
        /* To be overwritten by `TextComponent` */
        // TODO The followimng is needed to keep the cursor at the end when creating a nu8mberliteral in example
        //     Check in new components whether this is needed.
        switch (caret.position) {
            case FreCaretPosition.RIGHT_MOST:
                this.caretPosition = this.getTime().length;
                break;
            case FreCaretPosition.LEFT_MOST:
                this.caretPosition = 0;
                break;
            case FreCaretPosition.INDEX:
                this.caretPosition = caret.position;
                break;
            case FreCaretPosition.UNSPECIFIED:
                break;
            default:
                break;
        }
    };

    /** @internal
     * This function is called after the text changes in the browser.
     * It ensures that the SelectableComponent will calculate the new coordinates.
     */
    update: () => void = () => {
        /* To be overwritten by `TextComponent` */
    };

    isEditable(): boolean {
        return true;
    }
}

export function isTimeBox(b: Box): b is TimeBox {
    return !!b && b.kind === "TimeBox"; // b instanceof TimeBox;
}
