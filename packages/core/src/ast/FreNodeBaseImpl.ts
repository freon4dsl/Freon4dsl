import { FreNode } from "..";
import { FreParseLocation } from "../reader";
import { MobxModelElementImpl } from "./decorators";

/**
 * An abstract implementation of a decorated FreNode.
 */
export abstract class FreNodeBaseImpl extends MobxModelElementImpl implements FreNode {
    parseLocation: FreParseLocation;

    copy(): FreNode {
        throw new Error("Method should be implemented by subclasses of FreElementBaseImpl.");
    }

    // @ts-ignore
    // parameter present to adhere to interface
    match(toBeMatched: Partial<FreNode>): boolean {
        throw new Error("Method should be implemented by subclasses of FreElementBaseImpl.");
    }

    freId(): string {
        throw new Error("Method should be implemented by subclasses of FreElementBaseImpl.");
    }

    freIsBinaryExpression(): boolean {
        throw new Error("Method should be implemented by subclasses of FreElementBaseImpl.");
    }

    freIsExpression(): boolean {
        throw new Error("Method should be implemented by subclasses of FreElementBaseImpl.");
    }

    freIsModel(): boolean {
        throw new Error("Method should be implemented by subclasses of FreElementBaseImpl.");
    }

    freIsUnit(): boolean {
        throw new Error("Method should be implemented by subclasses of FreElementBaseImpl.");
    }

    freLanguageConcept(): string {
        throw new Error("Method should be implemented by subclasses of FreElementBaseImpl.");
    }
}
