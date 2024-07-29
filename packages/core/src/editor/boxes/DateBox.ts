import { FreUtils } from "../../util";
import { FreCaret, FreCaretPosition } from "../util";
import { FreNode } from "../../ast";
import { Box } from "./Box";
import { FreLogger } from "../../logging";
import { CharAllowed } from "./CharAllowed";

const LOGGER: FreLogger = new FreLogger("DateBox");

export class DateBox extends Box {
    kind: string = "DateBox";
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
    $getDate: () => string;
    $setDate: (newValue: string) => void;

    /**
     * Run the setDate() as defined by the user of this box inside a mobx action.
     * @param newValue
     */
    setDate(newValue: string): void {
        LOGGER.log("setDate to " + newValue);
        this.$setDate(newValue);
        this.isDirty();
    }

    getDate(): string {
        return this.$getDate();
    }

    isCharAllowed: (currentText: string, key: string, index: number) => CharAllowed = () => {
        return CharAllowed.OK;
    };

    constructor(node: FreNode, role: string, getDate: () => string, setDate: (text: string) => void, initializer?: Partial<DateBox>, cssClass?: string) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        this.$getDate = getDate;
        this.$setDate = setDate;
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
        /* To be overwritten by `DateComponent` */
        // TODO The followimng is needed to keep the cursor at the end when creating a nu8mberliteral in example
        //     Check in new components whether this is needed.
        switch (caret.position) {
            case FreCaretPosition.RIGHT_MOST:
                this.caretPosition = this.getDate().length;
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
        /* To be overwritten by `DateComponent` */
    };

    isEditable(): boolean {
        return true;
    }
}

export function isDateBox(b: Box): b is DateBox {
    return !!b && b.kind === "DateBox"; // b instanceof DateBox;
}
