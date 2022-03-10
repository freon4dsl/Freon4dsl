import { ScoperTestDefaultWorker } from "../utils/gen";
import { DSmodel, DSprivate, DSpublic, DSref, DSunit, PiElementReference } from "../language/gen";

// This class creates a series of references with correct pathnames
// All pathnames contain at most three single names.

export class RefCreator extends ScoperTestDefaultWorker {
    references: PiElementReference<DSref>[] = [];

    /**
     * Visits 'modelelement' before visiting its children.
     * @param modelelement
     */
    public execBeforeDSunit(modelelement: DSunit): boolean {
        const modelName = (modelelement.piOwnerDescriptor().owner as DSmodel).name;
        const unitName = modelelement.name;
        modelelement.dsPublics.forEach(pub => {
            this.references.push(PiElementReference.create<DSref>([unitName, pub.name], "DSref"));
            this.references.push(PiElementReference.create<DSref>([pub.name], "DSref"));
        });
        modelelement.dsPrivates.forEach(pub => {
            this.references.push(PiElementReference.create<DSref>([unitName, pub.name], "DSref"));
            this.references.push(PiElementReference.create<DSref>([pub.name], "DSref"));
        })
        return false;
    }

    /**
     * Visits 'modelelement' before visiting its children.
     * @param modelelement
     */
    public execBeforeDSpublic(modelelement: DSpublic): boolean {
        this.createCorrect(modelelement);
        // this.createInCorrect(modelelement);
        return false;
    }

    private createCorrect(modelelement: DSpublic) {
        const grandparentName = (modelelement.piOwnerDescriptor().owner as DSmodel).name;
        const parentName = modelelement.name;
        modelelement.conceptParts.forEach(pub => {
            this.references.push(PiElementReference.create<DSref>([grandparentName, parentName, pub.name], "DSref"));
            this.references.push(PiElementReference.create<DSref>([parentName, pub.name], "DSref"));
            this.references.push(PiElementReference.create<DSref>([pub.name], "DSref"));
        });
        modelelement.conceptPrivates.forEach(pub => {
            this.references.push(PiElementReference.create<DSref>([grandparentName, parentName, pub.name], "DSref"));
            this.references.push(PiElementReference.create<DSref>([parentName, pub.name], "DSref"));
            this.references.push(PiElementReference.create<DSref>([pub.name], "DSref"));
        });
    }

    private createInCorrect(modelelement: DSpublic) {
        const grandparentName = (modelelement.piOwnerDescriptor().owner as DSmodel).name;
        const parentName = modelelement.name;
        modelelement.conceptParts.forEach(pub => {
            this.references.push(PiElementReference.create<DSref>([parentName, pub.name, grandparentName], "DSref"));
            this.references.push(PiElementReference.create<DSref>([pub.name, grandparentName], "DSref"));
        });
        modelelement.conceptPrivates.forEach(pub => {
            this.references.push(PiElementReference.create<DSref>([parentName, pub.name, grandparentName], "DSref"));
            this.references.push(PiElementReference.create<DSref>([pub.name, grandparentName], "DSref"));
        });
    }
    /**
     * Visits 'modelelement' before visiting its children.
     * @param modelelement
     */
    public execBeforeDSprivate(modelelement: DSprivate): boolean {
        this.createCorrect(modelelement);
        return false;
    }

}
