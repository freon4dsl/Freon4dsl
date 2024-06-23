import { SvelteComponent } from "svelte";
import { ListBox, FreEditor } from "@freon4dsl/core";
declare const __propDef: {
    props: {
        box: ListBox;
        editor: FreEditor;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type ListComponentProps = typeof __propDef.props;
export type ListComponentEvents = typeof __propDef.events;
export type ListComponentSlots = typeof __propDef.slots;
export default class ListComponent extends SvelteComponent<ListComponentProps, ListComponentEvents, ListComponentSlots> {
}
export {};
//# sourceMappingURL=ListComponent.svelte.d.ts.map