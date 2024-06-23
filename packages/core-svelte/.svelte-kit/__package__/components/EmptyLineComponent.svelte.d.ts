import { SvelteComponent } from "svelte";
/**
     * This component shows an empty line in the projection.
     */
import type { EmptyLineBox } from "@freon4dsl/core";
declare const __propDef: {
    props: {
        box: EmptyLineBox;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type EmptyLineComponentProps = typeof __propDef.props;
export type EmptyLineComponentEvents = typeof __propDef.events;
export type EmptyLineComponentSlots = typeof __propDef.slots;
export default class EmptyLineComponent extends SvelteComponent<EmptyLineComponentProps, EmptyLineComponentEvents, EmptyLineComponentSlots> {
}
export {};
//# sourceMappingURL=EmptyLineComponent.svelte.d.ts.map