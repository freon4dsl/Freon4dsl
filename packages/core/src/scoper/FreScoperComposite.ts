import { FreNode, FreNamedNode } from "../ast";
import { FreLogger } from "../logging";
import { FreScoper } from "./FreScoper";

const LOGGER = new FreLogger("FreScoperComposite").mute();

export class FreScoperComposite implements FreScoper {
    // TOD: What of this?
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
        for (const scoper of this.scopers) {
            const result = scoper.additionalNamespaces(node);
            if (result !== undefined && result !== null) {
                return result;
            }
        }
        return [];
    }

    getFromVisibleElements(node: FreNode, name: string, metatype?: string, excludeSurrounding?: boolean): FreNamedNode {
        for (const scoper of this.scopers) {
            const result = scoper.getFromVisibleElements(node, name, metatype, excludeSurrounding);
            if (result !== undefined) {
                return result;
            }
        }
        return null;
    }

    getVisibleElements(node: FreNode, metatype?: string, excludeSurrounding?: boolean): FreNamedNode[] {
        for (const scoper of this.scopers) {
            const result = scoper.getVisibleElements(node, metatype, excludeSurrounding);
            if (result !== undefined && result !== null) {
                return result;
            }
        }
        return [];
    }

    getVisibleNames(node: FreNode, metatype?: string, excludeSurrounding?: boolean): string[] {
        LOGGER.log("getVisibleNames for " + node.freLanguageConcept() + " of type " + metatype);
        for (const scoper of this.scopers) {
            const result = scoper.getVisibleNames(node, metatype, excludeSurrounding);
            if (result !== undefined && result !== null) {
                return result;
            }
        }
        return [];
    }

    isInScope(node: FreNode, name: string, metatype?: string, excludeSurrounding?: boolean): boolean {
        for (const scoper of this.scopers) {
            const result = scoper.isInScope(node, name, metatype, excludeSurrounding);
            if (result !== undefined) {
                return result;
            }
        }
        return false; // TODO or undefined?
    }

    resolvePathName(node: FreNode, doNotSearch: string, pathname: string[], metatype?: string): FreNamedNode {
        for (const scoper of this.scopers) {
            const result = scoper.resolvePathName(node, doNotSearch, pathname, metatype);
            if (result !== undefined) {
                return result;
            }
        }
        return null; // TODO or undefined?
    }
}
