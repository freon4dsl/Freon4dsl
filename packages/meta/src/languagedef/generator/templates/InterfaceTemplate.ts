import { Names } from "../../../utils/Names";
import {
    PiConceptProperty,
    PiPrimitiveProperty,
    PiExpressionConcept,
    PiInterface
} from "../../metalanguage/PiLanguage";
import { PROJECTITCORE } from "../../../utils";

export class InterfaceTemplate {
    constructor() {
    }

    generateInterface(intf: PiInterface, relativePath: string): string {
        const language = intf.language;
        const hasSuper = intf.base.length > 0;
        const extendsInterfaces: string[] = Array.from (
            new Set (intf.base.map ( elem => Names.interface(elem.referred) )));
        const hasName = intf.primProperties.some(p => p.name === "name");
        const abstract = '';

        const imports = Array.from(
            new Set(
                intf.properties.map(p => Names.classifier(p.type.referred))
                    .filter(name => !(name === intf.name))
                    .concat(intf.base.map ( elem => Names.interface(elem.referred) ))
                    .filter(r => r !== null)
            )
        );

        // Template starts here
        const result = `
            import { ${Names.PiElementReference} } from "./${Names.PiElementReference}";
            import { ${Names.PiElement} } from "${PROJECTITCORE}";
            ${imports.map(imp => `import { ${imp} } from "./${imp}";`).join("")}

            /**
             * Interface ${Names.interface(intf)} is the implementation of the interface with the same name in the language definition file.
             */              
            export ${abstract} interface ${Names.interface(intf)} 
                extends ${extendsInterfaces.length>0? `${extendsInterfaces.map(int => `${int}`).join(", ")}`: `${Names.PiElement}`} 
            {               
                ${intf.primProperties.map(p => this.generatePrimitiveProperty(p)).join("")}
                ${intf.parts().map(p => this.generatePartProperty(p)).join("")}
                ${intf.references().map(p => this.generateReferenceProperty(p)).join("")}                         
            }`;
        return result;
    }

    generatePrimitiveProperty(property: PiPrimitiveProperty): string {
        const comment = "// implementation of " + property.name;
        return `${property.name}: ${property.primType} ${property.isList ? "[]" : ""}; ${comment}`;
    }

    generatePartProperty(property: PiConceptProperty): string {
        const comment = "// implementation of " + property.name;
        const arrayType = property.isList ? "[]" : "";
        return `${property.name} : ${Names.classifier(property.type.referred)}${arrayType}; ${comment}`;
    }

    generateReferenceProperty(property: PiConceptProperty): string {
        const comment = "// implementation of " + property.name;
        const arrayType = property.isList ? "[]" : "";
        return `${property.name} : PiElementReference<${Names.classifier(property.type.referred)}>${arrayType}; ${comment}`;
    }
}
