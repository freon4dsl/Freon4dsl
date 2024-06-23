import { SvelteComponent } from "svelte";
import { FreEditor, Box } from "@freon4dsl/core";
declare const __propDef: {
    props: {
        box?: Box | undefined;
        editor: FreEditor;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type RenderComponentProps = typeof __propDef.props;
export type RenderComponentEvents = typeof __propDef.events;
export type RenderComponentSlots = typeof __propDef.slots;
export default class RenderComponent extends SvelteComponent<RenderComponentProps, RenderComponentEvents, RenderComponentSlots> {
}
export {};
//# sourceMappingURL=RenderComponent.svelte.d.ts.map