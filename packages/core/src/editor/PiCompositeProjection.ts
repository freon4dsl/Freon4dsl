import { observable, makeObservable } from "mobx";
import { PiElement } from "../language";
import { Box, LabelBox, OrderedList, PiProjection } from "./internal";

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
            projections: observable
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

    addProjection(p: PiProjection) {
        this.projections.add(p.name, p);
        p.rootProjection = this; //(!!this.rootProjection ? this : this.rootProjection);
    }

    projectiontoFront(name: string) {
        this.projections.toFront(name);
    }

    projectionToBack(name: string) {
        this.projections.toBack(name);
    }

    projectionNames(): string[] {
        return this.projections.toArray().map(p => p.name);
    }
}
