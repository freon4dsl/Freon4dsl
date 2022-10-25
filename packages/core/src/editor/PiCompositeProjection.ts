import { observable, makeObservable, action } from "mobx";
import { PiElement } from "../ast";
import { Box, BoxFactory, LabelBox, PiProjection } from "./internal";
import { PiTableDefinition } from "./PiTables";
import { Language } from "../language";

export class PiCompositeProjection implements PiProjection {
    private projections: Map<string, PiProjection> = new Map<string, PiProjection>();
    private _rootProjection: PiProjection | null = null;
    name: string = "";
    isEnabled: boolean = true;

    set rootProjection(p: PiCompositeProjection) {
        this._rootProjection = p;
        for(let child of this.projections.values()) {
            child.rootProjection = p;
        }
    }

    constructor(name?: string) {
        if (!!name) {
            this.name = name;
        }
        makeObservable<PiCompositeProjection, "projections">(this, {
            projections: observable,
            disableProjection: action,
            enableProjection: action,
            addProjection: action
        });
    }

    getBox(element: PiElement): Box {
        for (let p of this.projections.values()) {
            if (p.isEnabled) {
                const result: Box = p.getBox(element);
                if (result !== null) {
                    return result;
                }
            }
        }
        // return a default box if nothing has been  found.
        return new LabelBox(element, "unknown-projection", () => "unknown box for " + element);
    }

    getNamedBox(element: PiElement, projectionName: string): Box {
        const proj = this.projections.get(projectionName);
        if (!!proj) {
            const result: Box = proj.getBox(element);
            if (result !== null) {
                return result;
            }
        }
        // return the default box if nothing has been found.
        return this.getBox(element);
    }

    getTableDefinition(conceptName: string): PiTableDefinition {
        for (let p of this.projections.values()) {
            if (p.isEnabled) {
                const result = p.getTableDefinition(conceptName);
                if (result !== null) {
                    return result;
                }
            }
        }
        // return a default box if nothing has been found.
        return {
            headers: [conceptName],
            cells: [(element: PiElement) => {
                return this.getBox(element);
            }]
        };
    }

    addProjection(p: PiProjection) {
        this.projections.set(p.name, p);
        p.rootProjection = this; //(!!this.rootProjection ? this : this.rootProjection);
    }

    enableProjection(name: string): void {
        BoxFactory.clearCaches();
        console.log("Composite: enabling Projection " + name);
        this.projections.get(name).isEnabled = true;
    }

    disableProjection(name: string): void {
        BoxFactory.clearCaches();
        console.log("Composite: disabling Projection " + name);
        this.projections.get(name).isEnabled = false;
    }

    projectionNames(): string[] {
        return Array.from(this.projections.keys());
    }

    // TODO move to Language.ts
    private checkSuper(nameOfSuper: string, elementName: string ): boolean {
        // find the names of the subclasses of 'nameOfSuper'
        const myConcept = Language.getInstance().concept(nameOfSuper);
        let names: string[] | undefined ;
        if (!!myConcept) {
            names = myConcept.subConceptNames;
        } else {
            names = Language.getInstance().interface(nameOfSuper)?.subConceptNames;
        }
        // now search the names for 'elementName'
        let result: boolean = false;
        if (!!names && names.length > 0) {
            result = names.includes(elementName);
            // NB Below not needed, as subconcepts includes _all_ subconcepts already.
            // if (!result) { // do recursive
            //     myConcept.subConceptNames.forEach(n => {
            //         if (this.checkSuper(n, elementName)) { // to avoid overwriting 'result' with next element
            //             result = true;
            //         }
            //     });
            // }
        }
        return result;
    }
}
