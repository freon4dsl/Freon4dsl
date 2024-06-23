import { SvelteComponent } from "svelte";
import { MenuItem, FreEditor } from "@freon4dsl/core";
declare const __propDef: {
    props: {
        items: MenuItem[];
        editor: FreEditor;
        show?: ((event: MouseEvent, index: number) => Promise<void>) | undefined;
        hide?: (() => void) | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type ContextMenuProps = typeof __propDef.props;
export type ContextMenuEvents = typeof __propDef.events;
export type ContextMenuSlots = typeof __propDef.slots;
export default class ContextMenu extends SvelteComponent<ContextMenuProps, ContextMenuEvents, ContextMenuSlots> {
    get show(): (event: MouseEvent, index: number) => Promise<void>;
    get hide(): () => void;
    get items(): MenuItem[];
    /**accessor*/
    set items(_: MenuItem[]);
    get editor(): FreEditor;
    /**accessor*/
    set editor(_: FreEditor);
    get undefined(): any;
    /**accessor*/
    set undefined(_: any);
    get undefined(): any;
    /**accessor*/
    set undefined(_: any);
}
export {};
//# sourceMappingURL=ContextMenu.svelte.d.ts.map