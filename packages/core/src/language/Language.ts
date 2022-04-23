import { ReferenceShortcut } from "../editor";
import { PiElement, PiModel, PiModelUnit } from "../model";
import { isNullOrUndefined, PiLogger } from "../util";
const LOGGER = new PiLogger("Language");

export type PropertyKind = "primitive" | "part" | "reference";

export type Property = {
    name: string;
    type: string;
    isList: boolean;
    isPublic: boolean;
    propertyType: PropertyKind;
};
export type Model = {
    typeName: string;
    isNamespace?: boolean;
    isNamedElement?: boolean;
    subConceptNames?: string[];
    properties: Map<string, Property>;
    constructor: () => PiModel;
};
export type ModelUnit = {
    typeName: string;
    // isPublic?: boolean;
    isNamespace?: boolean;
    isNamedElement?: boolean;
    subConceptNames?: string[];
    fileExtension: string;
    properties: Map<string, Property>;
    constructor: () => PiModelUnit;
};
export type Concept = {
    typeName: string;
    isAbstract: boolean;
    isPublic: boolean;
    isNamespace?: boolean;
    isNamedElement?: boolean;
    baseName: string;
    subConceptNames: string[];
    properties: Map<string, Property>;
    constructor: () => PiElement;
    // Used by editor, therefore only in Concept
    trigger: string;
    referenceShortcut?: ReferenceShortcut;
};

export type Interface = {
    typeName: string;
    isPublic: boolean;
    isNamespace?: boolean;
    isNamedElement?: boolean;
    subConceptNames: string[];
    properties: Map<string, Property>;
};

export type Classifier = Model | ModelUnit | Concept | Interface;

export class Language {
    private static theInstance: Language = null;

    static getInstance() {
        if (Language.theInstance === null) {
            Language.theInstance = new Language();
        }
        return Language.theInstance;
    }

    private languageName: string;
    private pmodel: Model;
    private units: Map<string, ModelUnit> = new Map<string, ModelUnit>();
    private concepts: Map<string, Concept> = new Map<string, Concept>();
    private interfaces: Map<string, Interface> = new Map<string, Interface>();

    private constructor() {
    }

    model(): Model {
        return this.pmodel;
    }

    modelOfType(typeName: string) {
        if(!!this.pmodel && (this.pmodel.typeName === typeName)) {
            return this.pmodel;
        } else {
            return null;
        }
    }

    unit(typeName: string): ModelUnit {
        return this.units.get(typeName);
    }

    concept(typeName: string): Concept {
        // console.log("Language find concept " + typeName);
        return this.concepts.get(typeName);
    }

    interface(typeName: string): Interface {
        return this.interfaces.get(typeName);
    }

    classifier(typeName: string): Classifier {
        let concept1 = this.concepts.get(typeName);
        if (!!concept1) {
            return concept1;
        } else {
            let intf = this.interfaces.get(typeName);
            if (!!intf) {
                return intf;
            } else {
                let unit1 = this.units.get(typeName);
                if (!!unit1) {
                    return unit1;
                } else {
                    let model = this.modelOfType(typeName);
                    if(!! model){
                        return model;
                    }
                }
            }
        }
        console.log("RETURNINGN NULL FOR " + typeName)
        return null;
    }

    conceptProperty(typeName: string, propertyName: string): Property {
        // LOGGER.log("copnceptProperty [" + typeName + "."  + propertyName + "]");
        return this.concepts.get(typeName).properties.get(propertyName);
    }

    unitProperty(typeName: string, propertyName: string): Property {
        return this.units.get(typeName).properties.get(propertyName);
    }

    interfaceProperty(typeName: string, propertyName: string): Property {
        return this.interfaces.get(typeName).properties.get(propertyName);
    }

    classifierProperty(typeName: string, propertyName: string): Property {
        // LOGGER.log("CLASSIFIERPROPRTY " + typeName + "." + propertyName);
        let concept1 = this.concepts.get(typeName);
        if (!!concept1) {
            return concept1.properties.get(propertyName);
        } else {
            let intf = this.interfaces.get(typeName);
            if (!!intf) {
                return intf.properties.get(propertyName);
            } else {
                let unit1 = this.units.get(typeName);
                if (!!unit1) {
                    return unit1.properties.get(propertyName);
                }  else {
                    let model = this.modelOfType(typeName);
                    if( !!model){
                        return model.properties.get(propertyName);
                    }
                }
            }
        }
        return null;
    }

    allConceptProperties(typeName: string): IterableIterator<Property> {
        // console.log("Looking up properties for "+ typeName);
        let myType: Concept | ModelUnit = this.concept(typeName);
        if (isNullOrUndefined(myType)) {
            myType = this.unit(typeName);
        }
        return myType?.properties.values();
    }

    /**
     * Get all properties of kind "kind" of classifier "typename"
     * @param typename
     * @param ptype
     */
    public getPropertiesOfKind(typename: string, ptype: PropertyKind): Property[]  {
        let classifier: Classifier = Language.getInstance().classifier(typename);
        const foundProperties: Property[] = [];
        for( const prop of classifier.properties.values()){
            if( prop.propertyType === ptype) {
                foundProperties.push(prop)
            }
        }
        return foundProperties
    }

    /**
     * Return the value of `prop' in `element'.
     * For ease of use, always returns a list, even is the property is not a list.
     * @param element
     * @param prop
     */
    public getPropertyValue(element: PiElement, prop: Property): PiElement[] {
        if( prop.isList){
            return element[prop.name];
        } else {
            const value = element[prop.name];
            if( !!value) {
                return [value];
            } else {
                return [];
            }
        }
    }
    createModel(): PiModel {
        return this.pmodel?.constructor();
    }

    createUnit(typeName: string): PiModelUnit {
        return this.units.get(typeName).constructor();
    }

    /**
     * Create a new instance of the class `typeName`.
     * @param typeName
     */
    createConceptOrUnit(typeName: string): PiElement {
        let myType: Concept | ModelUnit = this.concept(typeName);
        if (isNullOrUndefined(myType)) {
            myType = this.unit(typeName);
        }
        return myType?.constructor();
    }


    addModel(model: Model) {
        if(!!this.pmodel) {
            console.error("Language: adding model of type " + model?.typeName + " while there is already a model of type " + this.pmodel.typeName);
        }
        this.pmodel = model;
    }

    addUnit(unit: ModelUnit) {
        this.units.set(unit.typeName, unit);
        unit.subConceptNames = [];
    }

    /**
     * Add a concept definition to this language
     * @param concept
     */
    addConcept(concept: Concept) {
        this.concepts.set(concept.typeName, concept);
    }

    addInterface(intface: Interface) {
        this.interfaces.set(intface.typeName, intface);
    }

    /**
     * Set Language name
     * @param typeName
     */
    set name(name: string) {
        this.languageName = name;
    }

    get name(): string {
        return this.languageName;
    }

    subConcepts(typeName: string): string[] {
        const concept = this.concept(typeName);
        if (!!concept) {
            return concept.subConceptNames;
        }
        const intface = this.interface(typeName);
        if (!!intface) {
            return intface.subConceptNames;
        }
        return [];
    }

    referenceCreator: (name: string, type: string) => any;

    addReferenceCreator(creator: (name: string, type: string) => any) {
        this.referenceCreator = creator;
    }
}
