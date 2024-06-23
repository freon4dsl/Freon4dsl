import { SvelteComponent } from "svelte";
import { type SelectOption } from "@freon4dsl/core";
declare const __propDef: {
    props: {
        selectedId?: string | undefined;
        options?: SelectOption[] | undefined;
    };
    events: {
        freItemSelected: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type DropdownComponentProps = typeof __propDef.props;
export type DropdownComponentEvents = typeof __propDef.events;
export type DropdownComponentSlots = typeof __propDef.slots;
export default class DropdownComponent extends SvelteComponent<DropdownComponentProps, DropdownComponentEvents, DropdownComponentSlots> {
}
export {};
//# sourceMappingURL=DropdownComponent.svelte.d.ts.map