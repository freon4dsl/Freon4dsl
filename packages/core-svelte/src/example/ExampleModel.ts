import { Entity } from "./language/gen/Entity";
import { ExModel } from "./language/gen/ExModel";

export function createModel(): ExModel {
    const result = new ExModel();
    result.name = "My First Svelte Example Moddel";
    const e1 = new  Entity();
    e1.name = "SvelteEntity"
    result.entities.push(e1)
    return result;
}
