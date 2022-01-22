import { observable, makeObservable, action } from "mobx";
import { PiElement } from "../language";
import { Box, BoxFactory, LabelBox, OrderedList, PiProjection } from "./internal";
import { PiTableDefinition } from "./PiTables";
import { Language } from "../storage";

export class PiCompositeProjection implements PiProjection {
    private projections: OrderedList<PiProjection> = new OrderedList<PiProjection>();
    private _rootProjection: PiProjection | null = null;
    name: string = "";

    set rootProjection(p: PiCompositeProjection) {
        this._rootProjection = p;
        this.projections.toArray().forEach(child => (child.element.rootProjection = p));
    }

    constructor(name?: string) {
        if (!!name) {
            this.name = name;
        }
        makeObservable<PiCompositeProjection, "projections">(this, {
            projections: observable,
            projectionToBack: action,
            projectiontoFront: action,
            addProjection: action
        });
    }

    getBox(element: PiElement): Box {
        for (let p of this.projections.toArray()) {
            const result: Box = p.element.getBox(element);
            if (result !== null) {
                return result;
            }
        }
        // return a default box if nothing has been  found.
        return new LabelBox(element, "unknown-projection", () => "unknown box for " + element);
    }

    getNamedBox(element: PiElement, projectionName: string): Box {
        const proj = this.projections.getByName(projectionName);
        if (!!proj) {
            const result: Box = proj.element.getBox(element);
            if (result !== null) {
                return result;
            }
        }
        // return the default box if nothing has been found.
        return this.getBox(element);
    }

    getTableDefinition(conceptName: string): PiTableDefinition {
        for (let p of this.projections.toArray()) {
            const result = p.element.getTableDefinition(conceptName);
            if (result !== null) {
                return result;
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
        this.projections.add(p.name, p);
        p.rootProjection = this; //(!!this.rootProjection ? this : this.rootProjection);
    }

    projectiontoFront(name: string) {
        BoxFactory.clearCaches();
        this.projections.toFront(name);
    }

    projectionToBack(name: string) {
        BoxFactory.clearCaches();
        this.projections.toBack(name);
    }

    projectionNames(): string[] {
        return this.projections.toArray().map(p => p.name);
    }

    checkSuper(nameOfSuper: string, elementName: string ): boolean {
        // find the names of the subclasses of 'nameOfSuper'
        const myConcept = Language.getInstance().concept(nameOfSuper);
        let names: string[] = [];
        if (!!myConcept) {
            names = myConcept.subConceptNames;
        } else {
            names = Language.getInstance().interface(nameOfSuper)?.subConceptNames;
        }
        // now search the names for 'elementName'
        let result: boolean = false;
        if (!!names && names.length > 0) {
            result = names.includes(elementName);
            if (!result) { // do recursive
                myConcept.subConceptNames.forEach(n => {
                    if (this.checkSuper(n, elementName)) { // to avoid overwriting 'result' with next element
                        result = true;
                    }
                });
            }
        }
        return result;
    }
}
