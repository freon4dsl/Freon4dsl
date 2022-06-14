import { PiConcept, PiInterface, PiLanguage, PiLimitedConcept, PiProperty } from "../../languagedef/metalanguage";
import { ListUtil } from "../../utils";

export class DiagramTemplate {
    withHtml: boolean;

    constructor(html: boolean) {
        this.withHtml = html;
    }

    public makeOverview(language: PiLanguage): string {
        return `%%{init: {'theme': 'forest'} }%%
    classDiagram
    direction TD
    %% other possibilites: LR RL DT TB (same as TD)
${this.makeUmlClasses(language.concepts)}
${this.makeUmlInterfaces(language.interfaces)}
    ${this.makeUmlRelationships(language.concepts)}`;
    }

    public makeOverviewPerFile(language: PiLanguage, filename: string): string {
        const conceptsToInclude: PiConcept[] = [];
        language.concepts.forEach(c => {
            if (c.location?.filename === filename || c.agl_location?.filename === filename) {
                ListUtil.addIfNotPresent(conceptsToInclude, c);
            }
        });
        const interfacesToInclude: PiInterface[] = [];
        language.interfaces.forEach(c => {
            if (c.location?.filename === filename || c.agl_location?.filename === filename) {
                ListUtil.addIfNotPresent(interfacesToInclude, c);
            }
        });
        // TODO if there are no mermaid classes or relationships, a mermaid syntax error is given

        return `%%{init: {'theme': 'forest'} }%%
    classDiagram
    direction TD
    %% other possibilites: LR RL DT TB (same as TD)
${this.makeUmlClasses(conceptsToInclude)}
${this.makeUmlInterfaces(interfacesToInclude)}
    ${this.makeUmlRelationships(conceptsToInclude)}`;
    }

    public makeInheritanceTrees(language: PiLanguage): string {
        const conceptsToInclude: PiConcept[] = [];
        language.concepts.forEach(c => {
            if (!!c.base) {
                ListUtil.addIfNotPresent(conceptsToInclude, c);
                ListUtil.addIfNotPresent(conceptsToInclude, c.base.referred);
            }
        });

        // template starts here
        return `%%{init: {'theme': 'forest'} }%%
    classDiagram
    direction TD
    %% other possibilites: LR RL DT TB (same as TD)
${this.makeUmlClasses(conceptsToInclude)}
    ${conceptsToInclude.map(c => this.supersToUml(c)).join("")}`;
    }

    private makeUmlClasses(conceptsToInclude: PiConcept[]): string {
        return `${conceptsToInclude.map(c => this.conceptToUml(c)).join("\n")}`;
    }

    private conceptToUml(concept: PiConcept): string {
        if (concept instanceof PiLimitedConcept) {
            return `    class ${concept.name}${this.withHtml ? ":::enumeration" : ""} {
        ${!this.withHtml ? "<<enumeration>>" : ""}
        ${concept.allInstances().map(p => p.name).join("\n\t\t")}
    }`;
        } else {
            // only prim properties are shown as UML attributes
            return `    class ${concept.name}${concept.isAbstract && this.withHtml ? ":::abstract" : ""} {
        ${concept.isAbstract && !this.withHtml ? "<<abstract>>" : ""}
        ${concept.primProperties.map(p => this.primPropToUml(p)).join("\n\t\t")}
    }`;
        }
    }

    private primPropToUml(prop: PiProperty): string {
        if (prop.isPrimitive) {
            return `${prop.isPublic ? "+" : "-"} ${prop.type.name} ${prop.name}`;
        }
        return "";
    }

    private makeUmlRelationships(concepts: PiConcept[]): string {
        return `${concepts.map(c => this.supersToUml(c)).join("")}
        ${concepts.map(c => this.partsToUml(c)).join("")}
        ${concepts.map(c => this.referencesToUml(c)).join("")}
        ${concepts.map(c => this.implementsToUml(c)).join("")}`;
    }

    private supersToUml(concept: PiConcept): string {
        if (!!concept.base) {
            return `${concept.base.name} <|-- ${concept.name}\n`;
        }
        return "";
    }

    private partsToUml(concept: PiConcept): string {
        return `${concept.parts().map(p => `${concept.name} *-- ${p.isList ? "\"0..*\"" : "\"1\""} ${p.type.name} : ${p.name}\n`).join("\n\t\t")}`;
    }

    private referencesToUml(concept: PiConcept): string {
        return `${concept.references().map(p => `${concept.name} --> ${p.isList ? "\"0..*\"" : "\"1\""} ${p.type.name} : ${p.name}\n`).join("\n\t\t")}`;
    }

    private makeUmlInterfaces(interfaces: PiInterface[]) {
        return `${interfaces.map(c => this.interfaceToUml(c)).join("\n")}`;
    }

    private interfaceToUml(piInterface: PiInterface) {
        return `    class ${piInterface.name}${this.withHtml ? ":::interface" : ""} {
        ${!this.withHtml ? "<<interface>>" : ""}
        ${piInterface.primProperties.map(p => this.primPropToUml(p)).join("\n\t\t")}
    }`;
    }

    private implementsToUml(concept: PiConcept) {
        return `${concept.interfaces.map(p => `${concept.name} ..|> ${p.name}\n`).join("\n\t\t")}`;
    }
}
