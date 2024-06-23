import { SvelteComponent } from "svelte";
import { GridBox, type FreEditor, GridCellBox } from "@freon4dsl/core";
declare const __propDef: {
    props: {
        grid: GridBox;
        cellBox: GridCellBox;
        editor: FreEditor;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type GridCellComponentProps = typeof __propDef.props;
export type GridCellComponentEvents = typeof __propDef.events;
export type GridCellComponentSlots = typeof __propDef.slots;
export default class GridCellComponent extends SvelteComponent<GridCellComponentProps, GridCellComponentEvents, GridCellComponentSlots> {
}
export {};
//# sourceMappingURL=GridCellComponent.svelte.d.ts.map