import { ReferenceShortcut } from "../editor";
import { FreNode, FreModel, FreModelUnit } from "../ast";
import { EmptyStdLib, FreStdlib } from "../stdlib/index";
import { isNullOrUndefined } from "../util";
// import { FreLogger } from "../logging";
// const LOGGER = new FreLogger("Language");

export type PropertyKind = "primitive" | "part" | "reference";

export type PrimType = string | boolean | number;

export type FreLanguageProperty = {
    name: string;
    type: string;
    id?: string;
    key?: string; // used for LionWeb
    isList: boolean;
    isPublic: boolean;
    language: string;
    propertyKind: PropertyKind;
};
export type FreLanguageModel = {
    typeName: string;
    id?: string;
    key?: string; // used for LionWeb
    isNamespace?: boolean;
    isNamedElement?: boolean;
    isAbstract?: boolean;
    language: string;
    subConceptNames?: string[];
    properties: Map<string, FreLanguageProperty>;
    constructor: (id?: string) => FreModel;
    creator: (data: Partial<FreModel>) => FreModel;
    referenceShortcut?: ReferenceShortcut;
};
export type FreLanguageModelUnit = {
    typeName: string;
    id?: string;
    key?: string; // used for LionWeb
    // isPublic?: boolean;
    isNamespace?: boolean;
    isNamedElement?: boolean;
    isAbstract?: boolean;
    language: string;
    subConceptNames: string[];
    fileExtension: string;
    properties: Map<string, FreLanguageProperty>;
    constructor: (id?: string) => FreModelUnit;
    creator: (data: Partial<FreModelUnit>) => FreModelUnit;
    trigger: string;
    referenceShortcut?: ReferenceShortcut;
};
export type FreLanguageConcept = {
    typeName: string;
    id?: string;
    key?: string; // used for LionWeb
    isAbstract: boolean;
    isPublic: boolean;
    isLimited: boolean;
    instanceNames: string[];
    isNamespace?: boolean;
    isNamedElement?: boolean;
    language: string;
    baseName: string;
    subConceptNames: string[];
    properties: Map<string, FreLanguageProperty>;
    constructor: (id?: string) => FreNode;
    creator: (data: Partial<FreNode>) => FreNode;
    // Used by editor, therefore only in Concept
    trigger: string;
    referenceShortcut?: ReferenceShortcut;
};

export type FreLanguageInterface = {
    typeName: string;
    id?: string;
    key?: string; // used for LionWeb
    isPublic: boolean;
    isNamespace?: boolean;
    isNamedElement?: boolean;
    isAbstract?: boolean;
    subConceptNames: string[];
    properties: Map<string, FreLanguageProperty>;
    constructor?: (id?: string) => FreNode | undefined;
    creator?: (data: Partial<FreNode>) => FreNode | undefined;
    language: string;
    referenceShortcut?: ReferenceShortcut;
};

export type FreLanguageClassifier = FreLanguageModel | FreLanguageModelUnit | FreLanguageConcept | FreLanguageInterface;

export class FreLanguage {
    private static theInstance: FreLanguage;

    static getInstance() {
        if (FreLanguage.theInstance === undefined) {
            FreLanguage.theInstance = new FreLanguage();
        }
        return FreLanguage.theInstance;
    }

    private languageName: string;
    private languageId?: string;
    private pmodel: FreLanguageModel;
    private units: Map<string, FreLanguageModelUnit> = new Map<string, FreLanguageModelUnit>();
    private concepts: Map<string, FreLanguageConcept> = new Map<string, FreLanguageConcept>();
    private interfaces: Map<string, FreLanguageInterface> = new Map<string, FreLanguageInterface>();
    private _stdLib: FreStdlib = new EmptyStdLib();
    set stdLib(lib: FreStdlib) {
        this._stdLib = lib;
    }
    get stdLib(): FreStdlib {
        return this._stdLib;
    }

    private constructor() {}

    model(): FreLanguageModel {
        return this.pmodel;
    }

    modelOfType(typeName: string) {
        if (!!this.pmodel && this.pmodel.typeName === typeName) {
            return this.pmodel;
        } else {
            return null;
        }
    }

    unit(typeName: string): FreLanguageModelUnit | undefined {
        return this.units.get(typeName);
    }

    unitByKey(key: string): FreLanguageModelUnit | undefined {
        return this.helperByKey(this.units, key) as FreLanguageModelUnit;
    }

    concept(typeName: string): FreLanguageConcept | undefined {
        // console.log("Language find concept " + typeName);
        return this.concepts.get(typeName);
    }

    conceptByKey(conceptKey: string): FreLanguageConcept | undefined {
        return this.helperByKey(this.concepts, conceptKey) as FreLanguageConcept;
    }

    private helperByKey(
        map: Map<string, FreLanguageClassifier>,
        conceptKey: string,
    ): FreLanguageClassifier | undefined {
        for (const concept of map.values()) {
            if (concept.key === conceptKey) {
                return concept;
            }
        }
        return null;
    }

    interface(typeName: string): FreLanguageInterface | undefined {
        return this.interfaces.get(typeName);
    }

    interfaceByKey(key: string): FreLanguageInterface | undefined {
        return this.helperByKey(this.interfaces, key) as FreLanguageInterface;
    }

    classifier(typeName: string): FreLanguageClassifier | undefined {
        const concept1 = this.concepts.get(typeName);
        if (!!concept1) {
            return concept1;
        } else {
            const intf = this.interfaces.get(typeName);
            if (!!intf) {
                return intf;
            } else {
                const unit1 = this.units.get(typeName);
                if (!!unit1) {
                    return unit1;
                } else {
                    const model = this.modelOfType(typeName);
                    if (!!model) {
                        return model;
                    }
                }
            }
        }
        // console.log("RETURNING NULL FOR " + typeName)
        return undefined;
    }

    classifierByKey(key: string): FreLanguageClassifier | undefined {
        const concept1 = this.conceptByKey(key);
        if (!!concept1) {
            return concept1;
        } else {
            const intf = this.interfaceByKey(key);
            if (!!intf) {
                return intf;
            } else {
                const unit1 = this.unitByKey(key);
                if (!!unit1) {
                    return unit1;
                } else {
                    // TODO By Id for models
                    const model = this.modelOfType(key);
                    if (!!model) {
                        return model;
                    }
                }
            }
        }
        // console.log("RETURNING NULL FOR " + typeName)
        return undefined;
    }

    // private conceptProperty(typeName: string, propertyName: string): FreLanguageProperty | undefined {
    //     return this.concepts.get(typeName)?.properties.get(propertyName);
    // }
    //
    // private conceptPropertyByKey(conceptKey: string, propertyKey: string): FreLanguageProperty | undefined {
    //     return this.helperPropByKey(this.conceptByKey(conceptKey).properties, propertyKey);
    // }

    helperPropByKey(map: Map<string, FreLanguageProperty>, key: string): FreLanguageProperty | undefined {
        for (const prop of map.values()) {
            if (prop.key === key) {
                return prop;
            }
        }
        return undefined;
    }

    // private unitProperty(typeName: string, propertyName: string): FreLanguageProperty | undefined {
    //     return this.units.get(typeName)?.properties.get(propertyName);
    // }

    unitPropertyByKey(unitKey: string, propertyKey: string): FreLanguageProperty | undefined {
        // LOGGER.log("copnceptProperty [" + typeName + "."  + propertyName + "]");
        return this.helperPropByKey(this.unitByKey(unitKey).properties, propertyKey);
    }

    // private interfaceProperty(typeName: string, propertyName: string): FreLanguageProperty | undefined {
    //     return this.interfaces.get(typeName)?.properties.get(propertyName);
    // }

    interfacePropertyByKey(interfaceKey: string, propertyKey: string): FreLanguageProperty | undefined {
        // LOGGER.log("copnceptProperty [" + typeName + "."  + propertyName + "]");
        return this.helperPropByKey(this.interfaceByKey(interfaceKey).properties, propertyKey);
    }

    classifierProperty(typeName: string, propertyName: string): FreLanguageProperty | undefined {
        // LOGGER.log("CLASSIFIERPROPERTY " + typeName + "." + propertyName);
        const concept1 = this.concepts.get(typeName);
        if (!!concept1) {
            return concept1.properties.get(propertyName);
        } else {
            const intf = this.interfaces.get(typeName);
            if (!!intf) {
                return intf.properties.get(propertyName);
            } else {
                const unit1 = this.units.get(typeName);
                if (!!unit1) {
                    return unit1.properties.get(propertyName);
                } else {
                    const model = this.modelOfType(typeName);
                    if (!!model) {
                        return model.properties.get(propertyName);
                    }
                }
            }
        }
        return undefined;
    }

    classifierPropertyByKey(classifierKey: string, propertyKey: string): FreLanguageProperty | undefined {
        // LOGGER.log("CLASSIFIERPROPERTY " + typeName + "." + propertyName);
        const concept1 = this.classifierByKey(classifierKey);
        return this.helperPropByKey(concept1.properties, propertyKey);
    }

    allConceptProperties(typeName: string): FreLanguageProperty[] | undefined {
        // console.log("Looking up properties for "+ typeName);
        let myType: FreLanguageConcept | FreLanguageModelUnit | undefined = this.concept(typeName);
        if (isNullOrUndefined(myType)) {
            myType = this.unit(typeName);
        }
        if (myType === undefined) {
            return [];
        }
        return [...myType.properties.values()];
    }

    /**
     * Get all properties of kind "kind" of classifier "typename"
     * @param typename
     * @param ptype
     */
    public getPropertiesOfKind(typename: string, ptype: PropertyKind): FreLanguageProperty[] {
        const classifier: FreLanguageClassifier | undefined = FreLanguage.getInstance().classifier(typename);
        const foundProperties: FreLanguageProperty[] = [];
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
    public getPropertyValue(element: FreNode, prop: FreLanguageProperty): FreNode[] {
        if (prop.isList) {
            return element[prop.name];
        } else {
            const value = element[prop.name];
            if (!!value) {
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
        return Array.from(this.concepts.values())
            .filter((concept) => concept.isNamedElement)
            .map((concept) => concept.typeName);
    }

    /**
     * Return all named interfaces in the language.
     */
    public getNamedInterfaces(): string[] {
        return Array.from(this.interfaces.values())
            .filter((intfc) => intfc.isNamedElement)
            .map((intfc) => intfc.typeName);
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
        return Array.from(this.units.values()).map((unit) => unit.typeName);
    }

    createModel(id?: string): FreModel {
        return this.pmodel?.constructor(id);
    }

    createUnit(typeName: string, id?: string): FreModelUnit | undefined {
        return this.units.get(typeName)?.constructor(id);
    }

    /**
     * Create a new instance of the class `typeName`.
     * @param typeName
     */
    createConceptOrUnit(typeName: string, id?: string): FreNode | undefined {
        let myType: FreLanguageConcept | FreLanguageModelUnit | undefined = this.concept(typeName);
        if (isNullOrUndefined(myType)) {
            myType = this.unit(typeName);
        }
        return myType?.constructor(id);
    }

    addModel(model: FreLanguageModel) {
        if (!!this.pmodel) {
            console.error(
                "Language: adding model of type " +
                    model?.typeName +
                    " while there is already a model of type " +
                    this.pmodel.typeName,
            );
        }
        this.pmodel = model;
    }

    addUnit(unit: FreLanguageModelUnit) {
        this.units.set(unit.typeName, unit);
        unit.subConceptNames = [];
    }

    /**
     * Add a concept definition to this language
     * @param concept
     */
    addConcept(concept: FreLanguageConcept) {
        this.concepts.set(concept.typeName, concept);
    }

    addInterface(intface: FreLanguageInterface) {
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

    set id(id: string) {
        this.languageId = id;
    }

    get id(): string {
        return this.languageId;
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
        return metatype === requestedType || FreLanguage.getInstance().subConcepts(requestedType).includes(metatype);
    }
}
