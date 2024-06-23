import { SvelteComponent } from "svelte";
/**
     * This component shows a complete projection, by displaying the rootbox of
     * the associated editor.
     */
import { FreEditor } from "@freon4dsl/core";
declare const __propDef: {
    props: {
        editor: FreEditor;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type FreonComponentProps = typeof __propDef.props;
export type FreonComponentEvents = typeof __propDef.events;
export type FreonComponentSlots = typeof __propDef.slots;
export default class FreonComponent extends SvelteComponent<FreonComponentProps, FreonComponentEvents, FreonComponentSlots> {
}
export {};
//# sourceMappingURL=FreonComponent.svelte.d.ts.map