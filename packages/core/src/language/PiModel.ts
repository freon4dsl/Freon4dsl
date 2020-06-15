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
    findUnit(name: string, metatype?: string): PiElement;
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
