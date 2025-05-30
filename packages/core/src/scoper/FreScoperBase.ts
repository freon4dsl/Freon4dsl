import { FreNode, FreNodeReference, FreNamedNode } from '../ast/index.js';
import { FreLanguage } from "../language//index.js";
import { FreLogger } from "../logging/index.js";
import { FreCompositeTyper } from "../typer/index.js";
import { FreCompositeScoper } from "./FreCompositeScoper.js";
import { FreNamespace } from "./FreNamespace.js";
import { FreScoper } from "./FreScoper.js";
import { isNullOrUndefined } from '../util/index.js';
import { findEnclosingNamespace, hasCorrectType, resolvePathStartingInNamespace } from './ScoperUtil.js';
import { FreLanguageEnvironment } from '../environment/index.js';


const LOGGER = new FreLogger("FreScoperBase");

export abstract class FreScoperBase implements FreScoper {
    mainScoper: FreCompositeScoper;
    myTyper: FreCompositeTyper; // todo see whether this can be replaced by FreLanguageEnvironment.getInstance().typer

    // todo move to composite scoper
    public resolvePathName(toBeResolved: FreNodeReference<FreNamedNode>): FreNamedNode | undefined {
        this.myTyper = FreLanguageEnvironment.getInstance().typer;
        // console.log('resolving: ', toBeResolved.pathname)

        let baseNamespace: FreNamespace = findEnclosingNamespace(toBeResolved);
        let currentNamespace: FreNamespace = baseNamespace;
        let found: FreNamedNode = undefined;
        if (!isNullOrUndefined(baseNamespace)) {
            found = resolvePathStartingInNamespace(baseNamespace, currentNamespace, toBeResolved.pathname, this.mainScoper, toBeResolved.typeName);
        } else {
            LOGGER.error('Cannot find enclosing namespace for ' + toBeResolved.pathname);
        }
        // console.log('resolved: ', found?.name);
        return found;
    }

    public getVisibleNodes(node: FreNode, metaType?: string): FreNamedNode[] {
        // console.log('BASE getVisibleNodes for ' + node['name'] + " of type " + node.freLanguageConcept(), ", metaType: " + metaType);
        this.myTyper = FreLanguageEnvironment.getInstance().typer;
        if (!isNullOrUndefined(node)) {
            // Initialize: remember all namespaces that we already included/visited, and add all nodes from the standard library.
            const visitedNamespaces: FreNamespace[] = [];
            let result: FreNamedNode[] = [].concat(FreLanguage.getInstance().stdLib.elements);
            // Find the namespace that 'node' is in
            let nearestNamespace: FreNamespace = findEnclosingNamespace(node);
            // Add the visible nodes from the namespace
            if (!isNullOrUndefined(nearestNamespace)) {
                result.push(...nearestNamespace.getVisibleNodes(this.mainScoper, visitedNamespaces, false));
            }
            // If the 'metaType' parameter is present, filter on metaType
            result = result.filter(elem => hasCorrectType(elem, metaType))
            return result;
        } else {
            LOGGER.error("getVisibleNodes: node is null");
            return [];
        }
    }

    // @ts-ignore parameter is present to adhere to interface FreScoper
    additionalNamespaces(node: FreNode): (FreNode | FreNodeReference<FreNamedNode>)[] {
        return [];
    }

    // @ts-ignore parameter is present to adhere to interface FreScoper
    replacementNamespaces(node: FreNode): (FreNode | FreNodeReference<FreNamedNode>)[] {
        return [];
    }

}
