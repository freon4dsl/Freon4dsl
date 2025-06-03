import { FreNode, FreNamedNode } from '../ast/index.js';
import { FreLanguage } from "../language//index.js";
import { FreLogger } from "../logging/index.js";
import { FreCompositeTyper } from "../typer/index.js";
import { FreCompositeScoper } from "./FreCompositeScoper.js";
import { FreNamespace, PUBLIC_AND_PRIVATE } from './FreNamespace.js';
import { FreScoper } from "./FreScoper.js";
import { isNullOrUndefined } from '../util/index.js';
import { findEnclosingNamespace, hasCorrectType } from './ScoperUtil.js';
import { FreLanguageEnvironment } from '../environment/index.js';


const LOGGER = new FreLogger("FreScoperBase");

export abstract class FreScoperBase implements FreScoper {
    mainScoper: FreCompositeScoper;
    myTyper: FreCompositeTyper; // todo see whether this can be replaced by FreLanguageEnvironment.getInstance().typer

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
                result.push(...nearestNamespace.getVisibleNodes(this.mainScoper, visitedNamespaces, PUBLIC_AND_PRIVATE));
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
    importedNamespaces(node: FreNode): FreNamespaceInfo[] {
        return [];
    }

    // @ts-ignore parameter is present to adhere to interface FreScoper
    alternativeNamespaces(node: FreNode): FreNamespaceInfo[] {
        return [];
    }

}
