import { PiOwnerDescriptor, PiElement, PiNamedElement } from "../ast";
import { PiWriter } from "../writer";
import { PiType } from "./PiType";
import { PiParseLocation } from "../reader";


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

    piOwner(): PiElement {
        return undefined;
    }

    piOwnerDescriptor(): PiOwnerDescriptor {
        return undefined;
    }

    piId(): string {
        return "";
    }

    piIsUnaryExpression(): boolean {
        return false;
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

    copy(): NamedElement {
        return this;
    }
    match(toBeMatched: Partial<NamedElement>): boolean {
        return toBeMatched.name === this.name;
    }

    parse_location: PiParseLocation;
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
                return "ANY";
            } else {
                return writer.writeToString(this.astElement);
            }
        }
        return "AstType[ unknown ]";
    }

    toAstElement(): PiElement {
        return this.astElement;
    }

    copy(): AstType {
        const result: AstType = new AstType;
        if (this.astElement) {
            result.astElement = this.astElement;
        }
        return result;
    }
}
