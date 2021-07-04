import { Box, SvgBox } from "@projectit/core";
import { SvelteAttribute } from "./SvelteAttribute";
import { SvelteEntity } from "./SvelteEntity";
import { SvelteModel } from "./SvelteModel";
import { SvelteModelUnit } from "./SvelteModelUnit";

export function createModel() : SvelteModel {
    const model: SvelteModel = new SvelteModel();
    model.name = "Svelte Model";

    const mu1: SvelteModelUnit = new SvelteModelUnit();
    mu1.name = "model unit 1";
    model.addUnit(mu1);

    const ent1 = new SvelteEntity();
    ent1.name = "Person";
    mu1.entities.push(ent1);

    const ent2 = new SvelteEntity();
    ent2.name = "House";
    mu1.entities.push(ent2);

    const att1 = new SvelteAttribute();
    att1.name = "attribute - 1";
    ent1.attributes.push(att1);

    const att2 = new SvelteAttribute();
    att2.name = "attribute - 2";
    ent2.attributes.push(att2);

    const att3 = new SvelteAttribute();
    att3.name = "attribute 3";
    ent2.attributes.push(att3);

    return model;
}

export function log(s: string): string {
    // console.log(s);
    return "";
}

export function isSvgBox(box: Box): box is SvgBox {
    return box.kind === "SvgBox";
}
