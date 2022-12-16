import { runInAction } from "mobx";
import { PiElement, PiNamedElement } from "../../ast";
import { Box, BoxFactory, CharAllowed, HorizontalListBox, SelectOption, TextBox, VerticalListBox } from "../boxes";
import { PiUtils } from "../../util";
import { BehaviorExecutionResult } from "../util";
import { Language, PropertyKind } from "../../language";
import { PiEditor } from "../PiEditor";
import { FreScoper } from "../../scoper";
import { RoleProvider } from "./RoleProvider";
import { EmptyLineBox } from "../boxes";
import { FreBoxProvider, FreProjectionHandler } from "../projections";

export class PiListInfo {
    text: string;
    type: string;
}

export class BoxUtils {
    static separatorName: string = "Separator";
    static terminatorName: string = "Terminator";
    static initiatorName: string = "Initiator";

    static emptyLineBox(element: PiElement, role: string): EmptyLineBox {
        return new EmptyLineBox(element, role);
    }

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
                result = BoxFactory.text(element, roleName, () => element[propertyName][index], (v: string) => runInAction( () => {(element[propertyName][index] = v)}), {
                    placeHolder: `<${propertyName}>`
                });
            } else {
                result = BoxFactory.text(element, roleName, () => element[propertyName], (v: string) => runInAction( () => {(element[propertyName] = v)}), {
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
                    () => element[propertyName][index].toString(),
                    (v: string) => runInAction(() => {
                        (element[propertyName][index] = Number.parseInt(v, 10));
                    }),
                    {
                        placeHolder: `<${propertyName}>`,
                        isCharAllowed: (currentText: string, key: string, index: number) => {
                            return isNumber(currentText, key, index);
                        }
                    });
            } else {
                result = BoxFactory.text(
                    element,
                    roleName,
                    () => element[propertyName].toString(),
                    (v: string) => runInAction(() => {
                        (element[propertyName] = Number.parseInt(v, 10));
                    }),
                    {
                        placeHolder: `<${propertyName}>`,
                        isCharAllowed: (currentText: string, key: string, index: number) => {
                            return isNumber(currentText, key, index);
                        }
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
    static booleanBox(element: PiElement,
                      propertyName: string,
                      labels: { yes: string; no: string } = {
                          yes: "yes",
                          no: "no"
                      },
                      index?: number): Box {
        // find the information on the property to be shown
        const propInfo = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName);
        const isList: boolean = propInfo.isList;
        const property = element[propertyName];

        // check the found information
        if (!(property !== undefined && property !== null)) {
            PiUtils.CHECK(false, "Property " + propertyName + " does not exist:" + property + "\"");
        }
        if (!(typeof property === "boolean" || typeof property === "string")) {
            PiUtils.CHECK(false, "Property " + propertyName + " is not a boolean:" + property.piLanguageConcept() + "\"");
        }

        // all's well, create the box
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
                (editor: PiEditor, option: SelectOption): BehaviorExecutionResult => {
                    runInAction(() => {
                        if (option.id === labels.yes) {
                            element[propertyName][index] = true;
                        } else if (option.id === labels.no) {
                            element[propertyName][index] = false;
                        }
                    });
                    return BehaviorExecutionResult.NULL;
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
                (editor: PiEditor, option: SelectOption): BehaviorExecutionResult => {
                    runInAction(() => {
                        if (option.id === labels.yes) {
                            element[propertyName] = true;
                        } else if (option.id === labels.no) {
                            element[propertyName] = false;
                        }
                    });
                    return BehaviorExecutionResult.NULL;
                }
            );
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
        setFunc: (selected: string) => void,
        scoper: FreScoper,
        index?: number
    ): Box {
        const propType: string = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName)?.type;
        if (!propType) {
            throw new Error("Cannot find property type '" + propertyName + "'");
        }
        // console.log("referenceBox for type: " + propType)
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
                // console.log("==> get selected option for property " + propertyName + " of " + element["name"] + " is " + property.name )
                if (!!property) {
                    return { id: property.name, label: property.name };
                } else {
                    return null;
                }
            },
            (editor: PiEditor, option: SelectOption): BehaviorExecutionResult => {
                // L.log("==> SET selected option for property " + propertyName + " of " + element["name"] + " to " + option?.label);
                if (!!option) {
                    // console.log("========> set property [" + propertyName + "] of " + element["name"] + " := " + option.label);
                    runInAction(() => {
                        setFunc(option.label);
                    });
                } else {
                    runInAction(() => {
                        element[propertyName] = null;
                    });
                }
                return BehaviorExecutionResult.EXECUTED;
            },
            {}
        );
    }

    /**
     * Returns a labelBox for 'content' within 'element'.
     * @param element
     * @param content
     * @param uid
     * @param selectable when true this box can be selected, default is 'false'
     */
    static labelBox(element: PiElement, content: string, uid: string, selectable?: boolean): Box {
        let _selectable: boolean = false;
        if (selectable !== undefined && selectable !== null && selectable) {
            _selectable = true;
        }
        const roleName: string = RoleProvider.label(element, uid) + "-" + content;
        return BoxFactory.label(element, roleName, content, {
            selectable: _selectable
        });
    }

    static indentBox(element: PiElement, indent: number, uid: string, childBox: Box): Box {
        return BoxFactory.indent(
            element,
            RoleProvider.indent(element, uid),
            indent,
            childBox
        );
    }

    static verticalPartListBox(element: PiElement, list: PiElement[], propertyName: string, listJoin: PiListInfo, boxProviderCache: FreProjectionHandler): VerticalListBox {
        // make the boxes for the children
        let children: Box[] = this.findPartItems(list, element, propertyName, listJoin, boxProviderCache);
        // add a placeholder where a new element can be added
        children = this.addPlaceholder(children, element, propertyName);
        // determine the role
        let role: string = RoleProvider.property(element.piLanguageConcept(), propertyName, "vpartlist");
        // return the box
        return new VerticalListBox(element, role, propertyName, children);
    }

    static verticalReferenceListBox(element: PiElement, propertyName: string, scoper: FreScoper, listInfo?: PiListInfo): Box {
        // find the information on the property to be shown
        const { property, isList, isPart } = this.getPropertyInfo(element, propertyName);
        // check whether the property is a reference list
        if (property !== undefined && propertyName !== null && isList && isPart === "reference") {
            // find the children to show in this listBox
            let children = this.makeRefItems(property, element, propertyName, scoper, listInfo);
            // add a placeholder where a new element can be added
            children = this.addPlaceholder(children, element, propertyName);
            return BoxFactory.verticalList(
                element,
                RoleProvider.property(element.piLanguageConcept(), propertyName, "vreflist"),
                propertyName,
                children
            );
        } else {
            PiUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a list or not a reference: " + property + "\"");
            return null;
        }
    }

    static horizontalPartListBox(element: PiElement, list: PiElement[], propertyName: string, listJoin: PiListInfo, boxProviderCache: FreProjectionHandler): VerticalListBox {
        // make the boxes for the children
        let children: Box[] = this.findPartItems(list, element, propertyName, listJoin, boxProviderCache);
        // add a placeholder where a new element can be added
        children = this.addPlaceholder(children, element, propertyName);
        // determine the role
        let role: string = RoleProvider.property(element.piLanguageConcept(), propertyName, "vpartlist");
        // return the box
        return new HorizontalListBox(element, role, propertyName, children);
    }

    static horizontalReferenceListBox(element: PiElement, propertyName: string, scoper: FreScoper, listJoin?: PiListInfo): Box {
        // TODO this one is not yet functioning correctly
        // find the information on the property to be shown
        const { property, isList, isPart } = this.getPropertyInfo(element, propertyName);
        // check whether the property is a reference list
        if (property !== undefined && propertyName !== null && isList && isPart === "reference") {
            // find the children to show in this listBox
            let children: Box[] = this.makeRefItems(property, element, propertyName, scoper, listJoin);
            // add a placeholder where a new element can be added
            children = this.addPlaceholder(children, element, propertyName);
            // return the box
            return BoxFactory.horizontalList(
                element,
                RoleProvider.property(element.piLanguageConcept(), propertyName, "hlist"),
                propertyName,
                children
            );
        } else {
            PiUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a list or not a reference: " + property + "\"");
            return null;
        }
    }

    static getBoxOrAlias(element: PiElement, propertyName: string, conceptName: string, boxProviderCache: FreProjectionHandler): Box {
        // find the information on the property to be shown
        const property = element[propertyName];
        const roleName = RoleProvider.property(element.piLanguageConcept(), propertyName);
        // console.log('getBoxOrAlias ' + property?.piId())
        return !!property
            ? boxProviderCache.getBoxProvider(property).box
            : BoxFactory.alias(element, roleName, "[add]", { propertyName: propertyName, conceptName: conceptName });
    }

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

    private static addPlaceholder(children: Box[], element: PiElement, propertyName: string) {
        return children.concat(
            BoxFactory.alias(
                element,
                RoleProvider.property(element.piLanguageConcept(), propertyName, "new-list-item"),
                `<+ ${propertyName}>`,
                {
                    propertyName: `${propertyName}`,
                    conceptName: Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName).type
                })
        );
    }

    private static findPartItems(property: PiElement[], element: PiElement, propertyName: string, listJoin: PiListInfo, boxProviderCache: FreProjectionHandler) {
        const numberOfItems = property.length;
        return property.map((listElem, index) => {
            const myProvider: FreBoxProvider = boxProviderCache.getBoxProvider(listElem);
            myProvider.mustUseTable(false);
            const roleName: string = RoleProvider.property(element.piLanguageConcept(), propertyName, "list-item", index);
            if (listJoin !== null && listJoin !== undefined) {
                if (listJoin.type === this.separatorName) {
                    if (index < numberOfItems - 1) {
                        return BoxFactory.horizontalList(element, roleName, propertyName,[
                            myProvider.box,
                            BoxFactory.label(element, roleName + "list-item-label", listJoin.text)
                        ]);
                    } else {
                        return myProvider.box;
                    }
                } else if (listJoin.type === this.terminatorName) {
                    return BoxFactory.horizontalList(element, roleName, propertyName,[
                        myProvider.box,
                        BoxFactory.label(element, roleName + "list-item-label", listJoin.text)
                    ]);
                } else if (listJoin.type === this.initiatorName) {
                    return BoxFactory.horizontalList(element, roleName, propertyName,[
                        BoxFactory.label(element, roleName + "list-item-label", listJoin.text),
                        myProvider.box,
                    ]);
                }
            } else {
                return myProvider.box;
            }
            return null;
        });
    }

    private static makeRefItems(properties: PiNamedElement[], element: PiElement, propertyName: string, scoper: FreScoper, listJoin?: PiListInfo): Box[] {
        const result: Box[] = [];
        const numberOfItems = properties.length;
        properties.forEach((listElem, index) => {
            const roleName: string = RoleProvider.property(element.piLanguageConcept(), propertyName, "list-item", index);
            const setFunc = (selected: string) => {
                listElem.name = selected;
                return BehaviorExecutionResult.EXECUTED;
            };
            if (listJoin !== null && listJoin !== undefined) {
                if (listJoin.type === this.separatorName) {
                    if (index < numberOfItems - 1) {
                        result.push(BoxFactory.horizontalList(element, roleName, propertyName, [
                            BoxUtils.referenceBox(element, propertyName, setFunc, scoper, index),
                            BoxFactory.label(element, roleName + "list-item-label", listJoin.text)
                        ]));
                    } else {
                        result.push(BoxUtils.referenceBox(element, propertyName, setFunc, scoper, index));
                    }
                } else if (listJoin.type === this.terminatorName) {
                    result.push(BoxFactory.horizontalList(element, roleName, propertyName,[
                        BoxUtils.referenceBox(element, propertyName, setFunc, scoper, index),
                        BoxFactory.label(element, roleName + "list-item-label", listJoin.text)
                    ]));
                } else if (listJoin.type === this.initiatorName) {
                    // TODO test this code
                    result.push(BoxFactory.horizontalList(element, roleName, propertyName, [
                        BoxFactory.label(element, roleName + "list-item-label", listJoin.text),
                        BoxUtils.referenceBox(element, propertyName, setFunc, scoper, index)
                    ]));
                }
            } else {
                result.push(BoxUtils.referenceBox(element, propertyName, setFunc, scoper, index));
            }
        });
        return result;
    }

    private static getPropertyInfo(element: PiElement, propertyName: string) {
        const property = element[propertyName];
        const propInfo = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName);
        const isList: boolean = propInfo.isList;
        const isPart: PropertyKind = propInfo.propertyKind;
        return { property, isList, isPart };
    }
}

function isNumber(currentText: string, key: string, index: number): CharAllowed {
    // console.log("isNumber text [" + currentText + "] + length [" + currentText.length + "] typeof ["+ typeof currentText + "] key [" + key + "] index [" + index + "]");
    if (isNaN(Number(key))) {
        if (index === currentText.length) {
            return CharAllowed.GOTO_NEXT;
        } else if (index === 0) {
            return CharAllowed.GOTO_PREVIOUS;
        } else {
            return CharAllowed.NOT_OK;
        }
    } else {
        return CharAllowed.OK;
    }
}
