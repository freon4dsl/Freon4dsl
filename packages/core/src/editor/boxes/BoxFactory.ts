import { FreNode } from "../../ast";
import { BehaviorExecutionResult } from "../util";
// import { FreLogger } from "../../logging";
import { isNullOrUndefined, FreUtils } from "../../util";
import { FreEditor } from "../FreEditor";
import {
    Box,
    BooleanControlBox,
    NumberControlBox,
    ActionBox,
    LabelBox,
    TextBox,
    SelectOption,
    SelectBox,
    IndentBox,
    OptionalBox,
    HorizontalListBox, VerticalListBox, BoolFunctie, GridCellBox,
    HorizontalLayoutBox, VerticalLayoutBox,
    TableCellBox, OptionalBox2, LimitedControlBox
} from "./internal";

type RoleCache<T extends Box> = {
    [role: string]: T;
};
type BoxCache<T extends Box> = {
    [id: string]: RoleCache<T>;
};

// const LOGGER: FreLogger = new FreLogger("BoxFactory").mute();

// The box caches
let actionCache: BoxCache<ActionBox> = {};
let labelCache: BoxCache<LabelBox> = {};
let textCache: BoxCache<TextBox> = {};
let boolCache: BoxCache<BooleanControlBox> = {};
let numberCache: BoxCache<NumberControlBox> = {};
let limitedCache: BoxCache<LimitedControlBox> = {};
let selectCache: BoxCache<SelectBox> = {};
// let indentCache: BoxCache<IndentBox> = {};
let optionalCache: BoxCache<OptionalBox> = {};
let optionalCache2: BoxCache<OptionalBox2> = {};
// let svgCache: BoxCache<SvgBox> = {};
let horizontalLayoutCache: BoxCache<HorizontalLayoutBox> = {};
let verticalLayoutCache: BoxCache<VerticalLayoutBox> = {};
let horizontalListCache: BoxCache<HorizontalListBox> = {};
let verticalListCache: BoxCache<VerticalListBox> = {};
let gridcellCache: BoxCache<GridCellBox> = {};
let tableCellCache: BoxCache<TableCellBox> = {};

let cacheActionOff: boolean = false;
let cacheLabelOff: boolean = false;
let cacheTextOff: boolean = false;
let cacheBooleanOff: boolean = false;
let cacheNumberOff: boolean = false;
let cacheLimitedOff: boolean = false;
let cacheSelectOff: boolean = false;
// let cacheIndentOff: boolean = false;
// let cacheOptionalOff: boolean = false;
let cacheHorizontalLayoutOff: boolean = false;
let cacheVerticalLayoutOff: boolean = false;
let cacheHorizontalListOff: boolean = false;
let cacheVerticalListOff: boolean = false;
const cacheGridcellOff = true;
const cacheTablecellOff = true;

/**
 * Caching of boxes, avoid recalculating them.
 */
export class BoxFactory {
    public static clearCaches() {
        actionCache = {};
        labelCache = {};
        textCache = {};
        boolCache = {};
        numberCache = {};
        limitedCache = {};
        selectCache = {};
        // indentCache = {};
        optionalCache = {};
        optionalCache2 = {};
        // svgCache = {};
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
        cacheBooleanOff = true;
        cacheNumberOff = true;
        cacheLimitedOff = true;
        cacheSelectOff = true;
        // cacheIndentOff = true;
        // cacheOptionalOff = true;
        cacheHorizontalLayoutOff = true;
        cacheVerticalLayoutOff = true;
        cacheHorizontalListOff = true;
        cacheVerticalListOff = true;
    }

    public static cachesOn() {
        cacheActionOff = false;
        cacheLabelOff = false;
        cacheTextOff = false;
        cacheBooleanOff = false;
        cacheNumberOff = false;
        cacheLimitedOff = false;
        cacheSelectOff = false;
        // cacheIndentOff = false;
        // cacheOptionalOff = false;
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
    private static find<T extends Box>(element: FreNode, role: string, creator: () => T, cache: BoxCache<T>): T {
        // 1. Create the box, or find the one that already exists for this element and role
        const elementId = element.freId();
        if (!!cache[elementId]) {
            const box = cache[elementId][role];
            if (!!box) {
                // if (isNumberControlBox(box)) {
                //     console.log(":: EXISTS " + box.kind + " for entity " + elementId + " role " + role + " already exists");
                // }
                return box;
            } else {
                const newBox = creator();
                // if (isNumberControlBox(newBox)) {
                //     console.log(":: new " + newBox.kind + " for entity " + elementId + " role " + role + "            CREATED");
                // }
                cache[elementId][role] = newBox;
                return newBox;
            }
        } else {
            const newBox = creator();
            // if (isNumberControlBox(newBox)) {
            //     console.log(":: new " + newBox.kind + " for entity " + elementId + " role " + role + "               CREATED");
            // }
            cache[elementId] = {};
            cache[elementId][role] = newBox;
            return newBox;
        }
    }

    static action(element: FreNode, role: string, placeHolder: string, initializer?: Partial<ActionBox>): ActionBox {
        if (cacheActionOff) {
            return new ActionBox(element, role, placeHolder, initializer);
        }
        // 1. Create the action box, or find the one that already exists for this element and role
        const creator = () => new ActionBox(element, role, placeHolder, initializer);
        const result: ActionBox = this.find<ActionBox>(element, role, creator, actionCache);

        // 2. Apply the other arguments in case they have changed
        result.placeholder = placeHolder;
        result.textHelper.setText("");
        FreUtils.initializeObject(result, initializer);

        return result;
    }

    static label(element: FreNode, role: string, getLabel: string | (() => string), initializer?: Partial<LabelBox>): LabelBox {
        if (cacheLabelOff) {
            return new LabelBox(element, role, getLabel, initializer);
        }
        // 1. Create the label box, or find the one that already exists for this element and role
        const creator = () => new LabelBox(element, role, getLabel, initializer);
        const result: LabelBox = this.find<LabelBox>(element, role, creator, labelCache);

        // 2. Apply the other arguments in case they have changed
        result.setLabel(getLabel);
        FreUtils.initializeObject(result, initializer);

        return result;
    }

    static text(element: FreNode, role: string, getText: () => string, setText: (text: string) => void, initializer?: Partial<TextBox>): TextBox {
        if (cacheTextOff) {
            return new TextBox(element, role, getText, setText, initializer);
        }
        // 1. Create the text box, or find the one that already exists for this element and role
        const creator = () => new TextBox(element, role, getText, setText, initializer);
        const result: TextBox = this.find<TextBox>(element, role, creator, textCache);

        // 2. Apply the other arguments in case they have changed
        result.$getText = getText;
        result.$setText = setText;
        FreUtils.initializeObject(result, initializer);

        return result;
    }

    static bool(element: FreNode,
                role: string,
                getBoolean: () => boolean,
                setBoolean: (value: boolean) => void,
                initializer?: Partial<BooleanControlBox>
                ): BooleanControlBox {
        if (cacheBooleanOff) {
            return new BooleanControlBox(element, role, getBoolean, setBoolean, initializer);
        }
        // 1. Create the Boolean box, or find the one that already exists for this element and role
        const creator = () => new BooleanControlBox(element, role, getBoolean, setBoolean, initializer);
        const result: BooleanControlBox = this.find<BooleanControlBox>(element, role, creator, boolCache);

        // 2. Apply the other arguments in case they have changed
        result.$getBoolean = getBoolean;
        result.$setBoolean = setBoolean;
        FreUtils.initializeObject(result, initializer);

        return result;
    }

    static number(element: FreNode,
                role: string,
                getNumber: () => number,
                setNumber: (value: number) => void,
                initializer?: Partial<NumberControlBox>
    ): NumberControlBox {
        if (cacheNumberOff) {
            console.log("Retruning new NumberControlBox: ")
            return new NumberControlBox(element, role, getNumber, setNumber, initializer);
        }
        // 1. Create the Boolean box, or find the one that already exists for this element and role
        const creator = () => new NumberControlBox(element, role, getNumber, setNumber, initializer);
        const result: NumberControlBox = this.find<NumberControlBox>(element, role, creator, numberCache);
        // console.log(`Returning existing NumberControlBox: "` + result)

        // 2. Apply the other arguments in case they have changed
        // result.$getNumber = getNumber;
        // result.$setNumber = setNumber;
        // FreUtils.initializeObject(result, initializer);

        return result;
    }

    static indent(element: FreNode, role: string, indent: number, childBox: Box): IndentBox {
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

    static horizontalLayout(element: FreNode,
                            role: string,
                            // @ts-expect-error
                            // todo remove this parameter and adjust the generation in meta
                            propertyName: string,
                            children?: (Box | null)[],
                            initializer?: Partial<HorizontalLayoutBox>): HorizontalLayoutBox {
        if (cacheHorizontalLayoutOff) {
            return new HorizontalLayoutBox(element, role, children, initializer);
        }
        const creator = () => new HorizontalLayoutBox(element, role, children, initializer);
        const result: HorizontalLayoutBox = this.find<HorizontalLayoutBox>(element, role, creator, horizontalLayoutCache);

        // 2. Apply the other arguments in case they have changed
        if (!equals(result.children, children)) {
            result.replaceChildren(children);
        }
        FreUtils.initializeObject(result, initializer);

        return result;
    }

    static verticalLayout(element: FreNode,
                          role: string,
                          // @ts-expect-error
                          // todo remove this parameter and adjust the generation in meta
                          propertyName: string,
                          children?: (Box | null)[], initializer?: Partial<VerticalLayoutBox>): VerticalLayoutBox {
        if (cacheVerticalLayoutOff) {
            return new VerticalLayoutBox(element, role, children, initializer);
        }
        const creator = () => new VerticalLayoutBox(element, role, children, initializer);
        const result: VerticalLayoutBox = this.find<VerticalLayoutBox>(element, role, creator, verticalLayoutCache);
        // 2. Apply the other arguments in case they have changed
        if (!equals(result.children, children)) {
            result.replaceChildren(children);
        }
        FreUtils.initializeObject(result, initializer);
        return result;
    }

    static horizontalList(element: FreNode,
                          role: string,
                          propertyName: string,
                          children?: (Box | null)[],
                          initializer?: Partial<HorizontalListBox>): HorizontalListBox {
        if (cacheHorizontalListOff) {
            return new HorizontalListBox(element, role, propertyName, children, initializer);
        }
        const creator = () => new HorizontalListBox(element, role, propertyName, children, initializer);
        const result: HorizontalListBox = this.find<HorizontalListBox>(element, role, creator, horizontalListCache);
        // 2. Apply the other arguments in case they have changed
        if (!equals(result.children, children)) {
            result.replaceChildren(children);
        }
        FreUtils.initializeObject(result, initializer);

        return result;
    }

    static verticalList(element: FreNode,
                        role: string,
                        propertyName: string,
                        children?: (Box | null)[],
                        initializer?: Partial<VerticalListBox>): VerticalListBox {
        if (cacheVerticalListOff) {
            return new VerticalListBox(element, role, propertyName, children, initializer);
        }
        const creator = () => new VerticalListBox(element, role, propertyName, children, initializer);
        const result: VerticalListBox = this.find<VerticalListBox>(element, role, creator, verticalListCache);
        // 2. Apply the other arguments in case they have changed
        if (!equals(result.children, children)) {
            result.replaceChildren(children);
        }
        FreUtils.initializeObject(result, initializer);
        return result;
    }

    static limited(element: FreNode,
                  role: string,
                  getValues: () => string[],
                  setValues: (newValue: string[]) => void,
                  possibleValues: string[],
                  initializer?: Partial<LimitedControlBox>): LimitedControlBox {
        if (cacheLimitedOff) {
            return new LimitedControlBox(element, role, getValues, setValues, possibleValues, initializer);
        }
        // 1. Create the select box, or find the one that already exists for this element and role
        const creator = () => new LimitedControlBox(element, role, getValues, setValues, possibleValues, initializer);
        const result: LimitedControlBox = this.find<LimitedControlBox>(element, role, creator, limitedCache);

        // todo see whether we need the following statements
        // 2. Apply the other arguments in case they have changed
        // result.placeholder = placeHolder;
        // result.getOptions = getOptions;
        // result.getSelectedOption = getSelectedOption;
        // result.selectOption = selectOption;
        // FreUtils.initializeObject(result, initializer);

        return result;
    }

    static select(element: FreNode,
                  role: string,
                  placeHolder: string,
                  getOptions: (editor: FreEditor) => SelectOption[],
                  getSelectedOption: () => SelectOption | null,
                  selectOption: (editor: FreEditor, option: SelectOption) => BehaviorExecutionResult,
                  initializer?: Partial<SelectBox>): SelectBox {
        if (cacheSelectOff) {
            return new SelectBox(element, role, placeHolder, getOptions, getSelectedOption, selectOption, initializer);
        }
        // 1. Create the select box, or find the one that already exists for this element and role
        const creator = () => new SelectBox(element, role, placeHolder, getOptions, getSelectedOption, selectOption, initializer);
        const result: SelectBox = this.find<SelectBox>(element, role, creator, selectCache);

        // 2. Apply the other arguments in case they have changed
        result.placeholder = placeHolder;
        result.getOptions = getOptions;
        result.getSelectedOption = getSelectedOption;
        result.selectOption = selectOption;
        FreUtils.initializeObject(result, initializer);

        return result;
    }

    static optional(element: FreNode, role: string, condition: BoolFunctie, box: Box, mustShow: boolean, actionText: string, initializer?: Partial<OptionalBox>): OptionalBox {
        // TODO This only works with cache on, should also work with cache off. 
        // if (cacheOptionalOff) {
        //     return new OptionalBox(element, role, condition, box, mustShow, actionText);
        // }
        // 1. Create the optional box, or find the one that already exists for this element and role
        const creator = () => new OptionalBox(element, role, condition, box, mustShow, actionText);
        const result: OptionalBox = this.find<OptionalBox>(element, role, creator, optionalCache);

        // 2. Apply the other arguments in case they have changed
        FreUtils.initializeObject(result, initializer);

        return result;
    }

    static optional2(element: FreNode, role: string, condition: BoolFunctie, box: Box, mustShow: boolean, optional: Box, initializer?: Partial<OptionalBox2>): OptionalBox2 {
        // TODO This only works with cache on, should also work with cache off. 
        // if (cacheOptionalOff) {
        //     return new OptionalBox(element, role, condition, box, mustShow, actionText);
        // }
        // 1. Create the optional box, or find the one that already exists for this element and role
        const creator = () => new OptionalBox2(element, role, condition, box, mustShow, optional);
        const result: OptionalBox2 = this.find<OptionalBox2>(element, role, creator, optionalCache2);

        // 2. Apply the other arguments in case they have changed
        FreUtils.initializeObject(result, initializer);

        return result;
    }

    static gridcell(element: FreNode,
                    // @ts-expect-error
                    // todo remove this parameter and adjust the generation in meta
                    propertyName: string,
                    role: string,
                    row: number,
                    column: number,
                    box: Box,
                    initializer?: Partial<GridCellBox>): GridCellBox {
        if (cacheGridcellOff) {
            return new GridCellBox(element, role, row, column, box, initializer);
        }
        // 1. Create the grid cell box, or find the one that already exists for this element and role
        const creator = () => new GridCellBox(element, role, row, column, box, initializer);
        const result: GridCellBox = this.find<GridCellBox>(element, role, creator, gridcellCache);

        // 2. Apply the other arguments in case they have changed
        FreUtils.initializeObject(result, initializer);

        return result;
    }

    // todo this method is currently unused, maybe change TableUtil?
    static tablecell(element: FreNode,
                     propertyName: string,
                     propertyIndex: number,
                     conceptName: string,
                     role: string,
                     row: number,
                     column: number,
                     box: Box,
                     initializer?: Partial<TableCellBox>): TableCellBox {
        if (cacheTablecellOff) {
            return new TableCellBox(element, propertyName, propertyIndex, conceptName, role, row, column, box, initializer);
        }
        // 1. Create the table cell box, or find the one that already exists for this element and role
        const creator = () => new TableCellBox(element, propertyName, propertyIndex, conceptName, role, row, column, box, initializer);
        const result: TableCellBox = this.find<TableCellBox>(element, role, creator, tableCellCache);

        // 2. Apply the other arguments in case they have changed
        FreUtils.initializeObject(result, initializer);

        return result;
    }
}

const equals = (a, b): boolean | any => {
    if (isNullOrUndefined(a) && !isNullOrUndefined(b) || !isNullOrUndefined(a) && isNullOrUndefined(b)) {
        return false;
    }
    if (isNullOrUndefined(a) && isNullOrUndefined(b)) {
        return true;
    }
    return a.length === b.length && a.every((v, i) => v === b[i]);
};
