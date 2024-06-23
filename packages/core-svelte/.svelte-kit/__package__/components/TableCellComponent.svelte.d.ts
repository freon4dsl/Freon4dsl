import { SvelteComponent } from "svelte";
/**
     * This component show a single cell in a TableComponent. It supports drag and drop,
     * in so far that when dragged, the model element, that is the parent of the part that is
     * shown in this table cell, is the element being dragged, not the part displayed in the cell.
     * When used as drop zone, a custom event is dispatched to the parent table, which then
     * handles the drop.
     */
import { type FreEditor, TableCellBox } from "@freon4dsl/core";
declare const __propDef: {
    props: {
        box: TableCellBox;
        editor: FreEditor;
        parentComponentId: string;
        parentOrientation: string;
        myMetaType: string;
    };
    events: {
        dropOnCell: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type TableCellComponentProps = typeof __propDef.props;
export type TableCellComponentEvents = typeof __propDef.events;
export type TableCellComponentSlots = typeof __propDef.slots;
export default class TableCellComponent extends SvelteComponent<TableCellComponentProps, TableCellComponentEvents, TableCellComponentSlots> {
}
export {};
//# sourceMappingURL=TableCellComponent.svelte.d.ts.map