import {
    Box,
    BoxFactory,
    ExternalRefListBox,
    HorizontalListBox,
    SelectBox,
    SelectOption,
    VerticalListBox,
} from "../../boxes";
import { FreNamedNode, FreNode, FreNodeReference } from "../../../ast";
import { RoleProvider } from "../RoleProvider";
import { FreScoper } from "../../../scoper";
import { BehaviorExecutionResult } from "../../util";
import { BoxUtil, FreListInfo } from "../BoxUtil";
import { UtilCommon } from "./UtilCommon";
import { FreLanguage } from "../../../language";
import { FreEditor } from "../../FreEditor";
import { runInAction } from "mobx";
import { FreUtils } from "../../../util";

export class UtilRefHelpers {
    public static referenceBox(
        node: FreNode,
        propertyName: string,
        setFunc: (selected: string) => void,
        scoper: FreScoper,
        index?: number,
    ): SelectBox {
        const propType: string = FreLanguage.getInstance().classifierProperty(
            node.freLanguageConcept(),
            propertyName,
        )?.type;
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

    public static verticalReferenceListBox(
        node: FreNode,
        propertyName: string,
        scoper: FreScoper,
        listInfo?: FreListInfo,
        initializer?: Partial<VerticalListBox>,
    ): VerticalListBox {
        // find the information on the property to be shown
        const { property, isList, isPart } = UtilCommon.getPropertyInfo(node, propertyName);
        // check whether the property is a reference list
        if (property !== undefined && propertyName !== null && isList && isPart === "reference") {
            // find the children to show in this listBox
            let children: Box[] = this.makeRefItems(
                node,
                property as FreNodeReference<FreNamedNode>[],
                propertyName,
                scoper,
                listInfo,
            );
            // add a placeholder where a new element can be added
            children = UtilRefHelpers.addReferencePlaceholder(children, node, propertyName);
            // determine the role
            const role: string = RoleProvider.property(node.freLanguageConcept(), propertyName, "vreflist");
            // create and return the box
            const result: VerticalListBox = BoxFactory.verticalList(node, role, propertyName, children, initializer);
            result.propertyName = propertyName;
            return result;
        } else {
            FreUtils.CHECK(
                false,
                "Property " + propertyName + " does not exist or is not a list or not a reference: " + property + '"',
            );
            return null;
        }
    }

    public static horizontalReferenceListBox(
        node: FreNode,
        propertyName: string,
        scoper: FreScoper,
        listJoin?: FreListInfo,
        initializer?: Partial<HorizontalListBox>,
    ): HorizontalListBox {
        // TODO this one is not yet functioning correctly
        // find the information on the property to be shown
        const { property, isList, isPart } = UtilCommon.getPropertyInfo(node, propertyName);
        // check whether the property is a reference list
        if (property !== undefined && propertyName !== null && isList && isPart === "reference") {
            // find the children to show in this listBox
            let children: Box[] = UtilRefHelpers.makeRefItems(
                node,
                property as FreNodeReference<FreNamedNode>[],
                propertyName,
                scoper,
                listJoin,
            );
            // add a placeholder where a new element can be added
            children = UtilRefHelpers.addReferencePlaceholder(children, node, propertyName);
            // return the box
            let result: HorizontalListBox;
            result = BoxFactory.horizontalList(
                node,
                RoleProvider.property(node.freLanguageConcept(), propertyName, "hlist"),
                propertyName,
                children,
                initializer,
            );
            result.propertyName = propertyName;
            return result;
        } else {
            FreUtils.CHECK(
                false,
                "Property " + propertyName + " does not exist or is not a list or not a reference: " + property + '"',
            );
            return null;
        }
    }

    public static externalReferenceListBox(
        node: FreNode,
        propertyName: string,
        externalComponentName: string,
        scoper: FreScoper,
        initializer?: Partial<ExternalRefListBox>,
    ): ExternalRefListBox {
        // find the information on the property to be shown
        const { property, isList, isPart } = UtilCommon.getPropertyInfo(node, propertyName);
        // check whether the property is a reference list
        if (property !== undefined && propertyName !== null && isList && isPart === "reference") {
            // find the children to show in this listBox
            let children: Box[] = UtilRefHelpers.makeRefItems(
                node,
                property as FreNodeReference<FreNamedNode>[],
                propertyName,
                scoper,
            );
            // determine the role
            const role: string = RoleProvider.property(node.freLanguageConcept(), propertyName, "xreflist");
            // create and return the box
            const result: ExternalRefListBox = new ExternalRefListBox(
                externalComponentName,
                node,
                role,
                propertyName,
                children,
                initializer,
            );
            result.propertyName = propertyName;
            return result;
        } else {
            FreUtils.CHECK(
                false,
                "Property " + propertyName + " does not exist or is not a list or not a reference: " + property + '"',
            );
            return null;
        }
    }

    private static addReferencePlaceholder(children: Box[], element: FreNode, propertyName: string) {
        return children.concat(
            BoxFactory.action(
                element,
                RoleProvider.property(element.freLanguageConcept(), propertyName, "new-list-item"),
                `<+ ${propertyName}>`,
                {
                    propertyName: `${propertyName}`,
                    // conceptName: FreLanguage.getInstance().classifierProperty(element.freLanguageConcept(), propertyName).type
                },
            ),
        );
    }

    private static makeRefItems(
        element: FreNode,
        properties: FreNodeReference<FreNamedNode>[],
        propertyName: string,
        scoper: FreScoper,
        listJoin?: FreListInfo,
    ): Box[] {
        const result: Box[] = [];
        const numberOfItems = properties.length;
        properties.forEach((listElem, index) => {
            const roleName: string = RoleProvider.property(
                element.freLanguageConcept(),
                propertyName,
                "list-item",
                index,
            );
            const setFunc = (selected: string) => {
                listElem.name = selected;
                return BehaviorExecutionResult.EXECUTED;
            };
            const innerBox: Box = BoxUtil.referenceBox(element, propertyName, setFunc, scoper, index);
            if (listJoin !== null && listJoin !== undefined) {
                if (listJoin.type === UtilCommon.separatorName) {
                    if (index < numberOfItems - 1) {
                        result.push(
                            BoxFactory.horizontalList(element, roleName, propertyName, [
                                innerBox,
                                BoxFactory.label(element, roleName + "list-item-label", listJoin.text),
                            ]),
                        );
                    } else {
                        result.push(innerBox);
                    }
                } else if (listJoin.type === UtilCommon.terminatorName) {
                    result.push(
                        BoxFactory.horizontalList(element, roleName, propertyName, [
                            innerBox,
                            BoxFactory.label(element, roleName + "list-item-label", listJoin.text),
                        ]),
                    );
                } else if (listJoin.type === UtilCommon.initiatorName) {
                    // TODO test this code
                    result.push(
                        BoxFactory.horizontalList(element, roleName, propertyName, [
                            BoxFactory.label(element, roleName + "list-item-label", listJoin.text),
                            innerBox,
                        ]),
                    );
                }
            } else {
                result.push(innerBox);
            }
        });
        return result;
    }
}
