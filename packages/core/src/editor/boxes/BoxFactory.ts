import { runInAction } from "mobx";
import { PiElement } from "../../ast";
import { BehaviorExecutionResult } from "../util/BehaviorUtils";
import { PiLogger } from "../../logging";
import { isNullOrUndefined, PiUtils } from "../../util/PiUtils";
import { PiEditor } from "../PiEditor";
import {
    Box,
    ActionBox,
    LabelBox,
    TextBox,
    SelectOption,
    SelectBox,
    IndentBox,
    OptionalBox,
    HorizontalListBox, VerticalListBox, SvgBox, BoolFunctie, GridCellBox,
    HorizontalLayoutBox, VerticalLayoutBox,
    TableCellBox
} from "./internal";

type RoleCache<T extends Box> = {
    [role: string]: T;
}
type BoxCache<T extends Box> = {
    [id: string]: RoleCache<T>;
}

const LOGGER: PiLogger = new PiLogger("BoxFactory").mute();

// The box caches
let actionCache: BoxCache<ActionBox> = {};
let labelCache: BoxCache<LabelBox> = {};
let textCache: BoxCache<TextBox> = {};
let selectCache: BoxCache<SelectBox> = {};
let indentCache: BoxCache<IndentBox> = {};
let optionalCache: BoxCache<OptionalBox> = {};
let svgCache: BoxCache<SvgBox> = {};
let horizontalLayoutCache: BoxCache<HorizontalListBox> = {};
let verticalLayoutCache: BoxCache<VerticalListBox> = {};
let horizontalListCache: BoxCache<HorizontalListBox> = {};
let verticalListCache: BoxCache<VerticalListBox> = {};
let gridcellCache: BoxCache<GridCellBox> = {};
let tableCellCache: BoxCache<TableCellBox> = {};

let cacheActionOff: boolean = false;
let cacheLabelOff: boolean = false;
let cacheTextOff: boolean = false;
let cacheSelectOff: boolean = false;
let cacheIndentOff: boolean = false;
let cacheOptionalOff: boolean = false;
let cacheHorizontalLayoutOff: boolean = false;
let cacheVerticalLayoutOff: boolean = false;
let cacheHorizontalListOff: boolean = false;
let cacheVerticalListOff: boolean = false;
let cacheGridcellOff = true;
let cacheTablecellOff = true;

/**
 * Caching of boxes, avoid recalculating them.
 */
export class BoxFactory {
    public static clearCaches() {
        actionCache = {};
        labelCache = {};
        textCache = {};
        selectCache = {};
        indentCache = {};
        optionalCache = {};
        svgCache = {};
        horizontalLayoutCache = {};
        verticalLayoutCache = {};
        horizontalListCache = {};
        verticalListCache = {};
        gridcellCache = {};
        tableCellCache = {};
    }

    public static cachesOff() {
        cacheActionOff = true;
        cacheLabelOff = true;
        cacheTextOff = true;
        cacheSelectOff = true;
        cacheIndentOff = true;
        cacheOptionalOff = true;
        cacheHorizontalLayoutOff = true;
        cacheVerticalLayoutOff = true;
        cacheHorizontalListOff = true;
        cacheVerticalListOff = true;
    }

    public static cachesOn() {
        cacheActionOff = false;
        cacheLabelOff = false;
        cacheTextOff = false;
        cacheSelectOff = false;
        cacheIndentOff = false;
        cacheOptionalOff = false;
        cacheHorizontalLayoutOff = false;
        cacheVerticalLayoutOff = false;
        cacheHorizontalListOff = false;
        cacheVerticalListOff = false;
    }

    /**
     * Find the Box for the given element id and role in the cache,
     * When not there, create the element and put it in the cache
     * @param element The element for which the box should be found
     * @param role    The role of the box
     * @param creator The function with which the box can be createed , if not there
     * @param cache   The cache to use
     */
    private static find<T extends Box>(element: PiElement, role: string, creator: () => T, cache: BoxCache<T>): T {
        // 1. Create the alias box, or find the one that already exists for this element and role
        const elementId = element.piId();
        if (!!cache[elementId]) {
            const box = cache[elementId][role];
            if (!!box) {
                LOGGER.log(":: EXISTS " + box.kind + " for entity " + elementId + " role " + role + " already exists");
                return box;
            } else {
                const newBox = creator();
                LOGGER.log(":: new " + newBox.kind + " for entity " + elementId + " role " + role + "            CREATED");
                cache[elementId][role] = newBox;
                return newBox;
            }
        } else {
            const newBox = creator();
            LOGGER.log(":: new " + newBox.kind + " for entity " + elementId + " role " + role + "               CREATED");
            cache[elementId] = {};
            cache[elementId][role] = newBox;
            return newBox;
        }
    }

    static action(element: PiElement, role: string, placeHolder: string, initializer?: Partial<ActionBox>): ActionBox {
        if (cacheActionOff) {
            return new ActionBox(element, role, placeHolder, initializer);
        }
        // 1. Create the action box, or find the one that already exists for this element and role
        const creator = () => new ActionBox(element, role, placeHolder, initializer);
        const result: ActionBox = this.find<ActionBox>(element, role, creator, actionCache);

        runInAction(() => {
            // 2. Apply the other arguments in case they have changed
            result.placeholder = placeHolder;
            result.textHelper.setText("");
            PiUtils.initializeObject(result, initializer);
        });
        return result;
    }

    static label(element: PiElement, role: string, getLabel: string | (() => string), initializer?: Partial<LabelBox>): LabelBox {
        if (cacheLabelOff) {
            return new LabelBox(element, role, getLabel, initializer);
        }
        // 1. Create the label box, or find the one that already exists for this element and role
        const creator = () => new LabelBox(element, role, getLabel, initializer);
        const result: LabelBox = this.find<LabelBox>(element, role, creator, labelCache);

        runInAction(() => {
            // 2. Apply the other arguments in case they have changed
            result.setLabel(getLabel);
            PiUtils.initializeObject(result, initializer);
        });

        return result;
    }

    static text(element: PiElement, role: string, getText: () => string, setText: (text: string) => void, initializer?: Partial<TextBox>): TextBox {
        if (cacheTextOff) {
            return new TextBox(element, role, getText, setText, initializer);
        }
        // 1. Create the text box, or find the one that already exists for this element and role
        const creator = () => new TextBox(element, role, getText, setText, initializer);
        const result: TextBox = this.find<TextBox>(element, role, creator, textCache);

        runInAction(() => {
            // 2. Apply the other arguments in case they have changed
            result.getText = getText;
            result.setText = setText;
            PiUtils.initializeObject(result, initializer);
        });

        return result;
    }

    static indent(element: PiElement, role: string, indent: number, childBox: Box): IndentBox {
        return new IndentBox(element, role, indent, childBox);
        // 1. Create the  box, or find the one that already exists for this element and role
        // const creator = () => new IndentBox(element, role, indent, childBox);
        // const result: IndentBox = this.find<IndentBox>(element, role, creator, indentCache);

        // 2. Apply the other arguments in case they have changed
        // result.indent = indent;
        // result.child= childBox
        //
        // return result;
    }

    static sameChildren(one: Box[], two: Box[]): boolean {
        const oneOk: boolean = one.every(o => two.includes(o));
        const twoOk = two.every(o => one.includes(o));
        return oneOk && twoOk;
    }

    static horizontalLayout(element: PiElement, role: string, propertyName: string, children?: (Box | null)[], initializer?: Partial<HorizontalLayoutBox>): HorizontalLayoutBox {
        if (cacheHorizontalLayoutOff) {
            return new HorizontalLayoutBox(element, role, children, initializer);
        }
        const creator = () => new HorizontalLayoutBox(element, role, children, initializer);
        const result: HorizontalLayoutBox = this.find<HorizontalLayoutBox>(element, role, creator, horizontalLayoutCache);
        runInAction(() => {
            // 2. Apply the other arguments in case they have changed
            if (!equals(result.children, children)) {
                result.replaceChildren(children);
            }
            PiUtils.initializeObject(result, initializer);
        });

        return result;
    }

    static verticalLayout(element: PiElement, role: string, propertyName: string, children?: (Box | null)[], initializer?: Partial<VerticalLayoutBox>): VerticalLayoutBox {
        if (cacheVerticalLayoutOff) {
            return new VerticalLayoutBox(element, role, children, initializer);
        }
        const creator = () => new VerticalLayoutBox(element, role, children, initializer);
        const result: VerticalLayoutBox = this.find<VerticalLayoutBox>(element, role, creator, verticalLayoutCache);
        runInAction(() => {
            // 2. Apply the other arguments in case they have changed
            if (!equals(result.children, children)) {
                result.replaceChildren(children);
            }
            PiUtils.initializeObject(result, initializer);
        });
        return result;
    }

    static horizontalList(element: PiElement, role: string, propertyName: string, children?: (Box | null)[], initializer?: Partial<HorizontalListBox>): HorizontalListBox {
        if (cacheHorizontalListOff) {
            return new HorizontalListBox(element, role, propertyName, children, initializer);
        }
        const creator = () => new HorizontalListBox(element, role, propertyName, children, initializer);
        const result: HorizontalListBox = this.find<HorizontalListBox>(element, role, creator, horizontalListCache);
        runInAction(() => {
            // 2. Apply the other arguments in case they have changed
            if (!equals(result.children, children)) {
                result.replaceChildren(children);
            }
            PiUtils.initializeObject(result, initializer);
        });

        return result;
    }

    static verticalList(element: PiElement, role: string, propertyName: string, children?: (Box | null)[], initializer?: Partial<VerticalListBox>): VerticalListBox {
        if (cacheVerticalListOff) {
            return new VerticalListBox(element, role, propertyName, children, initializer);
        }
        const creator = () => new VerticalListBox(element, role, propertyName, children, initializer);
        const result: VerticalListBox = this.find<VerticalListBox>(element, role, creator, verticalListCache);
        runInAction(() => {
            // 2. Apply the other arguments in case they have changed
            if (!equals(result.children, children)) {
                result.replaceChildren(children);
            }
            PiUtils.initializeObject(result, initializer);
        });
        return result;
    }

    static select(element: PiElement,
                  role: string,
                  placeHolder: string,
                  getOptions: (editor: PiEditor) => SelectOption[],
                  getSelectedOption: () => SelectOption | null,
                  selectOption: (editor: PiEditor, option: SelectOption) => BehaviorExecutionResult,
                  initializer?: Partial<SelectBox>): SelectBox {
        if (cacheSelectOff) {
            return new SelectBox(element, role, placeHolder, getOptions, getSelectedOption, selectOption, initializer);
        }
        // 1. Create the select box, or find the one that already exists for this element and role
        const creator = () => new SelectBox(element, role, placeHolder, getOptions, getSelectedOption, selectOption, initializer);
        const result: SelectBox = this.find<SelectBox>(element, role, creator, selectCache);

        runInAction(() => {
            // 2. Apply the other arguments in case they have changed
            result.placeholder = placeHolder;
            result.getOptions = getOptions;
            result.getSelectedOption = getSelectedOption;
            result.selectOption = selectOption;
            PiUtils.initializeObject(result, initializer);
        });

        return result;
    }

    static optional(element: PiElement, role: string, condition: BoolFunctie, box: Box, mustShow: boolean, actionText: string): OptionalBox {
        if (cacheOptionalOff) {
            return new OptionalBox(element, role, condition, box, mustShow, actionText);
        }
        // 1. Create the optional box, or find the one that already exists for this element and role
        const creator = () => new OptionalBox(element, role, condition, box, mustShow, actionText);
        const result: OptionalBox = this.find<OptionalBox>(element, role, creator, optionalCache);

        // 2. Apply the other arguments in case they have changed
        // PiUtils.initializeObject(result, initializer);

        return result;

    }

    static gridcell(element: PiElement, propertyName: string, role: string, row: number, column: number, box: Box, initializer?: Partial<GridCellBox>): GridCellBox {
        if (cacheGridcellOff) {
            return new GridCellBox(element, role, row, column, box, initializer);
        }
        // 1. Create the grid cell box, or find the one that already exists for this element and role
        const creator = () => new GridCellBox(element, role, row, column, box, initializer);
        const result: GridCellBox = this.find<GridCellBox>(element, role, creator, gridcellCache);

        runInAction(() => {
            // 2. Apply the other arguments in case they have changed
            PiUtils.initializeObject(result, initializer);
        });

        return result;
    }

    static tablecell(element: PiElement, propertyName: string, conceptName: string, role: string, row: number, column: number, box: Box, initializer?: Partial<TableCellBox>): TableCellBox {
        if (cacheTablecellOff) {
            return new TableCellBox(element, propertyName, conceptName, role, row, column, box, initializer);
        }
        // 1. Create the table cell box, or find the one that already exists for this element and role
        const creator = () => new TableCellBox(element, propertyName, conceptName, role, row, column, box, initializer);
        const result: TableCellBox = this.find<TableCellBox>(element, role, creator, tableCellCache);

        runInAction(() => {
            // 2. Apply the other arguments in case they have changed
            PiUtils.initializeObject(result, initializer);
        });

        return result;
    }
}

const equals = (a, b) => {
    if (isNullOrUndefined(a)  && !isNullOrUndefined(b) || !isNullOrUndefined(a) && isNullOrUndefined(b)) {
        return false;
    }
    if (isNullOrUndefined(a) && isNullOrUndefined(b)) {
        return true;
    }
    return a.length === b.length && a.every((v, i) => v === b[i]);
};
