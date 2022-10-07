import { Box } from "./Box";
import { PiElement } from "../../ast";
import { Language } from "../../language";
import { PiLogger } from "../../logging";
import { MenuItem } from "../util";
import { LayoutBox, ListDirection } from "./LayoutBox";

const LOGGER = new PiLogger("ListBox");

/**
 * This Box represents a list in the PiElement model, i.e. one that is defined in the .ast file
 * as 'propName: conceptName[]' or 'reference propName: conceptName[]'.
 */
export class ListBox extends LayoutBox {
    conceptName: string = "unknown-type"; // the name of the type of the elements in the list

    protected constructor(element: PiElement, propertyName: string, role: string, children?: Box[], initializer?: Partial<ListBox>) {
        super(element, role, children, initializer);
        // todo is this the correct way to use mobx?
        // makeObservable<LayoutBox, "_children">(this, {
        //     _children: observable,
        //     insertChild: action,
        //     addChild: action,
        //     clearChildren: action,
        //     addChildren: action,
        // });
        // PiUtils.initializeObject(this, initializer);
        // if (!!children) {
        //     children.forEach(b => this.addChild(b));
        // }
        this.kind = "ListBox";
        this.conceptName = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName)?.type;
    }

    options(): MenuItem[] {
        console.log("trueList " + this.conceptName);
        const clsOtIntf = Language.getInstance().concept(this.conceptName) ?? Language.getInstance().interface(this.conceptName);
        let errorItem: MenuItem = new MenuItem("No options available", "", (e: PiElement) => {});
        if (!clsOtIntf) {
            return [errorItem];
        }
        if (clsOtIntf.subConceptNames.length > 0) { // there are sub concepts, so create sub menu items
            let submenuItems: MenuItem[] = [];
            clsOtIntf.subConceptNames.forEach((creatableConceptname: string) => {
                const creatableConcept = Language.getInstance().concept(creatableConceptname);
                submenuItems.push(new MenuItem(
                    creatableConceptname, "", (e: PiElement) => console.log(creatableConceptname + " chosen..." + e)
                ));
            });
            const items: MenuItem[] = [
                new MenuItem("Add before", "Ctrl+A", (e: PiElement) => {
                }, submenuItems),
                new MenuItem("Add after", "Ctrl+I", (e: PiElement) => {
                }, submenuItems),
                new MenuItem("Delete", "", (e: PiElement) => console.log("Deleting " + e)),
                new MenuItem("---", "", (e: PiElement) => {
                }),
                new MenuItem("Cut", "", (e: PiElement) => console.log("Cut..." + e)),
                new MenuItem("Copy", "", (e: PiElement) => console.log("Copy..." + e)),
                new MenuItem("Paste before", "", (e: PiElement) => console.log("Paste before..." + e)),
                new MenuItem("Paste after", "", (e: PiElement) => console.log("Paste after..." + e))
            ];
            return items;
        } else {
            const items: MenuItem[] = [
                new MenuItem("Add before", "Ctrl+A", (e: PiElement) => console.log("Adding " + this.conceptName + e)),
                new MenuItem("Add after", "Ctrl+I", (e: PiElement) => console.log("Adding " + this.conceptName + e)),
                new MenuItem("Delete", "", (e: PiElement) => console.log("Deleting " + e)),
                new MenuItem("---", "", (e: PiElement) => {
                }),
                new MenuItem("Cut", "", (e: PiElement) => console.log("Cut..." + e)),
                new MenuItem("Copy", "", (e: PiElement) => console.log("Copy..." + e)),
                new MenuItem("Paste before", "", (e: PiElement) => console.log("Paste before..." + e)),
                new MenuItem("Paste after", "", (e: PiElement) => console.log("Paste after..." + e))
            ];
            return items;
        }
        return [errorItem];
    }
}



// const submenuItems: MenuItem[] = [
//     new MenuItem("Subclass1", 'Alt+X', (e: PiElement) => console.log('Subclass1 chosen...' + e)),
//     new MenuItem("Subclass2", '', (e: PiElement) => console.log('Subclass2 chosen...' + e)),
//     new MenuItem("Subclass3", '', (e: PiElement) => console.log('Subclass3 chosen...' + e)),
//     new MenuItem("Subclass4", '', (e: PiElement) => console.log('Subclass4 chosen...' + e))
// ];

export class HorizontalListBox extends ListBox {
    kind = "HorizontalListBox";

    constructor(element: PiElement, propertyName: string, role: string, children?: (Box | null)[], initializer?: Partial<HorizontalListBox>) {
        super(element, role, propertyName, children, initializer);
        this.direction = ListDirection.HORIZONTAL;
    }
}

export class VerticalListBox extends ListBox {
    kind = "VerticalListBox";

    constructor(element: PiElement, propertyName: string, role: string, children?: Box[], initializer?: Partial<HorizontalListBox>) {
        super(element, role, propertyName, children, initializer);
        this.direction = ListDirection.VERTICAL;
    }
}

export function isHorizontalList(b: Box): b is HorizontalListBox {
    return b.kind === "HorizontalListBox"; // b instanceof HorizontalListBox;
}

export function isVerticalList(b: Box): b is VerticalListBox {
    return b.kind === "VerticalListBox"; // b instanceof VerticalListBox;
}

export function isListBox(b: Box): boolean {
    return (b.kind === "HorizontalListBox" || b.kind === "VerticalListBox");
}
