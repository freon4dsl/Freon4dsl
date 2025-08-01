import type { FreNamedNode, FreNode, FreNodeReference } from '../ast/index.js';
import { FreLogger } from "../logging/index.js";
import { type FreScoper } from "./FreScoper.js";
import { notNullOrUndefined } from '../util/index.js';
import { FreNamespaceInfo } from './FreNamespaceInfo.js';
import { FreNamespace } from './FreNamespace.js';
import { findEnclosingNamespace, resolvePathStartingInNamespace } from './ScoperUtil.js';

const LOGGER = new FreLogger("FreCompositeScoper").mute();

export class FreCompositeScoper implements FreScoper {
    mainScoper: FreCompositeScoper; // NB the value is always undefined, here to adhere to FreScoper interface
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
     * Returns the node the 'refToResolve' refers to.
     * @param refToResolve
     */
    resolvePathName(refToResolve: FreNodeReference<FreNamedNode>): FreNamedNode | undefined {
        // console.log('resolving: ', toBeResolved.pathname)
        let baseNamespace: FreNamespace = findEnclosingNamespace(refToResolve);
        let currentNamespace: FreNamespace = baseNamespace;
        let found: FreNamedNode = undefined;
        if (notNullOrUndefined(baseNamespace)) {
            found = resolvePathStartingInNamespace(baseNamespace, currentNamespace, refToResolve.pathname, this, refToResolve.typeName);
        } else {
            LOGGER.error('Cannot find enclosing namespace for ' + refToResolve.pathname);
        }
        // console.log('resolved: ', found?.name);
        return found;
    }

    /**
     * Returns all named nodes that are visible within the namespace that 'node' resides in. If
     * 'metatype' is present, only nodes that conform to this 'metatype' are returned.
     * @param node
     * @param metatype
     */
    getVisibleNodes(node: FreNode | FreNodeReference<FreNamedNode>, metatype?: string): FreNamedNode[] {
        // console.log('COMPOSITE getVisibleNodes for ' + node.freLanguageConcept() + " of type " + node.freLanguageConcept());
        if (!!node) {
            for (const scoper of this.scopers) {
                // todo should we concat the results from all scoper parts??
                const result = scoper.getVisibleNodes(node, metatype);
                if (result.length > 0) {
                    return result;
                }
            }
        }
        return [];
    }

    /**
     * Loops over all known scopers to find the information on namespace imports.
     * Note that currently as soon as a result is found, the remaining scopers are not
     * queried.
     * @param node
     */
    importedNamespaces(node: FreNode): FreNamespaceInfo[] {
        // todo should we check whether node 'is' a namespace?
        if (!!node) {
            for (const scoper of this.scopers) {
                // todo should we concat the results from all scoper parts??
                const result = scoper.importedNamespaces(node);
                if (result.length > 0) {
                    return result;
                }
            }
        }
        return [];
    }

    /**
     * Loops over all known scopers to find the information on namespace alternatives.
     * Note that currently as soon as a result is found, the remaining scopers are not
     * queried.
     * @param node
     */
    alternativeNamespaces(node: FreNode): FreNamespaceInfo[] {
        // todo should we check whether node 'is' a namespace?
        LOGGER.log('COMPOSITE alternativeNamespaces for ' + node.freId() + " of type " + node.freLanguageConcept());
        if (!!node) {
            for (const scoper of this.scopers) {
                // todo should we concat the results from all scoper parts??
                const result: FreNamespaceInfo[] = scoper.alternativeNamespaces(node);
                if (result.length > 0) {
                    return result;
                }
            }
        }
        return undefined;
    }
}
