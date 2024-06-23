import { SvelteComponent } from "svelte";
import { type GridBox, type FreEditor } from "@freon4dsl/core";
declare const __propDef: {
    props: {
        box: GridBox;
        editor: FreEditor;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type GridComponentProps = typeof __propDef.props;
export type GridComponentEvents = typeof __propDef.events;
export type GridComponentSlots = typeof __propDef.slots;
export default class GridComponent extends SvelteComponent<GridComponentProps, GridComponentEvents, GridComponentSlots> {
}
export {};
//# sourceMappingURL=GridComponent.svelte.d.ts.map