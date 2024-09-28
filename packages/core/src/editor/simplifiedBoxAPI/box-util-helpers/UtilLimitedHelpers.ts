import { FreNode } from "../../../ast/index.js";
import {BoxFactory, LimitedControlBox, LimitedDisplay, SelectBox, SelectOption} from "../../boxes/index.js";
import { FreLanguage, FreLanguageProperty } from "../../../language/index.js";
import { UtilCheckers } from "./UtilCheckers.js";
import { RoleProvider } from "../RoleProvider.js";
import { runInAction } from "mobx";
import {FreScoper} from "../../../scoper/index.js";
import {FreEditor} from "../../FreEditor.js";
import {BehaviorExecutionResult} from "../../util/index.js";

export class UtilLimitedHelpers {

    public static limitedBox(
        node: FreNode,
        propertyName: string,
        setFunc: (selected: string) => void,
        display: LimitedDisplay,
        scoper?: FreScoper,
        index?: number
    ): LimitedControlBox | SelectBox {
        // find the information on the property to be shown
        const propInfo: FreLanguageProperty = FreLanguage.getInstance().classifierProperty(
            node.freLanguageConcept(),
            propertyName,
        );
        if (propInfo.isList) {
            throw new Error(
                "Cannot create a Limited box for '" + propertyName + "', because the set function is not correct",
            );
        } else if (display === LimitedDisplay.CHECKBOX) {
            throw new Error(
                "Cannot create a Checkbox Group box for '" + propertyName + "', because it is not a list value",
            );
        }
        if (display === LimitedDisplay.RADIO_BUTTON) {
            return this.limitedControlBox(node, propertyName, setFunc, propInfo);
        } else if (display === LimitedDisplay.SELECT) {
            return this.limitedSelectBox(node, propertyName, setFunc, scoper, index);
        } else {
            // should never occur
            throw new Error("Incorrect display type for limited value '" + propertyName + "'.");
        }
    }

    /**
     *
     * @param node
     * @param propertyName
     * @param setFunc           a function to make a reference to a single limited value/instance
     * @param display
     */
    public static limitedListBox(
        node: FreNode,
        propertyName: string,
        setFunc: (selected: string[]) => void,
        display: LimitedDisplay,
    ): LimitedControlBox {
        // find the information on the property to be shown
        const propInfo: FreLanguageProperty = FreLanguage.getInstance().classifierProperty(
            node.freLanguageConcept(),
            propertyName,
        );
        if (!propInfo.isList) {
            throw new Error(
                "Cannot create a Limited box for '" + propertyName + "', because the set function is not correct",
            );
        } else if (display === LimitedDisplay.RADIO_BUTTON) {
            throw new Error(
                "Cannot create a Radio Button box for '" + propertyName + "', because it is not a single value",
            );
        }
        const possibleValues: string[] = UtilCheckers.checkLimitedType(propInfo, propertyName);
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName, "limitedcontrolbox");
        let result: LimitedControlBox = BoxFactory.limited(
            node,
            roleName,
            () => node[propertyName].map((n) => n.name), // node[propertyName] is a list of references, therefore we need to get their names
            (v: string[]) =>
                runInAction(() => {
                    setFunc(v);
                }),
            possibleValues,
        );
        result.showAs = LimitedDisplay.CHECKBOX;
        result.propertyName = propertyName;
        return result;
    }

    private static limitedControlBox(
        node: FreNode,
        propertyName: string,
        setFunc: (selected: string) => void,
        propInfo: FreLanguageProperty
    ): LimitedControlBox {
        const possibleValues: string[] = UtilCheckers.checkLimitedType(propInfo, propertyName);

        // console.log(`BoxUtil.limitedBox for ${propertyName} current value is ` + [node[propertyName]] + ", possibleValues: [" + possibleValues + "]");
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName, "limitedcontrolbox");
        let result: LimitedControlBox = BoxFactory.limited(
            node,
            roleName,
            () => (node[propertyName] === null ? [] : [node[propertyName].name]),
            (v: string[]) =>
                runInAction(() => {
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
            possibleValues,
        );
        result.showAs = LimitedDisplay.RADIO_BUTTON;
        result.propertyName = propertyName;
        return result;
    }

    private static limitedSelectBox(
        node: FreNode,
        propertyName: string,
        setFunc: (selected: string) => void,
        scoper?: FreScoper,
        index?: number,
    ): SelectBox {
        const propType: string = FreLanguage.getInstance().classifierProperty(
            node.freLanguageConcept(),
            propertyName,
        )?.type;
        if (!propType) {
            throw new Error("Cannot find property type '" + propertyName + "'");
        }
        let property = node[propertyName];
        const roleName: string = RoleProvider.property(node.freLanguageConcept(), propertyName, "referencebox", index);
        // set the value for use in lists
        if (index !== null && index !== undefined && index >= 0) {
            property = property[index];
        }

        let result: SelectBox;
        // Note that this code is exactly the same as the code for creating a reference box
        result = BoxFactory.select(
            node,
            roleName,
            `<${propertyName}>`,
            () => {
                return scoper
                    .getVisibleNames(node, propType)
                    .filter((name) => !!name && name !== "")
                    .map((name) => ({
                        id: name,
                        label: name,
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
            {},
        );
        result.propertyName = propertyName;
        result.propertyIndex = index;
        return result;
    }
}
