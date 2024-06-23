import { SvelteComponent } from "svelte";
import { OptionalBox2, type FreEditor } from "@freon4dsl/core";
declare const __propDef: {
    props: {
        box: OptionalBox2;
        editor: FreEditor;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type OptionalComponentNewProps = typeof __propDef.props;
export type OptionalComponentNewEvents = typeof __propDef.events;
export type OptionalComponentNewSlots = typeof __propDef.slots;
export default class OptionalComponentNew extends SvelteComponent<OptionalComponentNewProps, OptionalComponentNewEvents, OptionalComponentNewSlots> {
}
export {};
//# sourceMappingURL=OptionalComponentNew.svelte.d.ts.map