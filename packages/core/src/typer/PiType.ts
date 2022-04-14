import { PiContainerDescriptor, PiElement, PiNamedElement } from "../language";
import { PiWriter } from "../writer";

class NamedElement implements PiNamedElement {
    name: string = "ANY";
    static environment: NamedElement;

    /**
     * This method implements the singleton pattern
     */
    public static getInstance(): PiNamedElement {
        if (this.environment === undefined || this.environment === null) {
            this.environment = new NamedElement();
        }
        return this.environment;
    }

    /**
     * A private constructor, as demanded by the singleton pattern.
     */
    private constructor() {
    }

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
        return "NamedElement";
    }
}

export class PiType {
    internal: PiElement;

    static create(data: Partial<PiType>): PiType {
        const result: PiType = new PiType;
        if (data.internal) {
            result.internal = data.internal;
        }
        return result;
    }

    static ANY: PiNamedElement = NamedElement.getInstance();
    static ANY_TYPE: PiType = PiType.create({internal: PiType.ANY});

    readonly $typename: string = "PiType";
    toPiString(writer: PiWriter): string {
        return "PiType[ " + writer.writeToString(this.internal) + " ]";
    }
}
