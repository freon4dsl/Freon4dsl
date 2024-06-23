import { SvelteComponent } from "svelte";
import { OptionalBox, type FreEditor } from "@freon4dsl/core";
declare const __propDef: {
    props: {
        box: OptionalBox;
        editor: FreEditor;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type OptionalComponentProps = typeof __propDef.props;
export type OptionalComponentEvents = typeof __propDef.events;
export type OptionalComponentSlots = typeof __propDef.slots;
export default class OptionalComponent extends SvelteComponent<OptionalComponentProps, OptionalComponentEvents, OptionalComponentSlots> {
}
export {};
//# sourceMappingURL=OptionalComponent.svelte.d.ts.map