import { AstWorker, FreNode, FreNodeReference } from "@freon4dsl/core";
import { DSprivate, DSpublic, DSref, DSunit } from "../language/gen/index.js";

/**
 * For each DSpublic and DSprivate part in the model a reference to the part is created in
 * - All units
 * - All private parts of all units
 * - All public parts of all units
 *
 * Creates _a_lot_ of references
 */
export class RefCreatorWorker implements AstWorker {
    units: DSunit[];

    constructor(units: DSunit[]) {
        this.units = units;
    }

    execAfter(modelelement: FreNode): boolean {
        switch (modelelement.freLanguageConcept()) {
            case "DSpublic": {
                const elem: DSpublic = modelelement as DSpublic;
                this.units.forEach((unit) => {
                    const ref: FreNodeReference<DSref> = FreNodeReference.create<DSref>(elem.name, "DSref");
                    unit.dsRefs.push(ref);
                    unit.dsPrivates.forEach((part) => {
                        const ref: FreNodeReference<DSref> = FreNodeReference.create<DSref>(elem.name, "DSref");
                        part.conceptRefs.push(ref);
                    });
                    unit.dsPublics.forEach((part) => {
                        const ref: FreNodeReference<DSref> = FreNodeReference.create<DSref>(elem.name, "DSref");
                        part.conceptRefs.push(ref);
                    });
                });
                break;
            }
            case "DSprivate": {
                const elem: DSprivate = modelelement as DSprivate;
                const ref: FreNodeReference<DSref> = FreNodeReference.create<DSref>(elem.name, "DSref");
                this.units.forEach((unit) => {
                    const ref: FreNodeReference<DSref> = FreNodeReference.create<DSref>(elem.name, "DSref");
                    unit.dsRefs.push(ref);
                    unit.dsPrivates.forEach((part) => {
                        const ref: FreNodeReference<DSref> = FreNodeReference.create<DSref>(elem.name, "DSref");
                        part.conceptRefs.push(ref);
                    });
                    unit.dsPublics.forEach((part) => {
                        const ref: FreNodeReference<DSref> = FreNodeReference.create<DSref>(elem.name, "DSref");
                        part.conceptRefs.push(ref);
                    });
                });
                break;
            }
        }
        return false;
    }

    execBefore(modelelement: FreNode): boolean {
        return false;
    }
}
