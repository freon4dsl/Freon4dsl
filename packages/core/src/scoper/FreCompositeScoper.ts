import { FreNode, FreNamedNode, FreNodeReference } from '../ast/index.js';
import { FreLogger } from "../logging/index.js";
import { FreScoper } from "./FreScoper.js";
import { isNullOrUndefined } from '../util/index.js';
import { FreScoperBase } from './FreScoperBase.js';

const LOGGER = new FreLogger("FreCompositeScoper").mute();

export class FreCompositeScoper implements FreScoper {
    mainScoper: FreCompositeScoper;
    private scopers: FreScoper[] = [];

    appendScoper(t: FreScoper) {
        this.scopers.push(t);
        t.mainScoper = this;
    }

    insertScoper(t: FreScoper) {
        this.scopers.splice(0, 0, t);
        t.mainScoper = this;
    }

    /**
     * This function is only used by FreNodeReference, therefore we redirect to the generated scoper, in fact to
     * the implementation of this method in its base class 'FreScoperBase'. Internally, the method 'getVisibleNodes' is
     * used, which *does* use all available scopers.
     *
     * @param nodeToResolve
     */
    resolvePathName(nodeToResolve: FreNodeReference<FreNamedNode>): FreNamedNode | undefined {
        for (const scoper of this.scopers) {
            if (scoper instanceof FreScoperBase) {
                const result = (scoper as FreScoperBase).resolvePathName(nodeToResolve);
                if (!isNullOrUndefined(result)) {
                    return result;
                }
            }
        }
        return undefined;
    }

    additionalNamespaces(node: FreNode): (FreNamedNode | FreNodeReference<FreNamedNode>)[] {
        if (!!node) {
            for (const scoper of this.scopers) {
                // todo should we concat the results from all scoper parts??
                const result = scoper.additionalNamespaces(node);
                if (!isNullOrUndefined(result)) {
                    return result;
                }
            }
        }
        return [];
    }

    getVisibleNodes(node: FreNode, metatype?: string): FreNamedNode[] {
        LOGGER.log('COMPOSITE getVisibleNodes for ' + node.freLanguageConcept() + " of type " + node.freLanguageConcept());
        if (!!node) {
            for (const scoper of this.scopers) {
                // todo should we concat the results from all scoper parts??
                const result = scoper.getVisibleNodes(node, metatype);
                if (!isNullOrUndefined(result)) {
                    return result;
                }
            }
        }
        return [];
    }

    replacementNamespaces(node: FreNode): (FreNamedNode | FreNodeReference<FreNamedNode>)[] {
        LOGGER.log('COMPOSITE replacementNamespace for ' + node.freId() + " of type " + node.freLanguageConcept());
        if (!!node) {
            for (const scoper of this.scopers) {
                // todo should we concat the results from all scoper parts??
                const result: (FreNamedNode | FreNodeReference<FreNamedNode>)[] = scoper.replacementNamespaces(node);
                if (!isNullOrUndefined(result)) {
                    return result;
                }
            }
        }
        return undefined;
    }
}
