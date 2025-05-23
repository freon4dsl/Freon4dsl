import { FreNode, FreNamedNode, FreNodeReference } from '../ast/index.js';
import { FreLogger } from "../logging/index.js";
import { FreScoper } from "./FreScoper.js";
import { isNullOrUndefined } from '../util/index.js';
import { FreNamespace } from './FreNamespace.js';
import { FreScoperBase } from './FreScoperBase.js';

const LOGGER = new FreLogger("FreCompositeScoper").mute();

export class FreCompositeScoper implements FreScoper {
    mainScoper: FreCompositeScoper;
    private scopers: FreScoper[] = [];
    name: string = "";

    constructor(name: string) {
        this.name = name;
    }

    appendScoper(t: FreScoper) {
        this.scopers.push(t);
        t.mainScoper = this;
    }

    insertScoper(t: FreScoper) {
        this.scopers.splice(0, 0, t);
        t.mainScoper = this;
    }

    public resolvePathName(
      basePosition: FreNode,
      doNotSearch: FreNodeReference<FreNamedNode>,
      pathname: string[],
      metatype?: string,
    ): FreNamedNode | undefined {
        if (!!basePosition) {
            for (const scoper of this.scopers) {
                if (scoper instanceof FreScoperBase) {
                    // console.log('FreCompositeScoper calls: ', scoper.constructor.name);
                    const result = (scoper as FreScoperBase).resolvePathName(basePosition, doNotSearch, pathname, metatype);
                    if (!isNullOrUndefined(result)) {
                        return result;
                    }
                // } else {
                //     console.log('FreCompositeScoper does NOT call: ', scoper.constructor.name);
                }
            }
        }
        return undefined;
    }

    additionalNamespaces(node: FreNode): FreNode[] {
        if (!!node) {
            for (const scoper of this.scopers) {
                const result = scoper.additionalNamespaces(node);
                if (!isNullOrUndefined(result)) {
                    return result;
                }
            }
        }
        return [];
    }

    getVisibleNodes(node: FreNode, metatype?: string, excludeSurrounding?: boolean): FreNamedNode[] {
        LOGGER.log('COMPOSITE getVisibleNodes for ' + node.freLanguageConcept() + " of type " + node.freLanguageConcept());
        if (!!node) {
            for (const scoper of this.scopers) {
                const result = scoper.getVisibleNodes(node, metatype, excludeSurrounding);
                if (!isNullOrUndefined(result)) {
                    return result;
                }
            }
        }
        return [];
    }

    replacementNamespace(node: FreNode): FreNamespace | undefined {
        LOGGER.log('COMPOSITE replacementNamespace for ' + node.freId() + " of type " + node.freLanguageConcept());
        if (!!node) {
            for (const scoper of this.scopers) {
                const result: FreNamespace = scoper.replacementNamespace(node);
                if (!isNullOrUndefined(result)) {
                    return result;
                }
            }
        }
        return undefined;
    }
}
