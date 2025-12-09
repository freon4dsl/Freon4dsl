import type {
    FreMetaClassifier,
    FreMetaConcept,
    FreMetaInterface,
    FreMetaLanguage,
    FreMetaProperty, FreMetaUnitDescription
} from "../../languagedef/metalanguage/index.js";
import {
    FreMetaLimitedConcept
} from "../../languagedef/metalanguage/index.js";
import { ListUtil } from "../../utils/no-dependencies/index.js";

export class DiagramTemplate {
    withHtml: boolean;

    constructor(html: boolean) {
        this.withHtml = html;
    }

    public makeOverview(language: FreMetaLanguage): string {
        return `%%{init: {'theme': 'forest'} }%%
    classDiagram
    direction TD
    %% other possibilites: LR RL DT TB (same as TD)
${this.makeUmlClasses(language.concepts)}
${this.makeUmlUnits(language.units )}
${this.makeUmlInterfaces(language.interfaces)}
    ${this.makeUnitRelationships(language.units)}
    ${this.makeUmlRelationships(language.concepts)}`;
    }

    public makeOverviewPerFile(language: FreMetaLanguage, filename: string): string {
        const conceptsToInclude: FreMetaConcept[] = [];
        language.concepts.forEach((c) => {
            if (c.location?.filename === filename || c.aglParseLocation?.filename === filename) {
                ListUtil.addIfNotPresent(conceptsToInclude, c);
            }
        });
        const interfacesToInclude: FreMetaInterface[] = [];
        language.interfaces.forEach((c) => {
            if (c.location?.filename === filename || c.aglParseLocation?.filename === filename) {
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

    public makeInheritanceTrees(language: FreMetaLanguage): string {
        const conceptsToInclude: FreMetaConcept[] = [];
        language.concepts.forEach((c) => {
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
    ${conceptsToInclude.map((c) => this.supersToUml(c)).join("")}`;
    }

    private makeUmlClasses(conceptsToInclude: FreMetaConcept[]): string {
        return `${conceptsToInclude.map((c) => this.conceptToUml(c)).join("\n")}`;
    }

    private makeUmlUnits(unitsToInclude: FreMetaUnitDescription[]): string {
        return `${unitsToInclude.map((c) => this.unitToUml(c)).join("\n")}`;
    }

    private conceptToUml(concept: FreMetaConcept): string {
        if (concept instanceof FreMetaLimitedConcept) {
            return `    class ${concept.name}${this.withHtml ? ":::enumeration" : ""} {
        ${!this.withHtml ? "<<enumeration>>" : ""}
        ${concept
                .allInstances()
                .map((p) => p.name)
                .join("\n\t\t")}
    }`;
        } else {
            // only prim properties are shown as UML attributes
            return `    class ${concept.name}${concept.isAbstract && this.withHtml ? ":::abstract" : ""} {
        ${concept.isAbstract && !this.withHtml ? "<<abstract>>" : ""}
        ${concept.primProperties.map((p) => this.primPropToUml(p)).join("\n\t\t")}
    }`;
        }
    }

    private unitToUml(unit: FreMetaUnitDescription): string {
            // only prim properties are shown as UML attributes
            return `    class ${unit.name} {
        ${!this.withHtml ? "<<modelunit>>" : ""}
        ${unit.primProperties.map((p) => this.primPropToUml(p)).join("\n\t\t")}
    }`;
    }

    private primPropToUml(prop: FreMetaProperty): string {
        if (prop.isPrimitive) {
            return `${prop.isPublic ? "+" : "-"} ${prop.type.name} ${prop.name}`;
        }
        return "";
    }

    private makeUmlRelationships(concepts: FreMetaConcept[]): string {
        return `${concepts.map((c) => this.supersToUml(c)).join("")}
        ${concepts.map((c) => this.partsToUml(c)).join("")}
        ${concepts.map((c) => this.referencesToUml(c)).join("")}
        ${concepts.map((c) => this.implementsToUml(c)).join("")}`;
    }

    private makeUnitRelationships(units: FreMetaUnitDescription[]): string {
        return `${units.map((c) => this.partsToUml(c)).join("")}
        ${units.map((c) => this.referencesToUml(c)).join("")}`;
    }

    private supersToUml(concept: FreMetaConcept): string {
        if (!!concept.base) {
            return `${concept.base.name} <|-- ${concept.name}\n`;
        }
        return "";
    }

    private partsToUml(concept: FreMetaClassifier): string {
        return `${concept
            .parts()
            .map((p) => `${concept.name} *-- ${p.isList ? '"0..*"' : '"1"'} ${p.type.name} : ${p.name}\n`)
            .join("\n\t\t")}`;
    }

    private referencesToUml(concept: FreMetaClassifier): string {
        return `${concept
            .references()
            .map((p) => `${concept.name} --> ${p.isList ? '"0..*"' : '"1"'} ${p.type.name} : ${p.name}\n`)
            .join("\n\t\t")}`;
    }

    private makeUmlInterfaces(interfaces: FreMetaInterface[]) {
        return `${interfaces.map((c) => this.interfaceToUml(c)).join("\n")}`;
    }

    private interfaceToUml(freInterface: FreMetaInterface) {
        return `    class ${freInterface.name}${this.withHtml ? ":::interface" : ""} {
        ${!this.withHtml ? "<<interface>>" : ""}
        ${freInterface.primProperties.map((p) => this.primPropToUml(p)).join("\n\t\t")}
    }`;
    }

    private implementsToUml(concept: FreMetaConcept) {
        return `${concept.interfaces.map((p) => `${concept.name} ..|> ${p.name}\n`).join("\n\t\t")}`;
    }
}
