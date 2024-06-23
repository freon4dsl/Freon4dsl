import { SvelteComponent } from "svelte";
import { type AbstractChoiceBox, FreEditor } from "@freon4dsl/core";
declare const __propDef: {
    props: {
        box: AbstractChoiceBox;
        editor: FreEditor;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type TextDropdownComponentProps = typeof __propDef.props;
export type TextDropdownComponentEvents = typeof __propDef.events;
export type TextDropdownComponentSlots = typeof __propDef.slots;
export default class TextDropdownComponent extends SvelteComponent<TextDropdownComponentProps, TextDropdownComponentEvents, TextDropdownComponentSlots> {
}
export {};
//# sourceMappingURL=TextDropdownComponent.svelte.d.ts.map