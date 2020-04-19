import { PiElement } from "../language";
import { Box, LabelBox } from "./boxes";
import { OrderedList } from "./OrderedList";
import { PiProjection } from "./PiProjection";

export class CompositeProjection implements PiProjection {
    private projections: OrderedList<PiProjection> = new OrderedList<PiProjection>();
    private _rootProjection: PiProjection | null = null;

    set rootProjection(p: CompositeProjection) {
        this._rootProjection = p;
        this.projections.toArray().forEach(child => (child.element.rootProjection = p));
    }

    constructor() {}

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

    addProjection(name: string, p: PiProjection) {
        this.projections.add(name, p);
        p.rootProjection = this; //(!!this.rootProjection ? this : this.rootProjection);
    }

    projectiontoFront(name: string) {
        this.projections.toFront(name);
    }

    projectionToBack(name: string) {
        this.projections.toBack(name);
    }
}
