import { FreMetaConceptProperty, FreMetaPrimitiveProperty, FreMetaInterface } from "../../metalanguage/index.js";
import { Names, Imports } from "../../../utils/on-lang/index.js"
import { GenerationUtil } from '../../../utils/on-lang/GenerationUtil.js';

export class InterfaceTemplate {
    generateInterface(intf: FreMetaInterface): string {
        // const language = intf.language;
        // const hasSuper = intf.base.length > 0;
        const extendsInterfaces: string[] = Array.from(
            new Set(intf.base.map((elem) => Names.interface(elem.referred))),
        );
        // const hasName = intf.primProperties.some(p => p.name === "name");
        const hasReferences = intf.references().length > 0;

        const abstract = "";
        const myName = Names.interface(intf);

        const imports = new Imports()
        imports.core.add(Names.FreNode)
        if (hasReferences) imports.core.add(Names.FreNodeReference)
        imports.language = new Set(
                intf.properties
                    .map((p) => Names.classifier(p.type))
                    .concat(intf.base.map((elem) => Names.interface(elem.referred)))
                    .filter((name) => !(name === myName))
                    .filter((r) => r !== null && r.length > 0),
            )
        // Template starts here
        return `
            // TEMPLATE: InterfaceTemplate.generateInterface
            ${imports.makeImports(intf.language)}
            
            /**
             * Interface ${myName} is the implementation of the interface with the same name in the language definition file.
             */
            export ${abstract} interface ${myName}
                extends ${extendsInterfaces.length > 0 ? `${extendsInterfaces.map((int) => `${int}`).join(", ")}` : `${Names.FreNode}`}
            {
                ${intf.primProperties.map((p) => this.generatePrimitiveProperty(p)).join("\n")}
                ${intf
                    .parts()
                    .map((p) => this.generatePartProperty(p))
                    .join("\n")}
                ${intf
                    .references()
                    .map((p) => this.generateReferenceProperty(p))
                    .join("\n")}

                copy(): ${myName};
            }`;
    }

    generatePrimitiveProperty(property: FreMetaPrimitiveProperty): string {
        const comment = "// implementation of " + property.name;
        const optionalType: string = !property.isList && property.isOptional ? " | undefined" : ""
        return `${property.name}: ${GenerationUtil.getBaseTypeAsString(property)} ${property.isList ? "[]" : ""}${optionalType}; ${comment}`;
    }

    generatePartProperty(property: FreMetaConceptProperty): string {
        const comment = "// implementation of " + property.name;
        const arrayType = property.isList ? "[]" : "";
        const optionalType: string = !property.isList && property.isOptional ? " | undefined" : ""
        return `${property.name}: ${Names.classifier(property.type)}${arrayType}${optionalType}; ${comment}`;
    }

    generateReferenceProperty(property: FreMetaConceptProperty): string {
        const comment = "// implementation of " + property.name;
        const arrayType = property.isList ? "[]" : "";
        const optionalType: string = !property.isList && property.isOptional ? " | undefined" : ""
        return `${property.name}: ${Names.FreNodeReference}<${Names.classifier(property.type)}>${arrayType}${optionalType}; ${comment}`;
    }
}
