import { PiElement, PiNamedElement } from "../../language";
import { Box, BoxFactory, SelectOption, TextBox } from "../boxes";
import { BehaviorExecutionResult, PiUtils } from "../../util";
import { Language, PropertyType } from "../../storage";
import { PiEditor } from "../PiEditor";
import { PiProjection } from "../PiProjection";
import { PiScoper } from "../../scoper";
import { RoleProvider } from "./RoleProvider";

export class PiListJoin {
    text: string;
    type: string;
}

// export enum PiListJoinType {
//     // both strings should be equal to the strings used in class ListJoin from package meta
//     Separator = "Separator",
//     Terminator = "Terminator"
// }

export class BoxUtils {

    /**
     * Returns a textBox for property named 'propertyName' within 'element'.
     * When the property is a list (the type is "string[]", or "identifier[]"), this method can be
     * called for each item in the list. In that case an index to the item needs to be provided.
     * @param element the owning PiElement of the displayed property
     * @param propertyName the name of the displayed property
     * @param index the index of the item in the list, if the property is a list
     */
    static textBox(element: PiElement, propertyName: string, index?: number): TextBox {
        let result: TextBox = null;
        // find the information on the property to be shown
        const propInfo = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName);
        const isList: boolean = propInfo.isList;
        let property = element[propertyName];
        // create the box
        if (property !== undefined && property !== null && typeof property === "string") {
            const roleName: string = RoleProvider.property(element.piLanguageConcept(), propertyName, "textbox", index);
            if (isList && this.checkList(isList, index, propertyName)) {
                result = BoxFactory.text(element, roleName, () => property[index], (v: string) => (property[index] = v),{
                        placeHolder: `<${propertyName}>`
                    });
            } else {
                result = BoxFactory.text(element, roleName, () => property, (v: string) => (property = v), {
                    placeHolder: `<${propertyName}>`
                });
            }
        } else {
            PiUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a string: " + property + "\"");
        }
        return result;
    }

    /**
     * Returns a textBox that holds a property of type 'number'.
     * When the property is a list (the type is "number[]"), this method can be
     * called for each item in the list. In that case an index to the item needs to be provided.
     * @param element the owning PiElement of the displayed property
     * @param propertyName the name of the displayed property
     * @param index the index of the item in the list, if the property is a list
     */
    static numberBox(element: PiElement, propertyName: string, index?: number): TextBox {
        let result: TextBox = null;
        // find the information on the property to be shown
        const propInfo = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName);
        const property = element[propertyName];
        const isList: boolean = propInfo.isList;
        // create the box
        if (property !== undefined && property !== null && typeof property === "number") {
            const roleName: string = RoleProvider.property(element.piLanguageConcept(), propertyName, "numberbox", index);
            if (isList && this.checkList(isList, index, propertyName)) {
                result = BoxFactory.text(
                    element,
                    roleName,
                    () => element[propertyName][index],
                    (v: string) => (element[propertyName][index] = Number.parseInt(v)),
                    {
                        placeHolder: `<${propertyName}>`
                    });
            } else {
                result = BoxFactory.text(
                    element,
                    roleName,
                    () => element[propertyName],
                    (v: string) => (element[propertyName] = Number.parseInt(v)),
                    {
                        placeHolder: `<${propertyName}>`
                    });
            }
        } else {
                PiUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a number: " + property + "\"");
        }
        return result;
    }

    /**
     * Returns a textBox that holds a property of type 'boolean'.
     * When the property is a list (the type is "boolean[]"), this method can be
     * called for each item in the list. In that case an index to the item needs to be provided.
     * @param element the owning PiElement of the displayed property
     * @param propertyName the name of the displayed property
     * @param labels the different texts to be shown when the property is false or true
     * @param index the index of the item in the list, if the property is a list
     */
    static booleanBox(element: PiElement, propertyName: string, labels: { yes: string; no: string } = {yes: "yes", no: "no"}, index?: number): Box {
        // find the information on the property to be shown
        const propInfo = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName);
        const isList: boolean = propInfo.isList;
        const property = element[propertyName];

        if (!(property !== undefined && property !== null )) {
            PiUtils.CHECK(false, "Property " + propertyName + " does not exist:" + property + "\"");
        }
        if (!(typeof property === "boolean" || typeof property === "string")) {
            PiUtils.CHECK(false, "Property " + propertyName + " is not a boolean:" + property.piLanguageConcept() + "\"");
        }
        if (property !== undefined && property !== null && (typeof property === "boolean" || typeof property === "string")) {
            const roleName: string = RoleProvider.property(element.piLanguageConcept(), propertyName, "booleanbox", index);
            if (isList && this.checkList(isList, index, propertyName)) {
                return BoxFactory.select(
                    element,
                    roleName,
                    "<optional>",
                    () => [{ id: labels.yes, label: labels.yes }, { id: labels.no, label: labels.no }],
                    () => {
                        if (element[propertyName][index]) {
                            return { id: labels.yes, label: labels.yes };
                        } else {
                            return { id: labels.no, label: labels.no };
                        }
                    },
                    async (editor: PiEditor, option: SelectOption): Promise<BehaviorExecutionResult> => {
                        if (option.id === labels.yes) {
                            element[propertyName][index] = true;
                        } else if (option.id === labels.no) {
                            element[propertyName][index] = false;
                        }
                        return BehaviorExecutionResult.NULL
                    }
                );
            } else {
                return BoxFactory.select(
                    element,
                    roleName,
                    "<optional>",
                    () => [{ id: labels.yes, label: labels.yes }, { id: labels.no, label: labels.no }],
                    () => {
                        if (element[propertyName]) {
                            return { id: labels.yes, label: labels.yes };
                        } else {
                            return { id: labels.no, label: labels.no };
                        }
                    },
                    async (editor: PiEditor, option: SelectOption): Promise<BehaviorExecutionResult> => {
                        if (option.id === labels.yes) {
                            element[propertyName] = true;
                        } else if (option.id === labels.no) {
                            element[propertyName] = false;
                        }
                        return BehaviorExecutionResult.NULL
                    }
                );
            }
        } else {
            PiUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a boolean: " + property + "\"");
            return null;
        }
    }

    /**
     * Returns a selectBox that displays a property that is a reference.
     * It calls the 'scoper' to fill a dropdown list with possible values for the reference property.
     * A function that is able to set the property (based on the value selected from the dropdown list)
     * has to be provided.
     *
     * When the property is a list (the type is "reference SOMECONCEPT_OR_INTERFACE[]"), this method can be
     * called for each item in the list. In that case an index to the item needs to be provided.
     * @param element the owning PiElement of the displayed property
     * @param propertyName the name of the displayed property
     * @param setFunc
     * @param scoper
     * @param index
     */
    static referenceBox(
        element: PiElement,
        propertyName: string,
        setFunc: (selected: string) => Object,
        scoper: PiScoper,
        index?: number
    ): Box {
        const propType = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName).type;
        let property = element[propertyName];
        const roleName: string = RoleProvider.property(element.piLanguageConcept(), propertyName, "referencebox", index);
        // set the value for use in lists
        if (index !== null && index !== undefined && index >= 0) {
            property = property[index];
        }

        return BoxFactory.select(
            element,
            roleName,
            `<select ${propertyName}>`,
            () => {
                return scoper.getVisibleNames(element, propType)
                    .filter(name => !!name && name !== "")
                    .map(name => ({
                        id: name,
                        label: name
                    }));
            },
            () => {
                if (!!property) {
                    return { id: property.name, label: property.name };
                } else {
                    return null;
                }
            },
            async (editor: PiEditor, option: SelectOption): Promise<BehaviorExecutionResult> => {
                if (!!option) {
                    property = setFunc(option.label);
                } else {
                    property = null;
                }
                return BehaviorExecutionResult.EXECUTED;
            },
            { }
        );
    }

    /**
     * Returns a labelBox for 'content' within 'element'.
     * @param element
     * @param content
     * @param selectable when true this box can be selected, default is 'false'
     */
    static labelBox(element: PiElement, content: string, selectable?: boolean): Box {
        let _selectable: boolean = false;
        if (selectable !== undefined && selectable !== null && selectable) {
            _selectable = true;
        }
        const roleName: string = RoleProvider.label(element);
        return BoxFactory.label(element, roleName, content, {
            selectable: _selectable
        });
    }

    static indentBox(element: PiElement, indent: number, childBox: Box): Box {
        return BoxFactory.indent(
            element,
            RoleProvider.indent(element),
            indent,
            childBox
        )
    }

    static verticalPartListBox(element: PiElement, propertyName: string, rootProjection: PiProjection, listJoin?: PiListJoin): Box {
        // find the information on the property to be shown
        let { property, isList, isPart } = this.getPropertyInfo(element, propertyName);
        // check whether the property is a part list
        if (property !== undefined && propertyName !== null && isList && isPart !== "reference") {
            // find the children to show in this listBox
            let children = this.findPartItems(property, element, propertyName, rootProjection, listJoin);
            // add a placeholder where a new element can be added
            children = this.addPlaceholder(children, element, propertyName);
            // return the box
            return BoxFactory.verticalList(
                element,
                RoleProvider.property(element.piLanguageConcept(), propertyName, "vpartlist"),
                children
            );
        } else {
            PiUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a list or is not a part: " + property + "\"");
            return null;
        }
    }

    static verticalReferenceListBox(element: PiElement, propertyName: string, scoper: PiScoper, listJoin?: PiListJoin): Box {
        // find the information on the property to be shown
        let { property, isList, isPart } = this.getPropertyInfo(element, propertyName);
        // check whether the property is a reference list
        if (property !== undefined && propertyName !== null && isList && isPart === "reference") {
            // find the children to show in this listBox
            let children = this.makeRefItems(property, element, propertyName, scoper, listJoin);
            // add a placeholder where a new element can be added
            children = this.addPlaceholder(children, element, propertyName);
            return BoxFactory.verticalList(
                element,
                RoleProvider.property(element.piLanguageConcept(), propertyName, "vreflist"),
                children
            );
        } else {
            PiUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a list or not a reference: " + property + "\"");
            return null;
        }
    }

    static horizontalPartListBox(element: PiElement, propertyName: string, rootProjection: PiProjection, listJoin?: PiListJoin): Box {
        // find the information on the property to be shown
        let { property, isList, isPart } = this.getPropertyInfo(element, propertyName);
        // check whether the property is a part list
        if (property !== undefined && property !== null && isList && isPart !== "reference") {
            // find the children to show in this listBox, depending on whether it is a list of parts or of references
            let children = this.findPartItems(property, element, propertyName, rootProjection, listJoin);
            // add a placeholder where a new element can be added
            children = this.addPlaceholder(children, element, propertyName);
            // return the box
            return BoxFactory.horizontalList(
                element,
                RoleProvider.property(element.piLanguageConcept(), propertyName, "hpartlist"),
                children
            );
        } else {
            PiUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a list or not a part: " + property + "\"");
            return null;
        }
    }

    static horizontalReferenceListBox(element: PiElement, propertyName: string, scoper: PiScoper, listJoin?: PiListJoin): Box {
        // find the information on the property to be shown
        let { property, isList, isPart } = this.getPropertyInfo(element, propertyName);
        // check whether the property is a reference list
        if (property !== undefined && propertyName !== null && isList && isPart === "reference") {
            // find the children to show in this listBox
            let children = this.makeRefItems(property, element, propertyName, scoper, listJoin);
            // add a placeholder where a new element can be added
            children = this.addPlaceholder(children, element, propertyName);
            // return the box
            return BoxFactory.horizontalList(
                element,
                RoleProvider.property(element.piLanguageConcept(), propertyName, "hlist"),
                children
            );
        } else {
            PiUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a list or not a reference: " + property + "\"");
            return null;
        }
    }

    static getBoxOrAlias(element: PiElement, propertyName: string, rootProjection: PiProjection) {
        // find the information on the property to be shown
        const property = element[propertyName];
        const roleName = RoleProvider.property(element.piLanguageConcept(), propertyName);
        return !!property
            ? rootProjection.getBox(property)
            : BoxFactory.alias(element, roleName, "[add]", { propertyName: propertyName });
    }

    // private static listBox(
    //     element: PiElement,
    //     propertyName: string,
    //     listJoin: PiListJoin,
    //     rootProjection: PiProjection,
    //     scoper?: PiScoper
    // ): Box {
    //     // find the information on the property to be shown
    //     let property = element[propertyName];
    //     const propInfo = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName);
    //     const isList: boolean = propInfo.isList;
    //     const isPart: PropertyType = propInfo.propertyType;
    //
    //     if (property !== undefined && propertyName !== null && isList) {
    //         // find the children to show in this listBox, depending on whether it is a list of parts or of references
    //         let children = null;
    //         if (isPart !== "reference") {
    //             children = property.map(listElem => {
    //                     const roleName: string = RoleProvider.property(element.piLanguageConcept(), propertyName, "list-item", listElem.piId());
    //                     // TODO check this!!
    //                     return BoxFactory.horizontalList(element, roleName, [
    //                         rootProjection.getBox(listElem),
    //                         BoxFactory.label(element, roleName + "label", "")
    //                     ]);
    //                 });
    //         } else {
    //             if (!!scoper) {
    //                 children = property.map((listElem, index) => {
    //                     return BoxUtils.referenceBox(element, propertyName,
    //                         (selected: string) => {
    //                             listElem.name = selected;
    //                             return BehaviorExecutionResult.EXECUTED;
    //                         },
    //                         scoper, index)
    //                     });
    //             } else {
    //                 PiUtils.CHECK(false, "Box for reference " + propertyName + " needs a scoper instance.");
    //                 return null;
    //             }
    //         }
    //         // add a placeholder where a new element can be added
    //         children = children.concat(
    //                 BoxFactory.alias(
    //                     element,
    //                     RoleProvider.property(element.piLanguageConcept(), propertyName, "new-list-item"),
    //                     `<+ ${propertyName}>`,
    //                     { propertyName: `${propertyName}` })
    //             );
    //         // determine the box to be returned based on the direction
    //         if (direction === ListDirection.VERTICAL) {
    //             return BoxFactory.verticalList(
    //                 element,
    //                 RoleProvider.property(element.piLanguageConcept(), propertyName, "vlist"),
    //                 children
    //             );
    //         } else {
    //             return BoxFactory.horizontalList(
    //                 element,
    //                 RoleProvider.property(element.piLanguageConcept(), propertyName, "hlist"),
    //                 children
    //             );
    //         }
    //     } else {
    //         PiUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a list: " + property + "\"");
    //         return null;
    //     }
    // }

    /**
     *
     * @param isList
     * @param index
     * @param propertyName
     * @private
     */
    private static checkList(isList: boolean, index: number, propertyName: string): boolean {
        let res: boolean = true;
        if (index !== null && index !== undefined && !isList) {
            PiUtils.CHECK(false, "Property " + propertyName + " is not a list: " + index + "\"");
            res = false;
        }
        if (isList && (index === null || index === undefined || index < 0)) {
            PiUtils.CHECK(false, "Property " + propertyName + " is a list, index should be provided.");
            res = false;
        }
        return res;
    }

    private static addPlaceholder(children, element: PiElement, propertyName: string) {
        return children.concat(
            BoxFactory.alias(
                element,
                RoleProvider.property(element.piLanguageConcept(), propertyName, "new-list-item"),
                `<+ ${propertyName}>`,
                { propertyName: `${propertyName}` })
        );
    }

    private static findPartItems(property: PiElement[], element: PiElement, propertyName: string, rootProjection: PiProjection, listJoin?: PiListJoin) {
        const numberOfItems = property.length;
        return property.map((listElem, index) => {
            const roleName: string = RoleProvider.property(element.piLanguageConcept(), propertyName, "list-item", index);
            if (listJoin !== null && listJoin !== undefined) {
                // TODO make constant of strings "Separator" and ..
                if (listJoin.type === "Separator") {
                    if (index < numberOfItems - 1) {
                        return BoxFactory.horizontalList(element, roleName, [
                            rootProjection.getBox(listElem),
                            BoxFactory.label(element, roleName + "list-item-label", listJoin.text)
                        ]);
                    } else {
                        return rootProjection.getBox(listElem);
                    }
                } else if (listJoin.type === "Terminator") {
                    return BoxFactory.horizontalList(element, roleName, [
                        rootProjection.getBox(listElem),
                        BoxFactory.label(element, roleName + "list-item-label", listJoin.text)
                    ]);
                }
            } else {
                return rootProjection.getBox(listElem);
            }
            return null;
        });
    }

    private static makeRefItems(property: PiNamedElement[], element: PiElement, propertyName: string, scoper: PiScoper, listJoin?: PiListJoin) {
        const numberOfItems = property.length;
        return property.map((listElem, index) => {
            const roleName: string = RoleProvider.property(element.piLanguageConcept(), propertyName, "list-item", index);
            const setFunc = (selected: string) => {
                listElem.name = selected;
                return BehaviorExecutionResult.EXECUTED;
            }
            if (listJoin !== null && listJoin !== undefined) {
                // TODO constants
                if (listJoin.type === "Separator") {
                    if (index < numberOfItems - 1) {
                        return BoxFactory.horizontalList(element, roleName, [
                            BoxUtils.referenceBox(element, propertyName, setFunc, scoper, index),
                            BoxFactory.label(element, roleName + "list-item-label", listJoin.text)
                        ]);
                    } else {
                        return BoxUtils.referenceBox(element, propertyName, setFunc, scoper, index);
                    }
                } else if (listJoin.type === "Terminator") {
                    return BoxFactory.horizontalList(element, roleName, [
                        BoxUtils.referenceBox(element, propertyName, setFunc, scoper, index),
                        BoxFactory.label(element, roleName + "list-item-label", listJoin.text)
                    ]);
                }
            } else {
                return BoxUtils.referenceBox(element, propertyName, setFunc, scoper, index);
            }
            return null;
        });
    }

    private static getPropertyInfo(element: PiElement, propertyName: string) {
        let property = element[propertyName];
        const propInfo = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName);
        const isList: boolean = propInfo.isList;
        const isPart: PropertyType = propInfo.propertyType;
        return { property, isList, isPart };
    }
}