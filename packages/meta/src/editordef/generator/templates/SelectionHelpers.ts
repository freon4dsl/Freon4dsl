import { Names, PathProvider, PROJECTITCORE, ENVIRONMENT_GEN_FOLDER, LANGUAGE_GEN_FOLDER, EDITORSTYLES } from "../../../utils";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";

export class SelectionHelpers {

    generateEnumProjection(language: PiLanguageUnit, relativePath: string): string {
        // console.log("EnumSelectGenerator language "+language.name + " #enums " + language.enumerations.length);
        // console.log("EnumSelectGenerator language " + language.enumerations[0].name);
        return `
        import { ${Names.PiElement}, SelectBox, SelectOption } from "${PROJECTITCORE}";
        import { ${Names.styles(language)} } from "${relativePath}${EDITORSTYLES}";
        import { ${Names.environment(language)} } from "${relativePath}${ENVIRONMENT_GEN_FOLDER}/${Names.environment(language)}";

        import { ${language.enumerations.map(en =>
            ` ${Names.enumeration(en)}`).join(", ") } } from "${relativePath}${LANGUAGE_GEN_FOLDER }";

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
                    { style: ${Names.styles(language)}.function }
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
            element: ${Names.PiElement},
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
