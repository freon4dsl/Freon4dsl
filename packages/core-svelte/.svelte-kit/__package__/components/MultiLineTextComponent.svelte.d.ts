import { SvelteComponent } from "svelte";
import { FreEditor, MultiLineTextBox } from "@freon4dsl/core";
declare const __propDef: {
    props: {
        box: MultiLineTextBox;
        editor: FreEditor;
        text: string;
        setFocus?: (() => Promise<void>) | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type MultiLineTextComponentProps = typeof __propDef.props;
export type MultiLineTextComponentEvents = typeof __propDef.events;
export type MultiLineTextComponentSlots = typeof __propDef.slots;
export default class MultiLineTextComponent extends SvelteComponent<MultiLineTextComponentProps, MultiLineTextComponentEvents, MultiLineTextComponentSlots> {
    get setFocus(): () => Promise<void>;
}
export {};
//# sourceMappingURL=MultiLineTextComponent.svelte.d.ts.map