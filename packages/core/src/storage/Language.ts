import { PiElement } from "../language/PiModel";

// TODO see if other types need to be added
export type PropertyType = "primitive" | "part" | "reference";

export type Property = {
    name: string;
    type: string;
    isList: boolean;
    isPublic: boolean;
    propertyType: PropertyType;
};

export type Concept = {
    isUnit: boolean;
    isModel: boolean;
    isAbstract: boolean;
    isPublic: boolean;
    typeName: string;
    baseName: string;
    subConceptNames: string[];
    properties: Map<string, Property>;
    constructor: () => PiElement;
};

export type Interface = {
    isPublic: boolean;
    typeName: string;
    subConceptNames: string[];
    properties: Map<string, Property>;
};


export class Language {
    private static theInstance: Language = null;
    private concepts: Map<string, Concept> = new Map<string, Concept>();
    private interfaces: Map<string, Interface> = new Map<string, Interface>();
    // private enumerations: Map<string, Enumeration> = new Map<string, Enumeration>();

    private constructor() {
    }

    static getInstance() {
        if (Language.theInstance === null) {
            Language.theInstance = new Language();
        }
        return Language.theInstance;
    }

    concept(typeName): Concept {
        return this.concepts.get(typeName);
    }

    interface(typeName): Interface {
        return this.interfaces.get(typeName);
    }

    // enumeration(typeName): Enumeration {
    //     return this.enumerations.get(typeName);
    // }

    conceptProperty(typeName, propertyName): Property {
        return this.concepts.get(typeName).properties.get(propertyName);
    }

    interfaceProperty(typeName, propertyName): Property {
        return this.interfaces.get(typeName).properties.get(propertyName);
    }

    allConceptProperties(typeName: string): IterableIterator<Property> {
        // console.log("Looking up properties for "+ typeName);
        return this.concepts.get(typeName)?.properties.values();
    }

    /**
     * Create a new instance of the class `typeName`.
     * @param typeName
     */
    createConcept(typeName: string): PiElement {
        return this.concepts.get(typeName).constructor();
    }

    /**
     * Add a concept definition to this language
     * @param conceptName
     * @param concept
     */
    addConcept(concept: Concept) {
        this.concepts.set(concept.typeName, concept);
    }

    addInterface(intface: Interface) {
        this.interfaces.set(intface.typeName, intface);
    }

    // addEnumeration(enumeration: Enumeration) {
    //     this.enumerations.set(enumeration.typeName, enumeration);
    // }

    subConcepts(typeName: string): string[] {
        const concept = this.concept(typeName);
        if (!!concept) {
            return concept.subConceptNames
        }
        const intface = this.interface(typeName);
        if (!!intface) {
            return intface.subConceptNames
        }
        return [];
    }

    referenceCreator: (name: string, type: string) => any;

    addReferenceCreator(creator: (name: string, type: string) => any) {
        this.referenceCreator = creator;
    }
}
