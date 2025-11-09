import { FreParseLocation } from "../reader/index.js";
import { MobxModelElementImpl } from "./decorators/index.js";
import { FreNode } from "./FreNode.js";

export abstract class FreAnnotation extends MobxModelElementImpl { //implements FreNode {
    $id: string = "" // a unique identifier
    parseLocation: FreParseLocation // if relevant, the location of this element within the source from which it is parsed
    annotations: FreNode[]
    
    freId(): string {
        return this.$id
    }

    freIsModel(): boolean {
        return false
    }
    freIsBinaryExpression(): boolean {
        return false
    }
    freIsUnit(): boolean {
        return false
    }
    freIsExpression(): boolean { return false }
    freLanguageConcept(): string {
        throw new Error("Method should be implemented by subclasses of FreElementBaseImpl.");
    }
    
}
