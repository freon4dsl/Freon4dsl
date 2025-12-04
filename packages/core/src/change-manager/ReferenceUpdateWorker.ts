import { type FreNode } from "../ast/index.js";
import type { AstWorker } from "../ast-utils/index.js";
import { FreLanguage, type FreLanguageProperty } from "../language/index.js";
import { FreLogger } from "../logging/index.js";
import { type FrePrimDelta } from "./FreDelta.js"

const LOGGER = new FreLogger("ReferenceUpdateWorker").mute();

/**
 * AST worker that updates the referenced name per node.
 * This worker is used in ReferenceUpdateManager when walking the AST.
 */
export class ReferenceUpdateWorker implements AstWorker {
    // The name update, for which we update the references
    private delta: FrePrimDelta;

    constructor(delta: FrePrimDelta) {
        this.delta = delta;
    }

    execBefore(node: FreNode): boolean {
        // find node properties (children) of type reference
        const referenceProperties: FreLanguageProperty[] = FreLanguage.getInstance().getPropertiesOfKind(
            node.freLanguageConcept(),
            "reference",
        );
        // check whether any of references are touched by delta
        for (const childProp of referenceProperties) {
            const childValue = FreLanguage.getInstance().getReferencePropertyValue(node, childProp)
            for(const ref of childValue) {
                const foundIndex = ref.pathname.indexOf(this.delta.oldValue as string)
                if (foundIndex > -1 && ref.referred === this.delta.owner) {
                    let newPathName = ref.pathname;
                    newPathName[foundIndex] = this.delta.newValue as string;
                    ref.pathname = newPathName;
                    LOGGER.log(`    updated reference in the node ${node.freId()} to the ${newPathName}`)
                }
            }
        }
        return false;   //UT: is returning true makes more sense here?
    }

    // @ts-ignore
    // parameter is present to adhere to signature of super class
    execAfter(node: FreNode): boolean {
        return false;
    }
}
