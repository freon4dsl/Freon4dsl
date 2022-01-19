import { PiClassifier, PiConcept, PiLanguage, PiLimitedConcept, PiProperty } from "../../../languagedef/metalanguage";
import { Names, PROJECTITCORE } from "../../../utils";
import { PiEditUnit } from "../../metalanguage";

export class EditorDefTemplate {

    generateEditorDef(language: PiLanguage, editorDef: PiEditUnit): string {
        const defaultProjGroup = editorDef.getDefaultProjectiongroup();

        let conceptsWithTrigger: ConceptTriggerElement[] = [];
        let conceptsWithRefShortcut: ConceptShortCutElement[] = [];
        let imports: string[] = [];

        language.concepts.filter(c => !(c instanceof PiLimitedConcept || c.isAbstract)).forEach(concept => {
            // TODO handle other sub types of PiClassifier
            if (concept instanceof PiConcept) {
                // find the triggers for all concepts
                // every concept should have one - added by EditorDefaultsGenerator
                // console.log("searching trigger for: " + concept.name);
                const trigger = defaultProjGroup.findExtrasForType(concept).trigger;
                if (!!trigger && trigger.length > 0) {
                    conceptsWithTrigger.push(new ConceptTriggerElement(concept, trigger));
                }

                // find concepts with reference shortcuts
                const referenceShortCut = defaultProjGroup.findExtrasForType(concept).referenceShortCut?.referred;
                if (!!referenceShortCut) {
                    conceptsWithRefShortcut.push(new ConceptShortCutElement(concept, referenceShortCut));
                }

                imports.push(Names.concept(concept));
            }
        });

        return `import { Language, Model, ModelUnit, Property, Concept, Interface } from "${PROJECTITCORE}";
        
            import { ${imports.join(", ")} } from "../../language/gen";
    
            /**
             * Adds trigger and reference shortcut info to the in-memory representation of structure of the language metamodel.
             */
             export function initializeEditorDef() {
                 ${conceptsWithTrigger.map( element =>
                `Language.getInstance().concept("${Names.concept(element.concept)}").trigger = "${element.trigger}";`
            ).join("\n")}
                 ${conceptsWithRefShortcut.map( element =>
                `Language.getInstance().concept("${Names.concept(element.concept)}").referenceShortcut = 
                    {
                        propertyname: "${element.property.name}",
                        metatype: "${element.property.type.name}"
                    }
                ;`
            ).join("\n")}
            }`
    }
}

/** private class to store some info */
class ConceptTriggerElement {
    concept: PiConcept;
    trigger: string;

    constructor(concept: PiConcept, trigger: string) {
        this.concept = concept;
        this.trigger = trigger;
    }
}

/** private class to store some info */
class ConceptShortCutElement {
    concept: PiConcept;
    property: PiProperty;

    constructor(concept: PiConcept, property: PiProperty) {
        this.concept = concept;
        this.property = property;
    }
}
