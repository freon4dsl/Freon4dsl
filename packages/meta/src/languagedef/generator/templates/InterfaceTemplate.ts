import {
    PiConceptProperty,
    PiPrimitiveProperty,
    PiInterface
} from "../../metalanguage";
import { Names, PROJECTITCORE, getBaseTypeAsString } from "../../../utils";

export class InterfaceTemplate {

    generateInterface(intf: PiInterface, relativePath: string): string {
        // const language = intf.language;
        // const hasSuper = intf.base.length > 0;
        const extendsInterfaces: string[] = Array.from (
            new Set (intf.base.map ( elem => Names.interface(elem.referred) )));
        // const hasName = intf.primProperties.some(p => p.name === "name");
        const hasReferences = intf.references().length > 0;

        const abstract = "";
        const myName = Names.interface(intf);

        const imports = Array.from(
            new Set(
                intf.properties.map(p => Names.classifier(p.type))
                    .concat(intf.base.map ( elem => Names.interface(elem.referred) ))
                    .filter(name => !(name === myName))
                    .filter(r => r !== null && (r.length > 0))
            )
        );

        // Template starts here
        return `
            ${hasReferences ? `import { ${Names.PiElementReference} } from "./${Names.PiElementReference}";` : ``}
            import { ${Names.PiElement} } from "${PROJECTITCORE}";
            import { ${imports.join(", ")} } from "./internal";

            /**
             * Interface ${myName} is the implementation of the interface with the same name in the language definition file.
             */              
            export ${abstract} interface ${myName} 
                extends ${extendsInterfaces.length > 0 ? `${extendsInterfaces.map(int => `${int}`).join(", ")}` : `${Names.PiElement}`} 
            {               
                ${intf.primProperties.map(p => this.generatePrimitiveProperty(p)).join("\n")}
                ${intf.parts().map(p => this.generatePartProperty(p)).join("\n")}
                ${intf.references().map(p => this.generateReferenceProperty(p)).join("\n")}                         
            }`;
    }

    generatePrimitiveProperty(property: PiPrimitiveProperty): string {
        const comment = "// implementation of " + property.name ;
        return `${property.name}: ${getBaseTypeAsString(property)} ${property.isList ? "[]" : ""}; ${comment}`;
    }

    generatePartProperty(property: PiConceptProperty): string {
        const comment = "// implementation of " + property.name;
        const arrayType = property.isList ? "[]" : "";
        return `${property.name} : ${Names.classifier(property.type)}${arrayType}; ${comment}`;
    }

    generateReferenceProperty(property: PiConceptProperty): string {
        const comment = "// implementation of " + property.name;
        const arrayType = property.isList ? "[]" : "";
        return `${property.name} : PiElementReference<${Names.classifier(property.type)}>${arrayType}; ${comment}`;
    }
}
