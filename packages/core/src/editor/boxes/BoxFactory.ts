import { PiElement } from "../../language/PiElement";
import { PiUtils } from "../../util/PiUtils";
import { Box, AliasBox, LabelBox, TextBox } from "./internal";

type RoleCache<T extends Box> = {
    [role: string]: T;
}
type BoxCache<T extends Box> = {
    [id: string]: RoleCache<T>;
}
// The alias box cache
const aliasCache: BoxCache<AliasBox> = {};
const labelCache: BoxCache<LabelBox> = {};
const textCache: BoxCache<TextBox> = {};

// Caching of boxes, avoid recalculating them all
export class BoxFactory {

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
                console.log(":: new " + box.kind + " for entity " + elementId + " role " + role + " already exists");
                return box;
            } else {
                const newBox = creator();
                console.log(":: new " + newBox.kind + " for entity " + elementId + " role " + role + "            CREATED");
                cache[elementId][role] = newBox;
                return newBox;
            }
        } else {
            const newBox = creator();
            console.log(":: new " + newBox.kind + " for entity " + elementId + " role " + role + "               CREATED");
            cache[elementId] = {};
            cache[elementId][role] = newBox;
            return newBox;
        }
    }

    static alias(element: PiElement, role: string, placeHolder: string, initializer?: Partial<AliasBox>): AliasBox {
        // 1. Create the alias box, or find the one that already exists for this element and role
        const creator = () => new AliasBox(element, role, placeHolder, initializer);
        const result: AliasBox = this.find<AliasBox>(element, role, creator, aliasCache);

        // 2. Apply the other arguments in case they have changed
        result.placeholder = placeHolder;
        PiUtils.initializeObject(result, initializer);

        return result;
    }

    static label(element: PiElement, role: string, getLabel: string | (() => string), initializer?: Partial<LabelBox>): LabelBox {
        // 1. Create the alias box, or find the one that already exists for this element and role
        const creator = () => new LabelBox(element, role, getLabel, initializer);
        const result: LabelBox = this.find<LabelBox>(element, role, creator, labelCache);

        // 2. Apply the other arguments in case they have changed
        PiUtils.initializeObject(result, initializer);

        return result;
    }

    static text(element: PiElement, role: string, getText: () => string, setText: (text: string) => void, initializer?: Partial<TextBox>): TextBox {
        // 1. Create the  box, or find the one that already exists for this element and role
        const creator = () => new TextBox(element, role, getText, setText, initializer);
        const result: TextBox = this.find<TextBox>(element, role, creator, textCache);

        // 2. Apply the other arguments in case they have changed
        result.getText = getText;
        result.setText = setText;
        PiUtils.initializeObject(result, initializer);

        return result;
    }
}
