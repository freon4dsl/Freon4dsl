import { observable, makeObservable, action } from "mobx";
import { PiElement } from "../ast";
import { Box, BoxFactory, LabelBox } from "./internal";
import { PiTableDefinition } from "./PiTables";
import { Language } from "../language";
import { OldPiProjection } from "./OldPiProjection";

export class OldPiCompositeProjection implements OldPiProjection {
    private projections: Map<string, OldPiProjection> = new Map<string, OldPiProjection>();
    private _rootProjection: OldPiProjection | null = null;
    name: string = "";
    isEnabled: boolean = true;

    set rootProjection(p: OldPiCompositeProjection) {
        this._rootProjection = p;
        for(let child of this.projections.values()) {
            child.rootProjection = p;
        }
    }

    constructor(name?: string) {
        if (!!name) {
            this.name = name;
        }
        makeObservable<OldPiCompositeProjection, "projections">(this, {
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

    addProjection(p: OldPiProjection) {
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


}
