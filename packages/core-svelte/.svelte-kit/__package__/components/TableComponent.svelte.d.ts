import { SvelteComponent } from "svelte";
/**
     * This component shows a list of elements that have the same type (a 'true' list) as
     * a table. It can be shown row-based or column-based, both are displayed as a grid.
     * This component functions as a drop zone for dragged elements from either a ListComponent
     * or a TableCellComponent.
     */
import { type TableBox, type FreEditor } from "@freon4dsl/core";
declare const __propDef: {
    props: {
        box: TableBox;
        editor: FreEditor;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type TableComponentProps = typeof __propDef.props;
export type TableComponentEvents = typeof __propDef.events;
export type TableComponentSlots = typeof __propDef.slots;
export default class TableComponent extends SvelteComponent<TableComponentProps, TableComponentEvents, TableComponentSlots> {
}
export {};
//# sourceMappingURL=TableComponent.svelte.d.ts.map