import { Box, SelectBox, SelectOption, TextBox, PiEditor } from "../editor";
import { PiElement } from "../language";
import { BehaviorExecutionResult, PiUtils } from "./internal";
import { BoxFactory } from "../editor/boxes";
import { PiScoper } from "../scoper";
import { Language } from "../storage";

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
        initializer?: Partial<SelectBox>
    ): Box {
        let value = element[propertyName];
        const propType = Language.getInstance().classifierProperty(element.piLanguageConcept(), propertyName).type;
        return BoxFactory.select(
            element,
            `${element.piLanguageConcept()}-${propertyName}`,
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
        return null;
    }
}
