import { Demo, ExampleMetaType } from "@projectit/playground/dist/example/language/gen";

/**
 * You can either directly implement these interfaces, or use `Module Augmentation`,
 * as described in `https://www.typescriptlang.org/docs/handbook/declaration-merging.html`.
 */
// tag::element-interface[]
export interface PiElement {
    piId(): string;

    piLanguageConcept(): string;

    piContainer(): PiContainerDescriptor;

    piIsModel(): boolean;

    piIsExpression(): boolean;

    piIsBinaryExpression(): boolean;
}
// end::element-interface[]

// tag::named-element-interface[]
export interface PiNamedElement extends PiElement {
    name: string;
}
// end::named-element-interface[]

// tag::model-interface[]
export interface PiModel extends PiNamedElement {
    /**
     * Finds a unit of this model based on its name and 'metatype'.
     * @param name
     * @param metatype
     */
    findUnit(name: string, metatype?: string): PiNamedElement;

    /**
     * Replaces a model unit by a new one. Used for swapping between complete units and unit public interfaces.
     * Returns false if the replacement could not be done, e.g. because 'oldUnit' is not a child of this object.
     *
     * @param oldUnit
     * @param newUnit
     */
    replaceUnit(oldUnit: PiNamedElement, newUnit: PiNamedElement): boolean;

    /**
     * Adds a model unit. Returns false if anything goes wrong.
     *
     * @param oldUnit
     * @param newUnit
     */
    addUnit(newUnit: PiNamedElement): boolean;

    /**
     * Removes a model unit. Returns false if anything goes wrong.
     *
     * @param oldUnit
     */
    removeUnit(oldUnit: PiNamedElement): boolean;

    /**
     * Returns an empty model unit of type 'unitTypeName' and adds it to this model.
     *
     * @param model
     * @param unitTypeName
     */
    newUnit(typename: string): PiNamedElement;

    /**
     * Returns a list of model units.
     */
    getUnits(): PiNamedElement[];
}
// end::model-interface[]

// TODO PiExpression cannot be distinguished from PiElement anymore,  is this a problem?
// tag::expression-interface[]
export interface PiExpression extends PiElement {
}
// end::expression-interface[]

// tag::binary-expression-interface[]
export interface PiBinaryExpression extends PiExpression {
    piLeft(): PiExpression;

    piSetLeft(left: PiExpression): void;

    piRight(): PiExpression;

    piSetRight(right: PiExpression): void;

    piPriority(): number;
}
// end::binary-expression-interface[]

export interface PiContainerDescriptor {
    container: PiElement;
    propertyName: string;
    propertyIndex?: number;
}

export function isPiModel(element: PiElement): element is PiModel {
    return (!!element) && element.piIsModel && element.piIsModel();
}

export function isPiExpression(element: PiElement): element is PiExpression {
    return (!!element) && element.piIsExpression && element.piIsExpression();
}

export function isPiBinaryExpression(element: PiElement): element is PiBinaryExpression {
    return (!!element) && element.piIsExpression && element.piIsExpression() && element.piIsBinaryExpression && element.piIsBinaryExpression();
}
