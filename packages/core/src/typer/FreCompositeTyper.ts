import { FreNode } from "../ast";
import { ArrayUtil } from "../util/ArrayUtil";
import { FreTyper } from "./FreTyper";
import { FreType } from "./FreType";

export class FreCompositeTyper implements FreTyper {
    mainTyper: FreTyper;

    private typers: FreTyper[] = [];
    name: string = "";

    constructor(name: string) {
        this.name = name;
    }

    appendTyper(t: FreTyper) {
        this.typers.push(t);
        t.mainTyper = this;
    }

    insertTyper(t: FreTyper) {
        this.typers.splice(0, 0, t);
        t.mainTyper = this;
    }

    inferType(node: FreNode): FreType | null {
        for (const typer of this.typers) {
            const result = typer.inferType(node);
            if (!!result) {
                return result;
            }
        }
        return null;
    }

    isType(node: FreNode): boolean {
        for (const typer of this.typers) {
            const result = typer.isType(node);
            if (!!result) {
                return result;
            }
        }
        return false;
    }

    commonSuper(typelist: FreType[]): FreType | null {
        for (const typer of this.typers) {
            const result = typer.commonSuper(typelist);
            if (!!result) {
                return result;
            }
        }
        // no result from custom typers => use the generated typer
        return null;
    }

    conforms(type1: FreType, type2: FreType): boolean | null {
        for (const typer of this.typers) {
            const result = typer.conforms(type1, type2);
            if (result !== null) {
                return result;
            }
        }
        return false;
    }

    conformsList(typelist1: FreType[], typelist2: FreType[]): boolean | null {
        for (const typer of this.typers) {
            const result = typer.conformsList(typelist1, typelist2);
            if (result !== null) {
                return result;
            }
        }
        return false;
    }

    equals(type1: FreType, type2: FreType): boolean | null {
        for (const typer of this.typers) {
            const result = typer.equals(type1, type2);
            if (result !== null && result !== undefined) {
                return result;
            }
        }
        return false;
    }

    getSuperTypes(type: FreType): FreType[] | null {
        for (const typer of this.typers) {
            const result = typer.getSuperTypes(type);
            if (!!result) {
                return result;
            }
        }
        // no result from custom typers => use the generated typer
        return [];
    }

    commonSuperType(elemlist: FreNode[]): FreType {
        if (!elemlist) {
            return null;
        }
        if (elemlist.length === 0) {
            return null;
        }

        const $typelist: FreType[] = this.elementListToTypeList(elemlist);
        if ($typelist.length === 0) {
            return null;
        }

        return this.commonSuper($typelist);
    }

    conformsListType(elemlist1: FreNode[], elemlist2: FreNode[]): boolean {
        if (!elemlist1 || !elemlist2) {
            return false;
        }
        if (elemlist1.length !== elemlist2.length) {
            return false;
        }

        const $typelist1: FreType[] = this.elementListToTypeList(elemlist1);
        const $typelist2: FreType[] = this.elementListToTypeList(elemlist2);
        if ($typelist1.length === 0 || $typelist2.length === 0) {
            return false;
        }
        if ($typelist1.length !== $typelist2.length) {
            return false;
        }

        return this.conformsList($typelist1, $typelist2);
    }

    conformsType(elem1: FreNode, elem2: FreNode): boolean {
        if (!elem1 || !elem2) {
            return false;
        }

        const $type1: FreType = this.inferType(elem1);
        const $type2: FreType = this.inferType(elem2);
        if (!$type1 || !$type2) {
            return false;
        }

        return this.conforms($type1, $type2);
    }

    equalsType(elem1: FreNode, elem2: FreNode): boolean {
        if (!elem1 || !elem2) {
            return false;
        }

        const $type1: FreType = this.inferType(elem1);
        const $type2: FreType = this.inferType(elem2);
        if (!$type1 || !$type2) {
            return false;
        }

        return this.equals($type1, $type2);
    }

    /**
     * Returns a list of types: one for each element of 'inlist',
     * if this type is not yet present in the result.
     * @param inlist
     * @private
     */
    private elementListToTypeList(inlist: FreNode[]): FreType[] {
        const typelist: FreType[] = [];
        for (const elem of inlist) {
            ArrayUtil.addIfNotPresent<FreType>(typelist, this.inferType(elem));
        }
        return typelist;
    }
}

// export class Composite<PART> {
//     private typers: PART[] =[];
//     name: string = "";
//
//     constructor(name: string) {
//         this.name = name;
//     }
//
//     appendTyper(t: PART) {
//         this.typers.push(t)
//     }
//
//     insertTyper(t: PART) {
//         this.typers.splice(0, 0, t);
//     }
// }
