import { PiLangClass, PiLangElement, PiLangEnumExp, PiLangExp, PiLangSelfExp } from "../languagedef/metalanguage";

    // As in the WalkerTemplate,
    // the entries for the unparse${concept.name} must be sorted,
    // because an entry for a subclass must preceed an entry for
    // its base class, otherwise only the unparse${concept.name} for
    // the base class will be called.
    // TODO change description
    export function sortClasses(piclasses: PiLangClass[]) : PiLangClass[] {
        let newList : PiLangClass[] = [];
        for (let c of piclasses) {
            // without base must be last
            if ( !c.base ) {
                newList.push(c);
            }
        }
        while (newList.length < piclasses.length) { 
            for (let c of piclasses) {
                if ( c.base ) {
                    // push c before c.base
                    if (newList.includes(c.base.referedElement())) {
                        newList.unshift(c);
                    }
                }
            }
        }
        return newList;
    }

    export function isPrimitiveType(type: PiLangElement): boolean {
        return (type.name === "string" || type.name === "number" || type.name === "boolean")
    }

    export function langRefToTypeScript(ref: PiLangExp): string {
    // console.log(" generating " + ref.toPiString());
    if (ref instanceof PiLangEnumExp) {
        return `${ref.sourceName}.${ref.appliedfeature}`;
    } else if (ref instanceof PiLangSelfExp) {
        return `modelelement.${ref.appliedfeature.toPiString()}`;
    } else {
        return ref.toPiString();
    }
}
