import {ComponentType} from "svelte";

/**
 * The type 'FreExternal' couples a custom (or external) component to a certain box kind.
 * This enables the Freon RenderComponent to pick the right component to render when it encounters
 * a box of that kind.
 */
export type FreExternal = {
    component: ComponentType;
    boxKind: string
};

const customMap = new Map<string, ComponentType>()

/**
 * To be used in main part of starter package
 * @param externals
 */
export function setCustomComponents(externals: FreExternal[]) {
    // todo add some checks on externals === empty and vars.boxKind not present
    externals.forEach(ext => customMap.set(ext.boxKind, ext.component));
}

/**
 * To be used in RenderComponent, not in starter package
 * @param boxKind
 */
export function findCustomComponent(boxKind: string): ComponentType {
    return customMap.get(boxKind);
}

/**
 * To be used in RenderComponent, not in starter package
 * @param boxKind
 */
export function isCustomComponent(boxKind: string): boolean {
    return customMap.has(boxKind);
}
