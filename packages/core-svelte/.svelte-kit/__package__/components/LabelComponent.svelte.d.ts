import { SvelteComponent } from "svelte";
import { LabelBox } from "@freon4dsl/core";
declare const __propDef: {
    props: {
        box: LabelBox;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type LabelComponentProps = typeof __propDef.props;
export type LabelComponentEvents = typeof __propDef.events;
export type LabelComponentSlots = typeof __propDef.slots;
export default class LabelComponent extends SvelteComponent<LabelComponentProps, LabelComponentEvents, LabelComponentSlots> {
}
export {};
//# sourceMappingURL=LabelComponent.svelte.d.ts.map