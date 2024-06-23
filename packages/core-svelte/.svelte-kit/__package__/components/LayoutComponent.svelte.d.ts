import { SvelteComponent } from "svelte";
import { FreEditor, LayoutBox } from "@freon4dsl/core";
declare const __propDef: {
    props: {
        box: LayoutBox;
        editor: FreEditor;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type LayoutComponentProps = typeof __propDef.props;
export type LayoutComponentEvents = typeof __propDef.events;
export type LayoutComponentSlots = typeof __propDef.slots;
export default class LayoutComponent extends SvelteComponent<LayoutComponentProps, LayoutComponentEvents, LayoutComponentSlots> {
}
export {};
//# sourceMappingURL=LayoutComponent.svelte.d.ts.map