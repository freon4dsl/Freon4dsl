import { SvelteComponent } from "svelte";
import type { SvgBox } from "@freon4dsl/core";
declare const __propDef: {
    props: {
        box: SvgBox;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type SvgComponentProps = typeof __propDef.props;
export type SvgComponentEvents = typeof __propDef.events;
export type SvgComponentSlots = typeof __propDef.slots;
export default class SvgComponent extends SvelteComponent<SvgComponentProps, SvgComponentEvents, SvgComponentSlots> {
}
export {};
//# sourceMappingURL=SvgComponent.svelte.d.ts.map