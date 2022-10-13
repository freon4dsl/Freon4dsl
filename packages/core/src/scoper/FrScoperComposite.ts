import { PiElement, PiNamedElement } from "../ast/index";
import { FrScoper } from "./FrScoper";

export class FrScoperComposite implements FrScoper {
    // TOD: What of this?
    mainScoper: FrScoperComposite;
    private scopers: FrScoper[] =[];
    name: string = "";

    constructor(name: string) {
        this.name = name;
    }

    appendScoper(t: FrScoper) {
        this.scopers.push(t);
        t.mainScoper = this;
    }

    insertScoper(t: FrScoper) {
        this.scopers.splice(0, 0, t);
        t.mainScoper = this;
    }

    additionalNamespaces(node: PiElement): PiElement[] {
        for (const scoper of this.scopers) {
            const result = scoper.additionalNamespaces(node);
            if (result !== undefined && result !== null) {
                return result;
            }
        }
        return [];
    }

    getFromVisibleElements(node: PiElement, name: string, metatype?: string, excludeSurrounding?: boolean): PiNamedElement {
        for (const scoper of this.scopers) {
            const result = scoper.getFromVisibleElements(node, name, metatype, excludeSurrounding);
            if (result !== undefined) {
                return result;
            }
        }
        return null;
    }

    getVisibleElements(node: PiElement, metatype?: string, excludeSurrounding?: boolean): PiNamedElement[] {
        for (const scoper of this.scopers) {
            const result = scoper.getVisibleElements(node, metatype, excludeSurrounding);
            if (result !== undefined && result !== null) {
                return result;
            }
        }
        return [];
    }

    getVisibleNames(node: PiElement, metatype?: string, excludeSurrounding?: boolean): string[] {
        for (const scoper of this.scopers) {
            const result = scoper.getVisibleNames(node);
            if (result !== undefined && result !== null) {
                return result;
            }
        }
        return [];
    }

    isInScope(node: PiElement, name: string, metatype?: string, excludeSurrounding?: boolean): boolean {
        for (const scoper of this.scopers) {
            const result = scoper.isInScope(node, name, metatype, excludeSurrounding);
            if (result !== undefined) {
                return result;
            }
        }
        return false; // TODO or undefined?
    }

    resolvePathName(node: PiElement, doNotSearch: string, pathname: string[], metatype?: string): PiNamedElement {
        for (const scoper of this.scopers) {
            const result = scoper.resolvePathName(node, doNotSearch, pathname, metatype);
            if (result !== undefined) {
                return result;
            }
        }
        return null; // TODO or undefined?
    }
    
}
