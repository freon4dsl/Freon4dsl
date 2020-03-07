/**
 * You can either directly implement these interfaces, or use `Module Augmentation`,
 * as described in `https://www.typescriptlang.org/docs/handbook/declaration-merging.html`.
 */
// tag::PiElement[]
export interface PiElement {
    piId(): string;

    piLanguageConcept(): string;

    piContainer(): PiContainerDescriptor;

    piIsExpression(): boolean;

    piIsBinaryExpression(): boolean;
}
// end::PiElement[]

export interface PiNamedElement extends PiElement {
    piName(): string;
}

export interface PiExpression extends PiElement {
    piIsExpressionPlaceHolder(): boolean;
}

export interface PiBinaryExpression extends PiExpression {
    // TODO Should be moved to editor
    piSymbol(): string;

    piLeft(): PiExpression;

    piSetLeft(left: PiExpression): void;

    piRight(): PiExpression;

    piSetRight(right: PiExpression): void;

    piPriority(): number;
}

export interface PiContainerDescriptor {
    container: PiElement;
    propertyName: string;
    propertyIndex?: number;
}

export function isPiExpression(element: PiElement): element is PiExpression {
    return element.piIsExpression && element.piIsExpression();
}

export function isPiBinaryExpression(element: PiElement): element is PiBinaryExpression {
    return element.piIsExpression && element.piIsExpression() && element.piIsBinaryExpression && element.piIsBinaryExpression();
}
