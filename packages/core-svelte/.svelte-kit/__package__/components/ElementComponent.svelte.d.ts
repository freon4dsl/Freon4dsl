import { SvelteComponent } from "svelte";
import { type FreEditor, ElementBox } from "@freon4dsl/core";
declare const __propDef: {
    props: {
        box: ElementBox;
        editor: FreEditor;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type ElementComponentProps = typeof __propDef.props;
export type ElementComponentEvents = typeof __propDef.events;
export type ElementComponentSlots = typeof __propDef.slots;
export default class ElementComponent extends SvelteComponent<ElementComponentProps, ElementComponentEvents, ElementComponentSlots> {
}
export {};
//# sourceMappingURL=ElementComponent.svelte.d.ts.map