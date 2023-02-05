import { ReferenceShortcut } from "../editor";
import { FreNode, FreModel, FreModelUnit } from "../ast";
import { isNullOrUndefined } from "../util";
import { FreLogger } from "../logging";
const LOGGER = new FreLogger("Language");

export type PropertyKind = "primitive" | "part" | "reference";

export type PrimType = string | boolean | number;

export type Property = {
    name: string;
    type: string;
    isList: boolean;
    isPublic: boolean;
    propertyKind: PropertyKind;
};
export type Model = {
    typeName: string;
    isNamespace?: boolean;
    isNamedElement?: boolean;
    subConceptNames?: string[];
    properties: Map<string, Property>;
    constructor: () => FreModel;
};
export type ModelUnit = {
    typeName: string;
    // isPublic?: boolean;
    isNamespace?: boolean;
    isNamedElement?: boolean;
    subConceptNames?: string[];
    fileExtension: string;
    properties: Map<string, Property>;
    constructor: () => FreModelUnit;
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
    constructor: () => FreNode;
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

export class FreLanguage {
    private static theInstance: FreLanguage;

    static getInstance() {
        if (FreLanguage.theInstance === undefined) {
            FreLanguage.theInstance = new FreLanguage();
        }
        return FreLanguage.theInstance;
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

    unit(typeName: string): ModelUnit | undefined {
        return this.units.get(typeName);
    }

    concept(typeName: string): Concept | undefined {
        // console.log("Language find concept " + typeName);
        return this.concepts.get(typeName);
    }

    interface(typeName: string): Interface | undefined {
        return this.interfaces.get(typeName);
    }

    classifier(typeName: string): Classifier | undefined {
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
        // console.log("RETURNING NULL FOR " + typeName)
        return undefined;
    }

    conceptProperty(typeName: string, propertyName: string): Property | undefined {
        // LOGGER.log("copnceptProperty [" + typeName + "."  + propertyName + "]");
        return this.concepts.get(typeName)?.properties.get(propertyName);
    }

    unitProperty(typeName: string, propertyName: string): Property | undefined {
        return this.units.get(typeName)?.properties.get(propertyName);
    }

    interfaceProperty(typeName: string, propertyName: string): Property | undefined {
        return this.interfaces.get(typeName)?.properties.get(propertyName);
    }

    classifierProperty(typeName: string, propertyName: string): Property | undefined {
        // LOGGER.log("CLASSIFIERPROPERTY " + typeName + "." + propertyName);
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
        return undefined;
    }

    allConceptProperties(typeName: string): IterableIterator<Property> | undefined {
        // console.log("Looking up properties for "+ typeName);
        let myType: Concept | ModelUnit | undefined = this.concept(typeName);
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
        let classifier: Classifier | undefined = FreLanguage.getInstance().classifier(typename);
        const foundProperties: Property[] = [];
        if (!!classifier) {
            for (const prop of classifier.properties.values()) {
                if (prop.propertyKind === ptype) {
                    foundProperties.push(prop);
                }
            }
        }
        return foundProperties;
    }

    /**
     * Return the value of `prop' in `element'.
     * For ease of use, always returns a list, even is the property is not a list.
     * @param element
     * @param prop
     */
    public getPropertyValue(element: FreNode, prop: Property): FreNode[] {
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

    /**
     * Return all named concept in the language.
     */
    public getNamedConcepts(): string[] {
        return Array.from(this.concepts.values()).filter( concept => concept.isNamedElement).map(concept => concept.typeName);
    }

    /**
     * Return all named interfaces in the language.
     */
    public getNamedInterfaces(): string[] {
        return Array.from(this.interfaces.values()).filter( intfc => intfc.isNamedElement).map(intfc => intfc.typeName);
    }

    /**
     * Return all named concepts and interfaces in the language.
     */
    public getNamedElements(): string[] {
        return this.getNamedConcepts().concat(this.getNamedInterfaces());
    }

    /**
     * Return the names of all model unit types.
     */
    public getUnitNames(): string[] {
        return Array.from(this.units.values()).map(unit => unit.typeName);
    }

    createModel(): FreModel {
        return this.pmodel?.constructor();
    }

    createUnit(typeName: string): FreModelUnit | undefined {
        return this.units.get(typeName)?.constructor();
    }

    /**
     * Create a new instance of the class `typeName`.
     * @param typeName
     */
    createConceptOrUnit(typeName: string): FreNode | undefined {
        let myType: Concept | ModelUnit | undefined = this.concept(typeName);
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
     * @param name
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

    /**
     * Returns true if the freLanguageConcept of 'element', i.e. its metatype,
     * is the same as 'requestedType' or is a subtype of 'requestedType'.
     * @param element
     * @param requestedType
     */
    public metaConformsToType(element: FreNode, requestedType: string): boolean {
        const metatype = element.freLanguageConcept();
        if (metatype === requestedType || FreLanguage.getInstance().subConcepts(requestedType).includes(metatype)) {
            return true;
        }
        return false;
    }
}
