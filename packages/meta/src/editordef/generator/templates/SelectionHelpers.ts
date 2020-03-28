import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import { Names } from "../../../utils/Names";

export class SelectionHelpers {

    generate(language: PiLanguageUnit): string {
        // console.log("EnumSelectGenerator language "+language.name + " #enums " + language.enumerations.length);
        // console.log("EnumSelectGenerator language " + language.enumerations[0].name);
        return `
        import { PiElement, SelectBox, SelectOption } from "@projectit/core";
        import { demoStyles } from "../../styles/styles";
        import { ${Names.environment(language)} } from "../../environment/${Names.environment(language)}";

        ${language.enumerations.map(en =>
            `import { ${Names.enumeration(en)} } from "../../language/${Names.enumeration(en)}";`
        ).join("")}

        export class ${Names.selectionHelpers(language)} {
        ${language.enumerations.map(en =>
            `
            public enumSelectFor${en.name}(elem: PiElement, role: string, getAction: () => SelectOption, setAction: (o: SelectOption) => void) {
                return new SelectBox(
                    elem,
                    role,
                    "<" + "select>",
                    () => {
                        return ${Names.enumeration(en)}.values.map(v =>
                            ({
                                id: v.asString(),
                                label: v.asString()
                            }
                        ))
                    },
                    () => getAction(),
                    (option: SelectOption) => {
                        setAction(option);
                    },
                    { style: demoStyles.function }
                );
            }
        `
        ).join(" ")}
        
        ${this.generateRefs(language)}
        }`
    }

    generateRefs(language: PiLanguageUnit): string {
        return `
        public getReferenceBox(
            element: PiElement,
            role: string,
            placeholder: string,
            metaType: string,
            getAction: () => SelectOption,
            setAction: (o: SelectOption) => void
        ): SelectBox {
            return new SelectBox(
                element,
                role,
                placeholder,
                () => {
                    return ${Names.environment(language)}.getInstance().scoper.getVisibleNames(element, metaType).map(name => ({
                        id: name,
                        label: name
                    }));
                },
                () => getAction(),
                (option: SelectOption) => setAction(option)
            );
        }
        `
    }
}
