import {PiElement, PiContainerDescriptor, PiNamedElement} from "./PiModel";

export class GenericModelSerializer {
    convertToJSON(elem: PiElement, interfaceOnly?: boolean): string {
        return "TEST TEST";
    }

    toTypeScriptInstance(fromFile: string): PiNamedElement {
        return new PiElementImpl;
    }
}

class PiElementImpl implements PiNamedElement {
    piContainer(): PiContainerDescriptor {
        return undefined;
    }

    piId(): string {
        return "";
    }

    piIsBinaryExpression(): boolean {
        return false;
    }

    piIsExpression(): boolean {
        return false;
    }

    piIsModel(): boolean {
        return false;
    }

    piIsUnit(): boolean {
        return false;
    }

    piLanguageConcept(): string {
        return "";
    }

    name: string;

}
