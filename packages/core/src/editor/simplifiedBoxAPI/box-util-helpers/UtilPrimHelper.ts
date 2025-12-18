import type { FreNode } from "../../../ast/index.js";
import { AST } from "../../../change-manager/index.js";
import type { MultiLineTextBox} from '../../boxes/index.js';
import {
    BoolDisplay,
    type BooleanControlBox,
    type Box,
    BoxFactory,
    CharAllowed,
    type NumberControlBox,
    NumberDisplay,
    type NumberDisplayInfo,
    type SelectBox,
    type SelectOption,
    type TextBox
} from '../../boxes/index.js';
import { type FreEditor } from "../../FreEditor.js";
import { BehaviorExecutionResult } from "../../util/index.js";
import { UtilCheckers } from "./UtilCheckers.js";
import { FreLanguage, type FreLanguageProperty } from "../../../language/index.js";
import { RoleProvider } from "../RoleProvider.js";
import { FreUtils } from "../../../util/index.js"

export class UtilPrimHelper {
    public static textBox(node: FreNode, propertyName: string, index?: number): TextBox {
        let result: TextBox = null;
        // find the information on the property to be shown
        const propInfo: FreLanguageProperty = FreLanguage.getInstance().classifierProperty(
            node.freLanguageConcept(),
            propertyName,
        );
        const isList: boolean = propInfo.isList;
        const property = node[propertyName];
        // create the box
        if (property !== undefined && property !== null && typeof property === "string") {
            const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName, "textbox", index);
            if (isList && UtilCheckers.checkList(isList, index, propertyName)) {
                result = BoxFactory.text(
                    node,
                    roleName,
                    () => node[propertyName][index],
                    (v: string) =>
                        AST.change(() => {
                            node[propertyName][index] = v;
                        }),
                    { placeHolder: `${propertyName}` },
                );
            } else {
                result = BoxFactory.text(
                    node,
                    roleName,
                    () => node[propertyName],
                    (v: string) =>
                        AST.change(() => {
                            node[propertyName] = v;
                        }),
                    { placeHolder: `${propertyName}` },
                );
                // ENSURE TEXTBOX IS SEEN AS DIRTY
                // result.isDirty()
            }
            result.propertyName = propertyName;
            result.propertyIndex = index;
        } else {
            FreUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a string: " + property + '"');
        }
        return result;
    }

    public static multilineTextBox(node: FreNode, propertyName: string, index?: number): MultiLineTextBox {
        let result: MultiLineTextBox = null;
        // find the information on the property to be shown
        const propInfo: FreLanguageProperty = FreLanguage.getInstance().classifierProperty(
          node.freLanguageConcept(),
          propertyName,
        );
        const isList: boolean = propInfo.isList;
        const property = node[propertyName];
        // create the box
        if (property !== undefined && property !== null && typeof property === "string") {
            const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName, "multilinetextbox", index);
            if (isList && UtilCheckers.checkList(isList, index, propertyName)) {
                result = BoxFactory.multiline(
                  node,
                  roleName,
                  () => node[propertyName][index],
                  (v: string) =>
                    AST.change(() => {
                        node[propertyName][index] = v;
                    }),
                  { placeHolder: `${propertyName}` },
                );
            } else {
                result = BoxFactory.multiline(
                  node,
                  roleName,
                  () => node[propertyName],
                  (v: string) =>
                    AST.change(() => {
                        node[propertyName] = v;
                    }),
                  { placeHolder: `${propertyName}` },
                );
                // ENSURE TEXTBOX IS SEEN AS DIRTY
                // result.isDirty()
            }
            result.propertyName = propertyName;
            result.propertyIndex = index;
        } else {
            FreUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a string: " + property + '"');
        }
        return result;
    }

    public static numberBox(
        node: FreNode,
        propertyName: string,
        display: NumberDisplay,
        index?: number,
        displayInfo?: NumberDisplayInfo,
    ): Box {
        let result: TextBox | NumberControlBox = null;
        // find the information on the property to be shown
        const propInfo: FreLanguageProperty = FreLanguage.getInstance().classifierProperty(
            node.freLanguageConcept(),
            propertyName,
        );
        const property: FreLanguageProperty = node[propertyName];
        const isList: boolean = propInfo.isList;
        // create the box
        if (property !== undefined && property !== null && typeof property === "number") {
            const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName, "numberbox", index);
            if (display !== NumberDisplay.SELECT) {
                result = this.makeNumberControlBox(isList, index, propertyName, node, roleName, display, displayInfo);
            } else {
                result = this.makeNumberSelectBox(isList, index, propertyName, node, roleName);
            }
            result.propertyName = propertyName;
            result.propertyIndex = index;
        } else {
            FreUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a number: " + property + '"');
        }
        return result;
    }

    public static booleanBox(
        node: FreNode,
        propertyName: string,
        labels: { yes: string; no: string, unknown?: string } = {
            yes: "yes",
            no: "no"
        },
        kind: BoolDisplay,
        index?: number,
    ): Box {
        // find the information on the property to be shown
        const propInfo: FreLanguageProperty = FreLanguage.getInstance().classifierProperty(
            node.freLanguageConcept(),
            propertyName,
        );
        const isList: boolean = propInfo.isList;
        // const property: FreNode = node[propertyName];

        // check the found information
        // if (!(property !== undefined && property !== null)) {
        //     FreUtils.CHECK(false, "Property " + propertyName + " does not exist:" + property + '"');
        // }
        // if (!(typeof property === "boolean" || typeof property === "string")) {
        //     FreUtils.CHECK(
        //         false,
        //         "Property " + propertyName + " is not a boolean:" + property.freLanguageConcept() + '"',
        //     );
        // }

        // all's well, create the box
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName, "booleanbox", index);
        let result: BooleanControlBox | SelectBox;
        if (kind === BoolDisplay.SELECT) {
            result = UtilPrimHelper.makeBooleanSelectBox(node, propertyName, labels, isList, roleName, index);
        } else {
            result = UtilPrimHelper.makeBooleanControlBox(node, propertyName, labels, isList, roleName, index);
            result.showAs = kind;
        }
        result.propertyName = propertyName;
        result.propertyIndex = index;
        return result;
    }

    private static makeNumberSelectBox(
        isList: boolean,
        index: number,
        propertyName: string,
        node: FreNode,
        roleName: string,
    ): TextBox {
        if (isList && UtilCheckers.checkList(isList, index, propertyName)) {
            return BoxFactory.text(
                node,
                roleName,
                () => { 
                    const propValue = node[propertyName][index]
                    if (isNaN(propValue)) {
                        return ""
                    } else {
                        return propValue.toString()
                    }
                },
                (v: string) =>
                    AST.change(() => {
                        node[propertyName][index] = Number.parseInt(v, 10);
                    }),
                {
                    placeHolder: `${propertyName}`,
                    isCharAllowed: (currentText: string, key: string, innerIndex: number) => {
                        return isNumber(currentText, key, innerIndex);
                    }
                },
            );
        } else {
            return BoxFactory.text(
                node,
                roleName,
                () => {
                    const propValue = node[propertyName]
                    if (isNaN(propValue)) {
                        return ""
                    } else {
                        return propValue.toString()
                    }
                },
                (v: string) =>
                    AST.change(() => {
                        node[propertyName] = Number.parseInt(v, 10);
                    }),
                {
                    placeHolder: `${propertyName}`,
                    isCharAllowed: (currentText: string, key: string, innerIndex: number) => {
                        return isNumber(currentText, key, innerIndex);
                    }
                },
            );
        }
    }

    private static makeNumberControlBox(
        isList: boolean,
        index: number,
        propertyName: string,
        node: FreNode,
        roleName: string,
        display: NumberDisplay,
        displayInfo: NumberDisplayInfo,
    ): NumberControlBox {
        let result: NumberControlBox;
        if (isList && UtilCheckers.checkList(isList, index, propertyName)) {
            result = BoxFactory.number(
                node,
                roleName,
                () => node[propertyName][index],
                (v: number) =>
                    AST.change(() => {
                        node[propertyName][index] = v;
                    }),
                {
                    showAs: display,
                    displayInfo: displayInfo,
                },
            );
        } else {
            result = BoxFactory.number(
                node,
                roleName,
                () => node[propertyName],
                (v: number) =>
                    AST.change(() => {
                        node[propertyName] = v;
                    }),
                {
                    showAs: display,
                    displayInfo: displayInfo,
                },
            );
        }
        return result;
    }
    public static makeBooleanControlBox(
        node: FreNode,
        propertyName: string,
        labels: { yes: string; no: string, unknown?: string } = {
            yes: "yes",
            no: "no",
        },
        isList: boolean,
        roleName: string,
        index?: number,
    ): BooleanControlBox {
        let result: BooleanControlBox;
        if (isList && UtilCheckers.checkList(isList, index, propertyName)) {
            result = BoxFactory.bool(
                node,
                roleName,
                () => node[propertyName][index],
                (v: boolean) =>
                    AST.change(() => {
                        node[propertyName][index] = v;
                    }),
                {
                    labels: { yes: labels.yes, no: labels.no },
                },
            );
        } else {
            result = BoxFactory.bool(
                node,
                roleName,
                () => node[propertyName],
                (v: boolean) =>
                    AST.change(() => {
                        node[propertyName] = v;
                    }),
                {
                    labels: ((FreLanguage.getInstance().classifierProperty(node.freLanguageConcept(), propertyName).isOptional) ? 
                                { yes: labels.yes, no: labels.no, unknown: labels.unknown } 
                            :
                            { yes: labels.yes, no: labels.no }
                    ),
                },
            );
        }
        return result;
    }

    public static makeBooleanSelectBox(
        node: FreNode,
        propertyName: string,
        labels: { yes: string; no: string, unknown?: string } = {
            yes: "yes",
            no: "no"
        },
        isList: boolean,
        roleName: string,
        index?: number,
    ): SelectBox {
        let result: SelectBox;
        if (isList && UtilCheckers.checkList(isList, index, propertyName)) {
            result = BoxFactory.select(
                node,
                roleName,
                "<optional>",
                () => [
                    { id: labels.yes, label: labels.yes },
                    { id: labels.no, label: labels.no },
                ],
                () => {
                    if (node[propertyName][index]) {
                        return { id: labels.yes, label: labels.yes };
                    } else {
                        return { id: labels.no, label: labels.no };
                    }
                },
                // @ts-ignore
                (editor: FreEditor, option: SelectOption): BehaviorExecutionResult => {
                    AST.change(() => {
                        if (option.id === labels.yes) {
                            node[propertyName][index] = true;
                        } else if (option.id === labels.no) {
                            node[propertyName][index] = false;
                        }
                    });
                    return BehaviorExecutionResult.EXECUTED;
                },
            );
        } else {
            result = BoxFactory.select(
                node,
                roleName,
                "<optional>",
                () => ((FreLanguage.getInstance().classifierProperty(node.freLanguageConcept(), propertyName).isOptional) ? [
                            { id: labels.yes, label: labels.yes },
                            { id: labels.no, label: labels.no },
                            { id: labels.unknown, label: labels.unknown }
                        ] :
                        [
                            { id: labels.yes, label: labels.yes },
                            { id: labels.no, label: labels.no }
                        ]
                ),
                () => {
                    if (node[propertyName] === true) {
                        return { id: labels.yes, label: labels.yes };
                    } else if (node[propertyName] === false) {
                        return { id: labels.no, label: labels.no };
                    } else {
                        return { id: labels.unknown, label: labels.unknown };
                    }
                },
                // @ts-ignore
                (editor: FreEditor, option: SelectOption): BehaviorExecutionResult => {
                    AST.change(() => {
                        if (option.id === labels.yes) {
                            node[propertyName] = true;
                        } else if (option.id === labels.no) {
                            node[propertyName] = false;
                        } else if (option.id === labels.unknown) {
                            node[propertyName] = undefined;
                        }
                    });
                    return BehaviorExecutionResult.EXECUTED;
                },
            );
        }
        return result;
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
