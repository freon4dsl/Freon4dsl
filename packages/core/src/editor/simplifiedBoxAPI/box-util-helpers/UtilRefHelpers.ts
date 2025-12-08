import { AST } from "../../../change-manager/index.js";
import { FreLogger } from "../../../logging/index.js";
import {
    Box,
    BoxFactory,
    RefListReplacerBox,
    HorizontalListBox,
    ReferenceBox,
    type SelectOption,
    VerticalListBox,
} from "../../boxes/index.js";
import type { FreNamedNode, FreNode, FreNodeReference } from '../../../ast/index.js';
import { qualifiedName } from '../../../ast/index.js';
import { RoleProvider } from "../RoleProvider.js";
import type { FreScoper } from "../../../scoper/index.js";
import { BehaviorExecutionResult } from "../../util/index.js";
import { BoxUtil, type FreListInfo } from "../BoxUtil.js";
import { UtilCommon } from "./UtilCommon.js";
import { FreLanguage } from "../../../language/index.js";
import { type FreEditor } from "../../FreEditor.js";
import { FreUtils, isNullOrUndefined, notNullOrUndefined } from '../../../util/index.js';

const LOGGER = new FreLogger("UtilRefHelpers")

export class UtilRefHelpers {
    public static referenceBox(
        node: FreNode,
        propertyName: string,
        setFunc: (selected: string | FreNamedNode) => void,
        scoper: FreScoper,
        index?: number,
    ): ReferenceBox {
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

        let result: ReferenceBox;
        // Note that this code is exactly the same as the code for creating a select box
        result = BoxFactory.reference(
            node,
            roleName,
            `+ ${propertyName}`,
            () => {
                return scoper
                    .getVisibleNodes(node, propType)
                    .filter((node) => notNullOrUndefined(node.name) && node.name !== "")
                    .map((node, index: number) => ({
                        id: node.name + index,
                        label: node.name,
                        additional_label: this.makeAdditionalLabel(node),
                        node: node
                    }));
            },
            () => {
                if (!!property) {
                    return { id: property.name, label: property.name, additional_label: this.makeAdditionalLabel(property) };
                } else {
                    return null;
                }
            },
            // @ts-ignore
            (editor: FreEditor, option: SelectOption): BehaviorExecutionResult => {
                LOGGER.log("referenceBox ==> SET selected option for property " + propertyName + " of " + (isNullOrUndefined(node)? "NULL" : node["name"]) + " to " + option?.label);
                if (!!option) {
                    // check whether the label denotes an ambiguous node, if so store the option.node, not the option.label
                    const currentVisibleNodes =  scoper.getVisibleNodes(node, propType).filter((node) => !!node.name && node.name !== option.label)
                    // console.log("========> set property [" + propertyName + "] of " + node["name"] + " := " + option.label);
                    AST.changeNamed(`UtilRefHelpers.referenceBox for property ${propertyName} set to ${option.label}`, () => {
                        if (currentVisibleNodes.length > 1) {
                            setFunc(option.node);
                        } else {
                            setFunc(option.label);
                        }
                    });
                } else {
                    AST.changeNamed(`UtilRefHelpers.referenceBox for property ${propertyName} set to null`, () => {
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

    private static makeAdditionalLabel(node: FreNamedNode): string {
        const additionalLabelSeparator: string = "." // todo use ref-separator from .edit file
        // remove the last of qualified name, because this is equal to the name of the node
        const names: string[] = qualifiedName(node);
        names.pop(); // Note that pop changes the array!
        if (names.length >= 1) {
            let result: string = '';
            let first: boolean = true;
            names.forEach(name => {
                if (!first) {
                    result += additionalLabelSeparator;
                }
                result += name;
                first = false;
            })
            return 'from ' + result;
        } else {
            return '';
        }
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

    public static refListReplacerBox(
        node: FreNode,
        propertyName: string,
        externalComponentName: string,
        scoper: FreScoper,
        initializer?: Partial<RefListReplacerBox>,
    ): RefListReplacerBox {
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
            const result: RefListReplacerBox = new RefListReplacerBox(
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
                `+${propertyName}`,
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
            const setFunc = (selected: string | FreNamedNode) => {
                if (typeof selected === 'string') {
                    listElem.name = selected;
                } else {
                    listElem.referred = selected;
                }
                return BehaviorExecutionResult.EXECUTED;
            };
            let innerBox = BoxUtil.referenceBox(element, propertyName, setFunc, scoper, index);
            if (listJoin !== null && listJoin !== undefined) {
                result.push(...UtilCommon.addListJoin(listJoin, index, numberOfItems, element, roleName, propertyName, innerBox));
            } else {
                result.push(innerBox);
            }
        });
        return result;
    }
}
