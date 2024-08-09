import {runInAction} from "mobx";
import {FreNamedNode, FreNode, FreNodeReference} from "../../ast";
import {
    BoolDisplay,
    BooleanControlBox,
    Box,
    BoxFactory, ButtonBox,
    CharAllowed,
    EmptyLineBox,
    HorizontalListBox, IndentBox, LabelBox,
    LimitedControlBox,
    LimitedDisplay,
    NumberControlBox,
    NumberDisplay,
    NumberDisplayInfo,
    SelectBox,
    SelectOption,
    TextBox,
    VerticalListBox
} from "../boxes"
import {FreUtils} from "../../util";
import {BehaviorExecutionResult} from "../util";
import {FreLanguage, FreLanguageProperty, PropertyKind} from "../../language";
import {FreEditor} from "../FreEditor";
import {FreScoper} from "../../scoper";
import {RoleProvider} from "./RoleProvider";
import {FreBoxProvider, FreProjectionHandler} from "../projections";

export class FreListInfo {
    text: string;
    type: string;
}

export class BoxUtil {
    static separatorName: string = "Separator";
    static terminatorName: string = "Terminator";
    static initiatorName: string = "Initiator";

    static emptyLineBox(node: FreNode, role: string): EmptyLineBox {
        return new EmptyLineBox(node, role);
    }

    /**
     * Returns a textBox for property named 'propertyName' within 'element'.
     * When the property is a list (the type is "string[]", or "identifier[]"), this method can be
     * called for each item in the list. In that case an index to the item needs to be provided.
     * @param node the owning FreNode of the displayed property
     * @param propertyName the name of the displayed property
     * @param index the index of the item in the list, if the property is a list
     */
    static textBox(node: FreNode, propertyName: string, index?: number): TextBox {
        let result: TextBox = null;
        // find the information on the property to be shown
        const propInfo = FreLanguage.getInstance().classifierProperty(node.freLanguageConcept(), propertyName);
        const isList: boolean = propInfo.isList;
        const property = node[propertyName];
        // create the box
        if (property !== undefined && property !== null && typeof property === "string") {
            const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName, "textbox", index);
            if (isList && this.checkList(isList, index, propertyName)) {
                result = BoxFactory.text(
                    node,
                    roleName,
                    () => node[propertyName][index],
                    (v: string) => runInAction( () => { (node[propertyName][index] = v); }),
                    { placeHolder: `<${propertyName}>` }
                );
            } else {
                result = BoxFactory.text(
                    node,
                    roleName,
                    () => node[propertyName],
                    (v: string) => runInAction( () => { (node[propertyName] = v); }),
                    { placeHolder: `<${propertyName}>` }
                );
            }
            result.propertyName = propertyName;
            result.propertyIndex = index;
        } else {
            FreUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a string: " + property + "\"");
        }
        return result;
    }

    /**
     * Returns a textBox that holds a property of type 'number'.
     * When the property is a list (the type is "number[]"), this method can be
     * called for each item in the list. In that case an index to the item needs to be provided.
     * @param node the owning FreNode of the displayed property
     * @param propertyName the name of the displayed property
     * @param display
     * @param index the index of the item in the list, if the property is a list
     * @param displayInfo
     */
    // static numberBox(node: FreNode, propertyName: string, index?: number): Box {
    static numberBox(node: FreNode, propertyName: string, display: NumberDisplay, index?: number, displayInfo?: NumberDisplayInfo): Box {
        let result: TextBox | NumberControlBox = null;
        // find the information on the property to be shown
        const propInfo:FreLanguageProperty = FreLanguage.getInstance().classifierProperty(node.freLanguageConcept(), propertyName);
        const property = node[propertyName];
        const isList: boolean = propInfo.isList;
        // create the box
        if (property !== undefined && property !== null && typeof property === "number") {
            const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName, "numberbox", index);
            if (display !== NumberDisplay.SELECT) {
                result = this.makeNumberControlBox(isList, index, propertyName, node, roleName, display, displayInfo);
            } else {
                result = this.makeNumberSelectBox(isList, index, propertyName, node, roleName);
            }
            // result = this.makeNumberControlBox(isList, index, propertyName, node, roleName, NumberDisplay.HORIZONTAL_SLIDER, {min: 10, max: 210, step: 5, showMarks: true, discrete: true});
            result.propertyName = propertyName;
            result.propertyIndex = index;
        } else {
            FreUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a number: " + property + "\"");
        }
        return result;
    }

    private static makeNumberSelectBox(isList: boolean, index: number, propertyName: string, node: FreNode, roleName: string): TextBox {
        if (isList && this.checkList(isList, index, propertyName)) {
            return BoxFactory.text(
                node,
                roleName,
                () => node[propertyName][index].toString(),
                (v: string) => runInAction(() => {
                    (node[propertyName][index] = Number.parseInt(v, 10));
                }),
                {
                    placeHolder: `<${propertyName}>`,
                    isCharAllowed: (currentText: string, key: string, innerIndex: number) => {
                        return isNumber(currentText, key, innerIndex);
                    }
                });
        } else {
            return BoxFactory.text(
                node,
                roleName,
                () => node[propertyName].toString(),
                (v: string) => runInAction(() => {
                    (node[propertyName] = Number.parseInt(v, 10));
                }),
                {
                    placeHolder: `<${propertyName}>`,
                    isCharAllowed: (currentText: string, key: string, innerIndex: number) => {
                        return isNumber(currentText, key, innerIndex);
                    }
                });
        }
    }

    private static makeNumberControlBox(isList: boolean, index: number, propertyName: string, node: FreNode, roleName: string, display: NumberDisplay, displayInfo: NumberDisplayInfo): NumberControlBox {
        let result: NumberControlBox;
        if (isList && this.checkList(isList, index, propertyName)) {
            result = BoxFactory.number(
                node,
                roleName,
                () => node[propertyName][index],
                (v: number) => runInAction(() => {
                    (node[propertyName][index] = v);}),
                {
                    showAs: display,
                    displayInfo: displayInfo
                }
            );
        } else {
            result = BoxFactory.number(
                node,
                roleName,
                () => node[propertyName],
                (v: number) => runInAction(() => {
                    (node[propertyName] = v);}),
                {
                    showAs: display,
                    displayInfo: displayInfo
                }
            );
        }
        return result;
    }
    /**
     * Returns a textBox that holds a property of type 'boolean'.
     * When the property is a list (the type is "boolean[]"), this method can be
     * called for each item in the list. In that case an index to the item needs to be provided.
     * @param node the owning FreNode of the displayed property
     * @param propertyName the name of the displayed property
     * @param labels the different texts to be shown when the property is false or true
     * @param kind
     * @param index the index of the item in the list, if the property is a list
     * */
    static booleanBox(node: FreNode,
                      propertyName: string,
                      labels: { yes: string; no: string } = {
                          yes: "yes",
                          no: "no"
                      },
                      kind: BoolDisplay,
                      index?: number): Box {
        // find the information on the property to be shown
        const propInfo: FreLanguageProperty = FreLanguage.getInstance().classifierProperty(node.freLanguageConcept(), propertyName);
        const isList: boolean = propInfo.isList;
        const property: FreNode = node[propertyName];

        // check the found information
        if (!(property !== undefined && property !== null)) {
            FreUtils.CHECK(false, "Property " + propertyName + " does not exist:" + property + "\"");
        }
        if (!(typeof property === "boolean" || typeof property === "string")) {
            FreUtils.CHECK(false, "Property " + propertyName + " is not a boolean:" + property.freLanguageConcept() + "\"");
        }

        // all's well, create the box
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName, "booleanbox", index);
        let result: BooleanControlBox | SelectBox;
        if (kind === BoolDisplay.SELECT) {
            result = BoxUtil.makeBooleanSelectBox(node, propertyName, labels, isList, roleName, index);
        } else {
            result = BoxUtil.makeBooleanControlBox(node, propertyName, labels, isList, roleName, index);
            result.showAs = kind;
        }
        result.propertyName = propertyName;
        result.propertyIndex = index;
        return result;
    }

    private static makeBooleanControlBox(node: FreNode,
                                    propertyName: string,
                                    labels: { yes: string; no: string } = {
                                        yes: "yes",
                                        no: "no"
                                    },
                                    isList: boolean,
                                    roleName: string,
                                    index?: number): BooleanControlBox {
        let result: BooleanControlBox;
        if (isList && this.checkList(isList, index, propertyName)) {
            result = BoxFactory.bool(
                node,
                roleName,
                () => node[propertyName][index],
                (v: boolean) => runInAction(() => {
                    (node[propertyName][index] = v);}),
                {
                    labels: { yes:labels.yes, no:labels.no }
                }
            );
        } else {
            result = BoxFactory.bool(
                node,
                roleName,
                () => node[propertyName],
                (v: boolean) => runInAction(() => {
                    (node[propertyName] = v);
                }),
                {
                    labels: { yes:labels.yes, no:labels.no }
                });
        }
        return result;
    }

    private static makeBooleanSelectBox(node: FreNode,
                                        propertyName: string,
                                        labels: { yes: string; no: string } = {
                                            yes: "yes",
                                            no: "no"
                                        },
                                        isList: boolean,
                                        roleName: string,
                                        index?: number
    ): SelectBox {
        let result: SelectBox;
        if (isList && this.checkList(isList, index, propertyName)) {
            result = BoxFactory.select(
                node,
                roleName,
                "<optional>",
                () => [{ id: labels.yes, label: labels.yes }, { id: labels.no, label: labels.no }],
                () => {
                    if (node[propertyName][index]) {
                        return { id: labels.yes, label: labels.yes };
                    } else {
                        return { id: labels.no, label: labels.no };
                    }
                },
                // @ts-ignore
                (editor: FreEditor, option: SelectOption): BehaviorExecutionResult => {
                    runInAction(() => {
                        if (option.id === labels.yes) {
                            node[propertyName][index] = true;
                        } else if (option.id === labels.no) {
                            node[propertyName][index] = false;
                        }
                    });
                    return BehaviorExecutionResult.NULL;
                }
            );
        } else {
            result = BoxFactory.select(
                node,
                roleName,
                "<optional>",
                () => [{ id: labels.yes, label: labels.yes }, { id: labels.no, label: labels.no }],
                () => {
                    if (node[propertyName] === true) {
                        return { id: labels.yes, label: labels.yes };
                    } else {
                        return { id: labels.no, label: labels.no };
                    }
                },
                // @ts-ignore
                (editor: FreEditor, option: SelectOption): BehaviorExecutionResult => {
                    runInAction(() => {
                        if (option.id === labels.yes) {
                            node[propertyName] = true;
                        } else if (option.id === labels.no) {
                            node[propertyName] = false;
                        }
                    });
                    return BehaviorExecutionResult.NULL;
                }
            );
        }
        return result;
    }

    /**
     * Returns a selectBox that displays a property that is a reference.
     * It calls the 'scoper' to fill a dropdown list with possible values for the reference property.
     * A function that is able to set the property (based on the value selected from the dropdown list)
     * has to be provided.
     *
     * When the property is a list (the type is "reference SOMECONCEPT_OR_INTERFACE[]"), this method can be
     * called for each item in the list. In that case an index to the item needs to be provided.
     * @param node the owning FreNode of the displayed property
     * @param propertyName the name of the displayed property
     * @param setFunc
     * @param scoper
     * @param index
     */
    static referenceBox(
        node: FreNode,
        propertyName: string,
        setFunc: (selected: string) => void,
        scoper: FreScoper,
        index?: number
    ): Box {
        const propType: string = FreLanguage.getInstance().classifierProperty(node.freLanguageConcept(), propertyName)?.type;
        if (!propType) {
            throw new Error("Cannot find property type '" + propertyName + "'");
        }
        // console.log("referenceBox for type: " + propType)
        let property = node[propertyName];
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName, "referencebox", index);
        // set the value for use in lists
        if (index !== null && index !== undefined && index >= 0) {
            property = property[index];
        }

        let result: SelectBox;
        result = BoxFactory.select(
            node,
            roleName,
            `<${propertyName}>`,
            () => {
                return scoper.getVisibleNames(node, propType)
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
            // @ts-ignore
            (editor: FreEditor, option: SelectOption): BehaviorExecutionResult => {
                // L.log("==> SET selected option for property " + propertyName + " of " + element["name"] + " to " + option?.label);
                if (!!option) {
                    // console.log("========> set property [" + propertyName + "] of " + element["name"] + " := " + option.label);
                    runInAction(() => {
                        setFunc(option.label);
                    });
                } else {
                    runInAction(() => {
                        node[propertyName] = null;
                    });
                }
                return BehaviorExecutionResult.EXECUTED;
            },
            {}
        );
        result.propertyName = propertyName;
        result.propertyIndex = index;
        return result;
    }

    /**
     *
     * @param node
     * @param propertyName
     * @param setFunc           a function to make a reference to a single limited value/instance
     * @param display
     */
    static limitedBox(
        node: FreNode,
        propertyName: string,
        setFunc: (selected: string) => void,
        display: LimitedDisplay,
    ): Box {
        // find the information on the property to be shown
        const propInfo: FreLanguageProperty = FreLanguage.getInstance().classifierProperty(node.freLanguageConcept(), propertyName);
        if (propInfo.isList) {
            throw new Error("Cannot create a Limited box for '" + propertyName + "', because the set function is not correct");
        } else if (display === LimitedDisplay.CHECKBOX) {
            throw new Error("Cannot create a Checkbox Group box for '" + propertyName + "', because it is not a list value");
        }
        const possibleValues: string[] = this.checkLimitedType(propInfo, propertyName);

        // console.log(`BoxUtil.limitedBox for ${propertyName} current value is ` + [node[propertyName]] + ", possibleValues: [" + possibleValues + "]");
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName, "limitedcontrolbox");
        let result: LimitedControlBox = BoxFactory.limited(
            node,
            roleName,
            () => (node[propertyName] === null ? [] : [node[propertyName].name]),
            (v: string[]) => runInAction(() => {
                if (!!v[0]) {
                    // console.log("========> set property [" + propertyName + "] of " + node["name"] + " := " + v[0]);
                    runInAction(() => {
                        setFunc(v[0]);
                    });
                } else {
                    runInAction(() => {
                        node[propertyName] = null;
                    });
                }
            }),
            possibleValues
        );
        result.showAs = LimitedDisplay.RADIO_BUTTON;
        result.propertyName = propertyName;
        return result;
    }

    /**
     *
     * @param node
     * @param propertyName
     * @param setFunc           a function to make a reference to a single limited value/instance
     * @param display
     */
    static limitedListBox(
        node: FreNode,
        propertyName: string,
        setFunc: (selected: string[]) => void,
        display: LimitedDisplay,
    ): Box {
        // find the information on the property to be shown
        // find the information on the property to be shown
        const propInfo: FreLanguageProperty = FreLanguage.getInstance().classifierProperty(node.freLanguageConcept(), propertyName);
        if (!propInfo.isList) {
            throw new Error("Cannot create a Limited box for '" + propertyName + "', because the set function is not correct");
        } else if (display === LimitedDisplay.RADIO_BUTTON) {
            throw new Error("Cannot create a Radio Button box for '" + propertyName + "', because it is not a single value");
        }
        const possibleValues: string[] = this.checkLimitedType(propInfo, propertyName);

        // console.log("BoxUtil.limitedListBox current value is " + [node[propertyName].name] + ", possibleValues: [" + possibleValues + "]");
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName, "limitedcontrolbox");
        let result: LimitedControlBox = BoxFactory.limited(
            node,
            roleName,
            () => node[propertyName].map(n => n.name), // node[propertyName] is a list of references, therefore we need to get their names
            (v: string[]) => runInAction(() => {
                // console.log("========> set property [" + propertyName + "] of " + node["name"] + " := " + v);
                setFunc(v);
            }),
            possibleValues
        );
        result.showAs = LimitedDisplay.CHECKBOX;
        result.propertyName = propertyName;
        return result;
    }

    private static checkLimitedType(propInfo: FreLanguageProperty, propertyName: string) {
        // check whether this type is really a limited type
        const propType: string = propInfo?.type;
        if (!propType) {
            throw new Error("Cannot find type of '" + propertyName + "'");
        }
        const isLimited: boolean = FreLanguage.getInstance().concept(propType).isLimited;
        if (!isLimited) {
            throw new Error("Type of '" + propertyName + "' is not a limited concept");
        }

        // get all names of the instances of the limited concept
        return FreLanguage.getInstance().concept(propType).instanceNames;
    }

    /**
     * Returns a labelBox for 'content' within 'element'.
     * @param node
     * @param content
     * @param uid
     * @param selectable when true this box can be selected, default is 'false'
     */
    static labelBox(node: FreNode, content: string, uid: string, initializer?: Partial<LabelBox>): LabelBox {
        const roleName: string = RoleProvider.label(node, uid) + "-" + content;
        return BoxFactory.label(node, roleName, content, initializer);
    }

    static indentBox(element: FreNode, indent: number, uid: string, childBox: Box, initializer?: Partial<IndentBox>): IndentBox {
        return BoxFactory.indent(
            element,
            RoleProvider.indent(element, uid),
            indent,
            childBox,
            initializer
        );
    }

    static buttonBox(element: FreNode, text: string, roleName: string, initializer?: Partial<ButtonBox>): ButtonBox {
        return BoxFactory.button(element, text, roleName, initializer);
    }

    static verticalPartListBox(element: FreNode,
                               list: FreNode[],
                               propertyName: string,
                               listJoin: FreListInfo,
                               boxProviderCache: FreProjectionHandler,
                               initializer?: Partial<VerticalListBox>): VerticalListBox {
        // make the boxes for the children
        let children: Box[] = this.makePartItems(element, list, propertyName, boxProviderCache, listJoin);
        // add a placeholder where a new element can be added
        children = this.addPlaceholder(children, element, propertyName);
        // determine the role
        const role: string = RoleProvider.property(element.freLanguageConcept(), propertyName, "vpartlist");
        // return the box
        const result: VerticalListBox = BoxFactory.verticalList(element, role, propertyName, children, initializer);
        result.propertyName = propertyName;
        return result;
    }

    static verticalReferenceListBox(element: FreNode, propertyName: string, scoper: FreScoper, listInfo?: FreListInfo, initializer?: Partial<VerticalListBox>): Box {
        // find the information on the property to be shown
        const { property, isList, isPart } = this.getPropertyInfo(element, propertyName);
        // check whether the property is a reference list
        if (property !== undefined && propertyName !== null && isList && isPart === "reference") {
            // find the children to show in this listBox
            let children: Box[] = this.makeRefItems(element, property as FreNodeReference<FreNamedNode>[], propertyName, scoper, listInfo);
            // add a placeholder where a new element can be added
            children = this.addReferencePlaceholder(children, element, propertyName);
            let result: VerticalListBox;
            result = BoxFactory.verticalList(
                element,
                RoleProvider.property(element.freLanguageConcept(), propertyName, "vreflist"),
                propertyName,
                children,
                initializer
            );
            result.propertyName = propertyName;
            return result;
        } else {
            FreUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a list or not a reference: " + property + "\"");
            return null;
        }
    }

    static horizontalPartListBox(element: FreNode,
                                 list: FreNode[],
                                 propertyName: string,
                                 listJoin: FreListInfo,
                                 boxProviderCache: FreProjectionHandler,
                                 initializer?: Partial<VerticalListBox>): VerticalListBox {
        // make the boxes for the children
        let children: Box[] = this.makePartItems(element, list, propertyName, boxProviderCache, listJoin);
        // add a placeholder where a new element can be added
        children = this.addPlaceholder(children, element, propertyName);
        // determine the role
        const role: string = RoleProvider.property(element.freLanguageConcept(), propertyName, "vpartlist");
        // return the box
        const result = BoxFactory.horizontalList(element, role, propertyName, children, initializer);
        result.propertyName = propertyName;
        return result;
    }

    static horizontalReferenceListBox(element: FreNode, propertyName: string, scoper: FreScoper, listJoin?: FreListInfo, initializer?: Partial<HorizontalListBox>): HorizontalListBox {
        // TODO this one is not yet functioning correctly
        // find the information on the property to be shown
        const { property, isList, isPart } = this.getPropertyInfo(element, propertyName);
        // check whether the property is a reference list
        if (property !== undefined && propertyName !== null && isList && isPart === "reference") {
            // find the children to show in this listBox
            let children: Box[] = this.makeRefItems(element, property as FreNodeReference<FreNamedNode>[], propertyName, scoper, listJoin);
            // add a placeholder where a new element can be added
            children = this.addReferencePlaceholder(children, element, propertyName);
            // return the box
            let result: HorizontalListBox;
            result = BoxFactory.horizontalList(
                element,
                RoleProvider.property(element.freLanguageConcept(), propertyName, "hlist"),
                propertyName,
                children,
                initializer
            );
            result.propertyName = propertyName;
            return result;
        } else {
            FreUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a list or not a reference: " + property + "\"");
            return null;
        }
    }

    static getBoxOrAction(element: FreNode, propertyName: string, conceptName: string, boxProviderCache: FreProjectionHandler): Box {
        // find the information on the property to be shown
        const property = element[propertyName];
        const roleName: string = RoleProvider.property(element.freLanguageConcept(), propertyName);
        // console.log('getBoxOrAction ' + property?.freId())
        let result: Box;
        result = !!property
            ? boxProviderCache.getBoxProvider(property).box
            : BoxFactory.action(element, roleName, `<${propertyName}>`, { propertyName: propertyName, conceptName: conceptName });
        result.propertyName = propertyName;
        // result.propertyIndex = ??? todo
        return result;
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
            FreUtils.CHECK(false, "Property " + propertyName + " is not a list: " + index + "\"");
            res = false;
        }
        if (isList && (index === null || index === undefined || index < 0)) {
            FreUtils.CHECK(false, "Property " + propertyName + " is a list, index should be provided.");
            res = false;
        }
        return res;
    }

    private static addPlaceholder(children: Box[], element: FreNode, propertyName: string) {
        return children.concat(
            BoxFactory.action(
                element,
                RoleProvider.property(element.freLanguageConcept(), propertyName, "new-list-item"),
                `<+ ${propertyName}>`,
                {
                    propertyName: `${propertyName}`,
                    conceptName: FreLanguage.getInstance().classifierProperty(element.freLanguageConcept(), propertyName).type
                })
        );
    }

    private static addReferencePlaceholder(children: Box[], element: FreNode, propertyName: string) {
        return children.concat(
            BoxFactory.action(
                element,
                RoleProvider.property(element.freLanguageConcept(), propertyName, "new-list-item"),
                `<+ ${propertyName}>`,
                {
                    propertyName: `${propertyName}`
                    // conceptName: FreLanguage.getInstance().classifierProperty(element.freLanguageConcept(), propertyName).type
                })
        );
    }

    public static makePartItems(element: FreNode, property: FreNode[], propertyName: string, boxProviderCache: FreProjectionHandler, listJoin?: FreListInfo ) {
        const numberOfItems: number = property.length;
        return property.map((listElem, index) => {
            const myProvider: FreBoxProvider = boxProviderCache.getBoxProvider(listElem);
            const roleName: string = RoleProvider.property(element.freLanguageConcept(), propertyName, "list-item", index);
            if (listJoin !== null && listJoin !== undefined) {
                if (listJoin.type === this.separatorName) {
                    if (index < numberOfItems - 1) {
                        return BoxFactory.horizontalLayout(element, roleName, propertyName, [
                            myProvider.box,
                            BoxFactory.label(element, roleName + "list-item-label", listJoin.text)
                        ]);
                    } else {
                        return myProvider.box;
                    }
                } else if (listJoin.type === this.terminatorName) {
                    return BoxFactory.horizontalLayout(element, roleName, propertyName, [
                        myProvider.box,
                        BoxFactory.label(element, roleName + "list-item-label", listJoin.text)
                    ]);
                } else if (listJoin.type === this.initiatorName) {
                    return BoxFactory.horizontalLayout(element, roleName, propertyName, [
                        BoxFactory.label(element, roleName + "list-item-label", listJoin.text),
                        myProvider.box
                    ]);
                }
            } else {
                return myProvider.box;
            }
            return null;
        });
    }

    public static makeRefItems(element: FreNode, properties: FreNodeReference<FreNamedNode>[], propertyName: string, scoper: FreScoper, listJoin?: FreListInfo): Box[] {
        const result: Box[] = [];
        const numberOfItems = properties.length;
        properties.forEach((listElem, index) => {
            const roleName: string = RoleProvider.property(element.freLanguageConcept(), propertyName, "list-item", index);
            const setFunc = (selected: string) => {
                listElem.name = selected;
                return BehaviorExecutionResult.EXECUTED;
            };
            if (listJoin !== null && listJoin !== undefined) {
                if (listJoin.type === this.separatorName) {
                    if (index < numberOfItems - 1) {
                        result.push(BoxFactory.horizontalList(element, roleName, propertyName,
                            [
                            BoxUtil.referenceBox(element, propertyName, setFunc, scoper, index),
                            BoxFactory.label(element, roleName + "list-item-label", listJoin.text)
                        ]));
                    } else {
                        result.push(BoxUtil.referenceBox(element, propertyName, setFunc, scoper, index));
                    }
                } else if (listJoin.type === this.terminatorName) {
                    result.push(BoxFactory.horizontalList(element, roleName, propertyName,
                        [
                        BoxUtil.referenceBox(element, propertyName, setFunc, scoper, index),
                        BoxFactory.label(element, roleName + "list-item-label", listJoin.text)
                    ]));
                } else if (listJoin.type === this.initiatorName) {
                    // TODO test this code
                    result.push(BoxFactory.horizontalList(element, roleName, propertyName,
                        [
                        BoxFactory.label(element, roleName + "list-item-label", listJoin.text),
                        BoxUtil.referenceBox(element, propertyName, setFunc, scoper, index)
                    ]));
                }
            } else {
                result.push(BoxUtil.referenceBox(element, propertyName, setFunc, scoper, index));
            }
        });
        return result;
    }

    private static getPropertyInfo(element: FreNode, propertyName: string) {
        const property = element[propertyName];
        const propInfo: FreLanguageProperty = FreLanguage.getInstance().classifierProperty(element.freLanguageConcept(), propertyName);
        const isList: boolean = propInfo.isList;
        const isPart: PropertyKind = propInfo.propertyKind;
        return { property, isList, isPart };
    }
}

function isNumber(currentText: string, key: string, index: number): CharAllowed {
    // tslint:disable-next-line:max-line-length
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
