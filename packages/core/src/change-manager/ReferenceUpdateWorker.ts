import { FreNode, FreNodeReference } from "../ast/index.js";
import { AstWorker } from "../ast-utils/index.js";
import { FreLanguage, FreLanguageProperty } from "../language/index.js";
import { FreLogger } from "../logging/index.js";
import { FrePrimDelta } from "./FreDelta.js"

const LOGGER = new FreLogger("CollectNamesWorker").mute();

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
            const childValue = FreLanguage.getInstance().getPropertyValue(node, childProp)
            for(const elem of childValue) {
                const ref = elem as unknown as FreNodeReference<any>;
                if (ref.pathname.indexOf(this.delta.oldValue as string) > -1) {
                    let newPathName = ref.pathname;
                    newPathName[ref.pathname.indexOf(this.delta.oldValue as string)] = this.delta.newValue as string;
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