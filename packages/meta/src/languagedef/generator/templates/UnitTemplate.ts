import { Names } from "../../../utils";
import { ConceptUtils } from "./ConceptUtils";
import { FreUnitDescription } from "../../metalanguage/FreLanguage";
import { ClassifierUtil } from "./ClassifierUtil";

export class UnitTemplate {
    // the following template is based on assumptions about a 'unit'
    // a unit has a name property
    // a unit has no base
    // a unit has no implemented interfaces
    // a unit is not an expression
    // a unit is not abstract
    public generateUnit(unitDescription: FreUnitDescription) {
        const language = unitDescription.language;
        const myName = Names.classifier(unitDescription);
        const needsObservable = unitDescription.primProperties.length > 0;
        const extendsClass = "MobxModelElementImpl";
        const hasReferences = unitDescription.references().length > 0;
        const modelImports = this.findModelImports(unitDescription, myName);
        const coreImports = ClassifierUtil.findMobxImports(unitDescription)
            .concat([Names.FreModelUnit, Names.FreUtils, Names.FreParseLocation, "matchElementList", "matchPrimitiveList, matchReferenceList"])
            .concat(hasReferences ? (Names.PiElementReference) : null);
        const metaType = Names.metaType(language);

        // Template starts here
        return `
            ${ConceptUtils.makeImportStatements(needsObservable, coreImports, modelImports)}
            
            /**
             * Class ${myName} is the implementation of the model unit with the same name in the language definition file.
             * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react 
             * to changes in the state of its properties.
             */            
            export class ${myName} extends ${extendsClass} implements ${Names.PiModelUnit} {
            
                ${ConceptUtils.makeStaticCreateMethod(unitDescription, myName)}
                
                fileExtension: string;                        
                ${ConceptUtils.makeBasicProperties(metaType, myName, false)}
                ${unitDescription.primProperties.map(p => ConceptUtils.makePrimitiveProperty(p)).join("\n")}
                ${unitDescription.parts().map(p => ConceptUtils.makePartProperty(p)).join("\n")}
                ${unitDescription.references().map(p => ConceptUtils.makeReferenceProperty(p)).join("\n")}     
            
                ${ConceptUtils.makeConstructor(false, unitDescription.allProperties())}
                ${ConceptUtils.makeBasicMethods(false, metaType,false, true,false, false)} 
                ${ConceptUtils.makeCopyMethod(unitDescription, myName, false)}
                ${ConceptUtils.makeMatchMethod(false, unitDescription, myName)}               
            }
            `;
    }

    private findModelImports(unitDescription: FreUnitDescription, myName: string): string[] {
        return Array.from(
            new Set(
                unitDescription.parts().map(part => Names.classifier(part.type))
                    .concat(unitDescription.references().map(part => Names.classifier(part.type)))
                    .concat(Names.metaType(unitDescription.language))
                    .filter(name => !(name === myName))
                    .filter(r => (r !== null) && (r.length > 0))
            )
        );
    }


}
