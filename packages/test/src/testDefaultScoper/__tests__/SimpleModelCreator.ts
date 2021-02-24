import { DSmodel, DSpublic, DSprivate, DSref, DSunit, PiElementReference } from "../language/gen";
import { GenericModelSerializer } from "@projectit/core";

export class SimpleModelCreator {
    private breadth = 1;
    private nameNumber: number = 0;
    public allNames: string[] = [];
    private serial: GenericModelSerializer = new GenericModelSerializer();
    private numberOfRefs: number = 0;

    createName(parent: string, type: string): string {
        this.nameNumber += 1;
        // console.log("createName called: " + type + this.nameNumber + "_OF_" + parent);
        this.allNames.push(type + this.nameNumber + "_OF_" + parent);
        return type + this.nameNumber + "_OF_" + parent;
    }

    /**
     * creates a model with 'nrOfUnits' units, where all child nodes are a tree of depth 'depth'
     * without taking into account modelUnit interfaces
     * @param nrOfUnits     must be larger than 0
     * @param depth         must be larger than 0
     */
    public createModel(nrOfUnits: number, depth: number): DSmodel {
        // reset names
        this.nameNumber = 0;
        this.allNames = [];
        this.numberOfRefs = 0;
        // create a new model
        const modelUnits: DSunit[] = [];
        for (let i = 0; i < nrOfUnits; i++) {
            modelUnits.push(this.createUnit("model", depth));
        }
        // add references, after all names have been created
        for (let i = 0; i < nrOfUnits; i++) {
            this.addReferencesToUnit(modelUnits[i]);
        }
        return DSmodel.create({ name: "modelOfDepth" + depth, units: modelUnits });
    }

    /**
     * creates a model with 'nrOfUnits' units, where all child nodes are a tree of depth 'depth'
     * without taking into account modelUnit interfaces
     * @param nrOfUnits     must be equal or larger than 0
     * @param depth         must be equal or larger than 0
     * @param primary       the index of the unit that has the focus, all other units are represented by their interfaces
     *                      note that the following must be true: primary < nrOfUnits
     */
    public createModelWithInterfaces(nrOfUnits: number, depth: number, primary: number): DSmodel {
        // reset names
        this.nameNumber = 0;
        this.allNames = [];
        this.numberOfRefs = 0;
        // create a new model
        if (primary >= nrOfUnits) {
            return null;
        }
        const modelUnits: DSunit[] = [];
        for (let i = 0; i < nrOfUnits; i++) {
            const completeUnit = this.createUnit("model", depth);
            if (i === primary) {
                modelUnits.push(completeUnit);
            } else {
                const serialized = this.serial.convertToJSON(completeUnit, true);
                const unitInterface = this.serial.toTypeScriptInstance(serialized);
                modelUnits.push(unitInterface);
            }
        }
        // add references, after all names have been created
        for (let i = 0; i < nrOfUnits; i++) {
            this.addReferencesToUnit(modelUnits[i]);
        }
        return DSmodel.create({ name: "modelOfDepth" + depth, units: modelUnits });
    }

    createUnit(parent: string, depth: number): DSunit {
        const unitName = this.createName(parent, "unit");
        const dsPublics: DSpublic[] = [];
        for (let i = 0; i < this.breadth; i++) {
            dsPublics.push(this.createPublic(unitName, depth));
        }
        const dsPrivates: DSprivate[] = [];
        for (let i = 0; i < this.breadth; i++) {
            dsPrivates.push(this.createPrivate(unitName, depth));
        }
        return DSunit.create({ name: unitName, dsPublics: dsPublics, dsPrivates: dsPrivates });
    }

    createPublic(parent: string, depth: number): DSpublic {
        const partName = this.createName(parent, "public");
        const { dsPublics, dsPrivates } = this.makePublicsAndPrivates(depth, partName);
        return DSpublic.create({ name: partName, conceptParts: dsPublics, conceptPrivates: dsPrivates });
    }

    createPrivate(parentName: string, depth: number): DSprivate {
        const privateName = this.createName(parentName, "private");
        const { dsPublics, dsPrivates } = this.makePublicsAndPrivates(depth, privateName);
        return DSprivate.create({ name: privateName, conceptParts: dsPublics, conceptPrivates: dsPrivates });
    }

    private makePublicsAndPrivates(depth: number, partName: string) {
        const dsPublics: DSpublic[] = [];
        const dsPrivates: DSprivate[] = [];
        if (depth > 0) {
            for (let i = 0; i < this.breadth; i++) {
                dsPublics.push(this.createPublic(partName, depth - 1));
            }
            for (let i = 0; i < this.breadth; i++) {
                dsPrivates.push(this.createPrivate(partName, depth - 1));
            }
        }
        return { dsPublics, dsPrivates };
    }

    private addReferencesToUnit(dSunit: DSunit) {
        const referedNames = this.allNames;
        for (let i = 0; i < this.breadth * 2; i++) {
            const index = this.makeReferenceIndex();
            if (!!this.allNames[index] && this.allNames[index].length > 0) {
                const someReference: PiElementReference<DSref> = PiElementReference.create<DSref>([this.allNames[index]], "DSref");
                dSunit.dsRefs.push(someReference);
            } else {
                console.log("empty reference for index: " + index + " (length: " + this.allNames.length + ")");
            }
            dSunit.dsPrivates.forEach(part => this.addReferences(part));
            dSunit.dsPublics.forEach(part => this.addReferences(part));
        }
    }

    private addReferences(part: DSprivate) {
        for (let i = 0; i < this.breadth * 2; i++) {
            const index = this.makeReferenceIndex();
            if (!!this.allNames[index] && this.allNames[index].length > 0) {
                const someReference: PiElementReference<DSref> = PiElementReference.create<DSref>(this.allNames[index], "DSref");
                part.conceptRefs.push(someReference);
            } else {
                console.log("empty reference for index: " + index + " (length: " + this.allNames.length + ")");
            }
        }
    }

    /**
     * returns an index number such that the list of all names is traversed from beginning
     * till end multiple times.
     * @private
     */
    private makeReferenceIndex(): number {
        let result: number = this.allNames.length - this.numberOfRefs - 1;

        if (result < 0 || result >= this.allNames.length) {
            this.numberOfRefs = 0;
            // console.log("replacing result " + result + " with " + this.allNames.length);
            result = this.makeReferenceIndex();
        }
        this.numberOfRefs += 1;
        return result;
    }
}
