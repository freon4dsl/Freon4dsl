import { FreNode } from "../../../ast";
import { BoxFactory, LimitedControlBox, LimitedDisplay } from "../../boxes";
import { FreLanguage, FreLanguageProperty } from "../../../language";
import { UtilCheckers } from "./UtilCheckers";
import { RoleProvider } from "../RoleProvider";
import { runInAction } from "mobx";

export class UtilLimitedHelpers {
    public static limitedBox(
        node: FreNode,
        propertyName: string,
        setFunc: (selected: string) => void,
        display: LimitedDisplay,
    ): LimitedControlBox {
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
}
