import { FreNode, FreNamedNode } from "../ast/index.js";
// import { FreLogger } from "../logging/index.js";
import { FreScoper } from "./FreScoper.js";
import { isNullOrUndefined } from '../util/index.js';
import { FreNamespace } from './FreNamespace.js';

// const LOGGER = new FreLogger("FreScoperComposite").mute();

export class FreScoperComposite implements FreScoper {
    mainScoper: FreScoperComposite;
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

    getFromVisibleElements(node: FreNode, name: string, metatype?: string, excludeSurrounding?: boolean): FreNamedNode {
        if (!!node) {
            for (const scoper of this.scopers) {
                const result = scoper.getFromVisibleElements(node, name, metatype, excludeSurrounding);
                if (!isNullOrUndefined(result)) {
                    return result;
                }
            }
        }
        return null;
    }

    getVisibleElements(node: FreNode, metatype?: string, excludeSurrounding?: boolean): FreNamedNode[] {
        // console.log('COMPOSITE getVisibleElements for ' + node.freLanguageConcept() + " of type " + node.freLanguageConcept());
        if (!!node) {
            for (const scoper of this.scopers) {
                const result = scoper.getVisibleElements(node, metatype, excludeSurrounding);
                if (!isNullOrUndefined(result)) {
                    return result;
                }
            }
        }
        return [];
    }

    getVisibleNames(node: FreNode, metatype?: string, excludeSurrounding?: boolean): string[] {
        // console.log("COMPOSITE getVisibleNames for " + node?.freLanguageConcept() + " of type " + metatype);
        if (!!node) {
            for (const scoper of this.scopers) {
                const result = scoper.getVisibleNames(node, metatype, excludeSurrounding);
                if (!isNullOrUndefined(result)) {
                    return result;
                }
            }
        }
        return [];
    }

    isInScope(node: FreNode, name: string, metatype?: string, excludeSurrounding?: boolean): boolean {
        if (!!node) {
            for (const scoper of this.scopers) {
                const result = scoper.isInScope(node, name, metatype, excludeSurrounding);
                if (!isNullOrUndefined(result)) {
                    return result;
                }
            }
        }
        return false; // TODO or undefined?
    }

    resolvePathName(node: FreNode, doNotSearch: string, pathname: string[], metatype?: string): FreNamedNode {
        if (!!node) {
            for (const scoper of this.scopers) {
                const result = scoper.resolvePathName(node, doNotSearch, pathname, metatype);
                if (!isNullOrUndefined(result)) {
                    return result;
                }
            }
        }
        return null; // TODO or undefined?
    }

    getAlternativeScope(node: FreNode): FreNamespace {
        // console.log('COMPOSITE getAlternativeScope for ' + node.freId() + " of type " + node.freLanguageConcept());
        if (!!node) {
            for (const scoper of this.scopers) {
                const result: FreNamespace = scoper.getAlternativeScope(node);
                if (!isNullOrUndefined(result)) {
                    return result;
                }
            }
        }
        return undefined;
    }

    hasAlternativeScope(node: FreNode): boolean {
        // console.log('COMPOSITE hasAlternativeScope for ' + node.freId() + " of type " + node.freLanguageConcept());

        if (!!node) {
            for (const scoper of this.scopers) {
                const result: boolean = scoper.hasAlternativeScope(node);
                if (result) {
                    // console.log('\t COMPOSITE result is true')
                    return result;
                }
            }
        }
        // console.log('\t COMPOSITE result is false')
        return false;
    }
}
