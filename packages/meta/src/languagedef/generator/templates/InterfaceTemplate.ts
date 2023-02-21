import {
    FreConceptProperty,
    FrePrimitiveProperty,
    FreInterface
} from "../../metalanguage";
import { Names, FREON_CORE, GenerationUtil } from "../../../utils";

export class InterfaceTemplate {

    generateInterface(intf: FreInterface, relativePath: string): string {
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
            import { ${Names.FreNode} ${hasReferences ? `, ${Names.FreNodeReference}` : ""} } from "${FREON_CORE}";
            import { ${imports.join(", ")} } from "./internal";

            /**
             * Interface ${myName} is the implementation of the interface with the same name in the language definition file.
             */              
            export ${abstract} interface ${myName} 
                extends ${extendsInterfaces.length > 0 ? `${extendsInterfaces.map(int => `${int}`).join(", ")}` : `${Names.FreNode}`} 
            {               
                ${intf.primProperties.map(p => this.generatePrimitiveProperty(p)).join("\n")}
                ${intf.parts().map(p => this.generatePartProperty(p)).join("\n")}
                ${intf.references().map(p => this.generateReferenceProperty(p)).join("\n")}         
                
                copy(): ${myName};                
            }`;
    }

    generatePrimitiveProperty(property: FrePrimitiveProperty): string {
        const comment = "// implementation of " + property.name ;
        return `${property.name}: ${GenerationUtil.getBaseTypeAsString(property)} ${property.isList ? "[]" : ""}; ${comment}`;
    }

    generatePartProperty(property: FreConceptProperty): string {
        const comment = "// implementation of " + property.name;
        const arrayType = property.isList ? "[]" : "";
        return `${property.name} : ${Names.classifier(property.type)}${arrayType}; ${comment}`;
    }

    generateReferenceProperty(property: FreConceptProperty): string {
        const comment = "// implementation of " + property.name;
        const arrayType = property.isList ? "[]" : "";
        return `${property.name} : ${Names.FreNodeReference}<${Names.classifier(property.type)}>${arrayType}; ${comment}`;
    }
}
