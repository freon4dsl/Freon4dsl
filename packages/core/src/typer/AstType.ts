import { FreOwnerDescriptor, FreNode, FreNamedNode } from "../ast";
import { FreWriter } from "../writer";
import { FreType } from "./FreType";
import { FreParseLocation } from "../reader";

class NamedNode implements FreNamedNode {
    static environment: NamedNode;

    /**
     * This method implements the singleton pattern
     */
    public static getInstance(): FreNamedNode {
        if (this.environment === undefined || this.environment === null) {
            this.environment = new NamedNode();
        }
        return this.environment;
    }
    name: string = "ANY";

    /**
     * A private constructor, as demanded by the singleton pattern.
     */
    private constructor() {}

    freOwner(): FreNode | undefined {
        return undefined;
    }

    freOwnerDescriptor(): FreOwnerDescriptor {
        return undefined;
    }

    freId(): string {
        return "";
    }

    freIsBinaryExpression(): boolean {
        return false;
    }

    freIsExpression(): boolean {
        return false;
    }

    freIsModel(): boolean {
        return false;
    }

    freIsUnit(): boolean {
        return false;
    }

    freLanguageConcept(): string {
        return "NamedElement";
    }

    copy(): NamedNode {
        return this;
    }
    match(toBeMatched: Partial<NamedNode>): boolean {
        return toBeMatched.name === this.name;
    }

    parseLocation: FreParseLocation;
}

export class AstType implements FreType {
    static create(data: Partial<AstType>): AstType {
        const result: AstType = new AstType();
        if (data.astElement) {
            result.astElement = data.astElement;
        }
        return result;
    }

    static ANY: FreNamedNode = NamedNode.getInstance();
    static ANY_TYPE: AstType = AstType.create({ astElement: AstType.ANY });
    astElement: FreNode;

    readonly $typename: string = "AstType";

    toFreString(writer: FreWriter): string {
        if (!!this.astElement) {
            if (this.astElement === AstType.ANY) {
                return "ANY";
            } else {
                return writer.writeToString(this.astElement);
            }
        }
        return "AstType[ unknown ]";
    }

    toAstElement(): FreNode {
        return this.astElement;
    }

    copy(): AstType {
        const result: AstType = new AstType();
        if (this.astElement) {
            result.astElement = this.astElement;
        }
        return result;
    }
}
