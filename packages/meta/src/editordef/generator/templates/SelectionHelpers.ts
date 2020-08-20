import { Names, PROJECTITCORE, ENVIRONMENT_GEN_FOLDER, EDITORSTYLES } from "../../../utils";
import { PiLanguage } from "../../../languagedef/metalanguage";
import { PiEditUnit } from "../../metalanguage";

export class SelectionHelpers {

    // TODO improved generated class comment
    generateEnumProjection(language: PiLanguage, editorDef: PiEditUnit, relativePath: string): string {
        // console.log("EnumSelectGenerator language "+language.name + " #enums " + language.enumerations.length);
        // console.log("EnumSelectGenerator language " + language.enumerations[0].name);
        return `
        import { ${Names.PiElement}, SelectBox, SelectOption } from "${PROJECTITCORE}";
        import { ${Names.styles} } from "${relativePath}${EDITORSTYLES}";
        import { ${Names.environment(language)} } from "${relativePath}${ENVIRONMENT_GEN_FOLDER}/${Names.environment(language)}";

        /**
         * Class ${Names.selectionHelpers(language)} implements ... TODO
         * language ${language.name}.
         * These are merged with the custom build additions and definition-based editor parts
         * in a three-way manner. For each modelelement,
         * (1) if a custom build creator/behavior is present, this is used,
         * (2) if a creator/behavior based on the editor definition is present, this is used,
         * (3) if neither (1) nor (2) yields a result, the default is used.
         */
        export class ${Names.selectionHelpers(language)} {
        
        ${this.generateRefs(language)}
        }`;
    }

    generateRefs(language: PiLanguage): string {
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
        `;
    }
}
