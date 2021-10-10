import { Names, PROJECTITCORE, ENVIRONMENT_GEN_FOLDER, EDITORSTYLES } from "../../../utils";
import { PiLanguage } from "../../../languagedef/metalanguage";
import { PiEditUnit } from "../../metalanguage";

export class SelectionHelpers {

    // TODO improved generated class comment
    generateEnumProjection(language: PiLanguage, editorDef: PiEditUnit, relativePath: string): string {
        // console.log("EnumSelectGenerator language "+language.name + " #enums " + language.enumerations.length);
        // console.log("EnumSelectGenerator language " + language.enumerations[0].name);
        return `
        import { ${Names.PiElement}, Box, BoxFactory, SelectBox, SelectOption, BehaviorExecutionResult, PiEditor, styleToCSS } from "${PROJECTITCORE}";
        import { ${Names.environment(language)} } from "${relativePath}${ENVIRONMENT_GEN_FOLDER}/${Names.environment(language)}";

        /**
         * Class ${Names.selectionHelpers(language)} implements ... TODO
         * language ${language.name}.
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
            setAction: (o: SelectOption) => Promise<BehaviorExecutionResult>
        ): Box {
            return BoxFactory.select(
                element,
                role,
                placeholder,
                () => {
                    return ${Names.environment(language)}.getInstance().scoper.getVisibleNames(element, metaType)
                        .filter(name => !!name && name !== "")
                        .map(name => ({
                            id: name,
                            label: name
                        }));
                },
                () => getAction(),
                (editor: PiEditor, option: SelectOption) => setAction(option)
            );
        }
        `;
    }
}
