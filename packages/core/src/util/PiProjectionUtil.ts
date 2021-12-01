import {
    Box,
    PiEditor,
    PiListDirection,
    PiProjection,
    PiStyle,
    SelectBox,
    SelectOption,
    styleToCSS,
    TextBox
} from "../editor";
import { PiElement } from "../language";
import { BehaviorExecutionResult, PiUtils } from "./internal";
import { BoxFactory } from "../editor";
import { PiScoper } from "../scoper";
import { Language, PropertyType } from "../storage";

export class PiProjectionUtil {
    static textBox(element: PiElement, property: string): TextBox {
        let result: TextBox = null;
        const value = element[property];
        if (value !== undefined && value !== null && typeof value === "string") {
            result = new TextBox(element, "textbox-" + property, () => element[property], (v: string) => (element[property] = v), {
                placeHolder: `<${property}>`
            });
        } else {
            PiUtils.CHECK(false, "Property " + property + " does not exist or is not a string: " + value);
        }
        return result;
    }

    static booleanBox(
        elem: PiElement,
        role: string,
        propertyName: string,
        labels: { yes: string; no: string } = {
            yes: "yes",
            no: "no"
        }
    ): Box {
        const value = elem[propertyName];
        if (value !== undefined && value !== null && typeof value === "boolean") {
            return new SelectBox(
                elem,
                role,
                "<optional>",
                () => [{ id: labels.yes, label: labels.yes }, { id: labels.no, label: labels.no }],
                () => {
                    if (elem[propertyName]) {
                        return { id: labels.yes, label: labels.yes };
                    } else {
                        return { id: labels.no, label: labels.no };
                    }
                },
                async (editor: PiEditor, option: SelectOption): Promise<BehaviorExecutionResult> => {
                    if (option.id === labels.yes) {
                        elem[propertyName] = true;
                    } else if (option.id === labels.no) {
                        elem[propertyName] = false;
                    }
                    return BehaviorExecutionResult.NULL
                }
            );
        } else {
            PiUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a boolean: " + value);
            return null;
        }
    }

    static referenceBox(
        element: PiElement,
        propertyName: string,
        setFunc: (selected: string) => Object,
        scoper: PiScoper,
        index?: number,
        initializer?: Partial<SelectBox>
    ): Box {

        const propType = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName).type;
        let value = element[propertyName];
        let roleName: string = `${element.piLanguageConcept()}-${propertyName}`;
        // set the value and roleName for use in lists
        if (index !== null && index !== undefined && index >= 0) {
            roleName += "-" + index;
            value = value[index];
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
                if (!!value) {
                    return { id: value.name, label: value.name };
                } else {
                    return null;
                }
            },
            async (editor: PiEditor, option: SelectOption): Promise<BehaviorExecutionResult> => {
                if (!!option) {
                    value = setFunc(option.label);
                } else {
                    value = null;
                }
                return BehaviorExecutionResult.EXECUTED;
            },
            initializer
        );
    }

    static listBox(
        element: PiElement,
        propertyName: string,
        direction: PiListDirection,
        rootProjection: PiProjection,
        placeholderStyle: PiStyle,
        scoper?: PiScoper
    ): Box {
        // find the information on the property to be shown
        let property = element[propertyName];
        const propInfo = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName);
        const isList: boolean = propInfo.isList;
        const isPart: PropertyType = propInfo.propertyType;

        if (property !== undefined && propertyName !== null && isList) {
            // find the children to show in this listBox, depending on whether it is a list of parts or of references
            let children = null;
            if (isPart !== "reference") {
                children = property
                    .map(feature => {
                        const roleName: string = `${element.piLanguageConcept()}-${propertyName}-${feature.piId()}-separator`;
                        return BoxFactory.horizontalList(element, roleName, [
                            rootProjection.getBox(feature),
                            BoxFactory.label(element, roleName + "label", "")
                        ]) as Box;
                    });
            } else {
                if (!!scoper) {
                    children = property.map((ent, index) => {
                        return PiProjectionUtil.referenceBox(
                            element,
                            propertyName,
                            (selected: string) => {
                                ent.name = selected;
                                return BehaviorExecutionResult.EXECUTED;
                            },
                            scoper,
                            index
                        )}) as Box;
                } else {
                    PiUtils.CHECK(false, "Box for reference " + propertyName + " needs a scoper instance.");
                    return null;
                }
            }
            // add a placeholder where a new element can be added
            children = children.concat(
                    BoxFactory.alias(element,
                        `${element.piLanguageConcept()}-${propertyName}`,
                        `<+ ${propertyName}>`,
                        {
                            style: styleToCSS(placeholderStyle),
                            propertyName: `${propertyName}`
                        })
                );
            // determine the box to be returned based on the direction
            if (direction === PiListDirection.Vertical) {
                return BoxFactory.verticalList(
                    element,
                    `${element.piLanguageConcept()}-${propertyName}-list`,
                    children
                );
            } else {
                return BoxFactory.horizontalList(
                    element,
                    `${element.piLanguageConcept()}-${propertyName}-list`,
                    children
                );
            }
        } else {
            PiUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a list: " + property);
            return null;
        }
    }
}
