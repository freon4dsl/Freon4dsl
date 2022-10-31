import { PiBinaryExpressionConcept, PiConcept, PiLanguage, PiLimitedConcept, PiProperty } from "../../../languagedef/metalanguage";
import { CONFIGURATION_FOLDER, EDITOR_GEN_FOLDER, LANGUAGE_GEN_FOLDER, ListUtil, Names, PROJECTITCORE } from "../../../utils";
import { PiEditUnit } from "../../metalanguage";

export class EditorDefTemplate {

    generateEditorDef(language: PiLanguage, editorDef: PiEditUnit, relativePath: string): string {
        const defaultProjGroup = editorDef.getDefaultProjectiongroup();

        let conceptsWithTrigger: ConceptTriggerElement[] = [];
        let conceptsWithRefShortcut: ConceptShortCutElement[] = [];
        let languageImports: string[] = [];
        let editorImports: string[] = [];

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

                languageImports.push(Names.concept(concept));
            }
        });

        const handlerVarName: string = 'handler';
        // get all the constructors
        let constructors: string[] = [];
        language.concepts.forEach(concept => {
            if (!(concept instanceof PiLimitedConcept) && !concept.isAbstract) {
                constructors.push(`["${Names.concept(concept)}", () => {
                        return new ${Names.boxProvider(concept)}(${handlerVarName})
                    }]`);
                ListUtil.addIfNotPresent(editorImports, Names.boxProvider(concept));
            }
        });
        language.units.forEach(unit => {
            constructors.push(`["${Names.classifier(unit)}", () => {
                        return new ${Names.boxProvider(unit)}(${handlerVarName})
                    }]`);
            ListUtil.addIfNotPresent(editorImports, Names.boxProvider(unit));
        });

        const hasBinExps: boolean = language.concepts.filter(c => (c instanceof PiBinaryExpressionConcept)).length > 0;
        // todo In what order do we add the projections?  Maybe custom should be last in stead of first?

        // template starts here
        return `import { Language, FreProjectionHandler, FreBoxProvider } from "${PROJECTITCORE}";
        
            import { projectitConfiguration } from "${relativePath}${CONFIGURATION_FOLDER}/ProjectitConfiguration";
            import { ${languageImports.join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";         
            import { ${editorImports.join(", ")} } from "${relativePath}${EDITOR_GEN_FOLDER}";  
    
            /**
             * Adds all known projection groups to the root projection.
             * @param ${handlerVarName}
             */
            export function initializeProjections(${handlerVarName}: FreProjectionHandler) {
                for (const p of projectitConfiguration.customProjection) {
                    ${handlerVarName}.addCustomProjection(p);
                }     
                ${hasBinExps ? `${handlerVarName}.addProjection("${Names.brackets}");`
                : ``
                }    
                ${editorDef.getAllNonDefaultProjectiongroups().map(group => 
                `${handlerVarName}.addProjection("${Names.projection(group)}")`).join(";\n")}
                 ${handlerVarName}.initProviderConstructors(new Map<string, () => FreBoxProvider>(
                [
                    ${constructors.map(constr => constr).join(",\n")} 
                ]));
            }    
            
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
                        propertyName: "${element.property.name}",
                        conceptName: "${element.property.type.name}"
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
