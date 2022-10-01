import { PiElement } from "../ast/index";
import { ListUtil } from "../util/ListUtil";
import { IFrTyper } from "./IFrTyper";
import { PiType } from "./PiType";

export class FrCompositeTyper implements IFrTyper {
    mainTyper: IFrTyper;
    
    private typers: IFrTyper[] =[];
    name: string = "";

    constructor(name: string) {
        this.name = name;
    }

    appendTyper(t: IFrTyper) {
        this.typers.push(t);
        t.mainTyper = this;
    }

    insertTyper(t: IFrTyper) {
        this.typers.splice(0, 0, t);
        t.mainTyper = this;
    }
    
    inferType(node: PiElement): PiType | null {
        for (const typer of this.typers) {
            const result = typer.inferType(node);
            if (!!result) {
                return result;
            }
        }
        return null;
    }

    isType(node: PiElement): boolean {
        for (const typer of this.typers) {
            const result = typer.isType(node);
            if (!!result) {
                return result;
            }
        }
        return false;
    }

    commonSuper(typelist: PiType[]): PiType | null {
        for (const typer of this.typers) {
            let result = typer.commonSuper(typelist);
            if (!!result) {
                return result;
            }
        }
        // no result from custom typers => use the generated typer
        return null;
    }

    conforms(type1: PiType, type2: PiType): boolean | null {
        for (const typer of this.typers) {
            let result = typer.conforms(type1, type2);
            if (result !== null) {
                return result;
            }
        }
        return false;
    }

    conformsList(typelist1: PiType[], typelist2: PiType[]): boolean | null {
        for (const typer of this.typers) {
            let result = typer.conformsList(typelist1, typelist2);
            if (result !== null) {
                return result;
            }
        }
        // TODO Copied from old typer,. but shouldn't this be false?
        return true;
    }

    equals(type1: PiType, type2: PiType): boolean | null {
        for (const typer of this.typers) {
            let result = typer.equals(type1, type2);
            if (result !== null && result !== undefined) {
                return result;
            }
        }
        return false;
    }

    getSuperTypes(type: PiType): PiType[] | null {
        for (const typer of this.typers) {
            let result = typer.getSuperTypes(type);
            if (!!result) {
                return result;
            }
        }
        // no result from custom typers => use the generated typer
        return [];
    }

    commonSuperType(elemlist: PiElement[]): PiType {
        if (!elemlist) return null;
        if (elemlist.length === 0) return null;

        const $typelist: PiType[] = this.elementListToTypeList(elemlist);
        if ($typelist.length === 0) return null;

        return this.commonSuper($typelist);
    }

    conformsListType(elemlist1: PiElement[], elemlist2: PiElement[]): boolean {
        if (!elemlist1 || !elemlist2) return false;
        if (elemlist1.length !== elemlist2.length) return false;

        const $typelist1: PiType[] = this.elementListToTypeList(elemlist1);
        const $typelist2: PiType[] = this.elementListToTypeList(elemlist2);
        if ($typelist1.length === 0 || $typelist2.length === 0) return false;
        if ($typelist1.length !== $typelist2.length) return false;

        return this.conformsList($typelist1, $typelist2);
    }

    conformsType(elem1: PiElement, elem2: PiElement): boolean {
        if (!elem1 || !elem2) return false;

        const $type1: PiType = this.inferType(elem1);
        const $type2: PiType = this.inferType(elem2);
        if (!$type1 || !$type2) return false;

        return this.conforms($type1, $type2);
    }

    equalsType(elem1: PiElement, elem2: PiElement): boolean {
        if (!elem1 || !elem2) return false;

        const $type1: PiType = this.inferType(elem1);
        const $type2: PiType = this.inferType(elem2);
        if (!$type1 || !$type2) return false;

        return this.equals($type1, $type2);
    }

    /**
     * Returns a list of types: one for each element of 'inlist',
     * if this type is not yet present in the result.
     * @param inlist
     * @private
     */
    private elementListToTypeList(inlist: PiElement[]): PiType[] {
        const typelist: PiType[] = [];
        for (const elem of inlist) {
            ListUtil.addIfNotPresent<PiType>(typelist, this.inferType(elem));
        }
        return typelist;
    }    
}

export class Composite<PART> {
    private typers: PART[] =[];
    name: string = "";

    constructor(name: string) {
        this.name = name;
    }

    appendTyper(t: PART) {
        this.typers.push(t)
    }

    insertTyper(t: PART) {
        this.typers.splice(0, 0, t);
    }    
}
