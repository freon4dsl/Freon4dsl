import { Entity } from "../example/language/gen/Entity";
import { ExModel } from "../example/language/gen/ExModel";
import { currentModelName } from "./menu-ts-files/WebappStore";

export function createModel(): ExModel {
    console.log("createModel called");
    const result = new ExModel();
    result.name = "My First Svelte Example Model";
    console.log("setting model name");
    currentModelName.set(result.name);
    const e1 = new  Entity();
    e1.name = "SvelteEntity"
    result.entities.push(e1)
    return result;
}
