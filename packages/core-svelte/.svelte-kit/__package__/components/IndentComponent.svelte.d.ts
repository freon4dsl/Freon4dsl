import { SvelteComponent } from "svelte";
import type { IndentBox, FreEditor } from "@freon4dsl/core";
declare const __propDef: {
    props: {
        box: IndentBox;
        editor: FreEditor;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type IndentComponentProps = typeof __propDef.props;
export type IndentComponentEvents = typeof __propDef.events;
export type IndentComponentSlots = typeof __propDef.slots;
export default class IndentComponent extends SvelteComponent<IndentComponentProps, IndentComponentEvents, IndentComponentSlots> {
}
export {};
//# sourceMappingURL=IndentComponent.svelte.d.ts.map