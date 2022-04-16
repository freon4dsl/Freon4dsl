import { PiContainerDescriptor, PiElement, PiNamedElement } from "../language";
import { PiWriter } from "../writer";
import { PiType } from "../../dist";

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

export class AstType implements PiType {
    astElement: PiElement;

    static create(data: Partial<AstType>): AstType {
        const result: AstType = new AstType;
        if (data.astElement) {
            result.astElement = data.astElement;
        }
        return result;
    }

    static ANY: PiNamedElement = NamedElement.getInstance();
    static ANY_TYPE: AstType = AstType.create({astElement: AstType.ANY});

    readonly $typename: string = "AstType";
    toPiString(writer: PiWriter): string {
        if (!!this.astElement ) {
            if (this.astElement === AstType.ANY) {
                return "AstType[ ANY ]";
            } else {
                return "AstType[ " + writer.writeToString(this.astElement) + " ]";
            }
        }
        return "AstType[ unknown ]";
    }
}
