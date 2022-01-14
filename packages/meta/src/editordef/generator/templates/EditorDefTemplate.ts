import { PiClassifier, PiConcept, PiLangSelfExp, PiLanguage } from "../../../languagedef/metalanguage";
import { Names, PROJECTITCORE } from "../../../utils";
import { PiEditUnit } from "../../metalanguage/index";

export class EditorDefTemplate {

    generateEditorDef(language: PiLanguage, editorDef: PiEditUnit): string {
        return `import { Language, Model, ModelUnit, Property, Concept, Interface } from "${PROJECTITCORE}";
        
            import { ${language.concepts.map(concept => `${Names.concept(concept)}`).join(", ")} } from "../../language/gen";
    
            /**
             * Creates an in-memory representation of structure of the language metamodel, used in e.g. the (de)serializer.
             */
             export function initializeEditorDef() {
                 ${editorDef.conceptEditors.filter(conceptEditor => conceptEditor.concept.referred instanceof PiConcept && conceptEditor.trigger !== null).map( concepteditor =>
                `Language.getInstance().concept("${Names.concept(concepteditor.concept.referred as PiConcept)}").trigger = "${concepteditor.trigger}";`
            ).join("\n")}
                 ${editorDef.conceptEditors.filter(conceptEditor => conceptEditor.concept.referred instanceof PiConcept && conceptEditor.referenceShortcut !== null).map( concepteditor =>
                `Language.getInstance().concept("${Names.concept(concepteditor.concept.referred as PiConcept)}").referenceShortcut = 
                       {
                                                              propertyName: "${((concepteditor.referenceShortcut) as PiLangSelfExp).appliedfeature.sourceName}",
                                                              conceptName: "${((concepteditor.referenceShortcut) as PiLangSelfExp).appliedfeature.referredElement.referred.type.name}"
                                                         }
                ;`
            ).join("\n")}
            }`
    }
}
