import { PiElement } from "../language/PiModel";

export type PropertyType = "primitive" | "enumeration" | "part" | "reference";

export type Property = {
    name: string;
    type: string;
    isList: boolean;
    propertyType: PropertyType;
}

export type Concept = {
    typeName: string;
    baseNames: string;
    properties: Map<string,Property>;
    constructor: () => PiElement;
};

export class Language {

    private static theInstance: Language = null;
    private concepts : Map<string, Concept> = new Map<string, Concept>();

    private constructor() {
    }

    static  getInstance() {
        if (Language.theInstance === null) {
            Language.theInstance = new Language();
        }
        return Language.theInstance;
    }

    concept(typeName, propertyName): Concept {
        return this.concepts.get(typeName);
    }

    conceptProperty(typeName, propertyName): Property {
        return this.concepts.get(typeName).properties.get(propertyName);
    }

    allConceptProperties(typeName: string): IterableIterator<Property> {
        // console.log("Looking up properties for "+ typeName)
        return this.concepts.get(typeName).properties.values();
    }

    createConcept(typeName: string): PiElement {
        return this.concepts.get(typeName).constructor();
    }

    addConcept(conceptName: string, concept: Concept){
        this.concepts.set(conceptName, concept);
    }

    referenceCreator: (name: string, type: string) => any;

    addReferenceCreator( creator: (name: string, type: string) => any) {
        this.referenceCreator = creator;
    }
}

