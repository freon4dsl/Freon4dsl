import { SvelteComponent } from "svelte";
import { FreEditor, TextBox } from "@freon4dsl/core";
declare const __propDef: {
    props: {
        box: TextBox;
        editor: FreEditor;
        isEditing?: boolean | undefined;
        partOfActionBox?: boolean | undefined;
        text: string;
        setFocus?: (() => Promise<void>) | undefined;
    };
    events: {
        startEditing: CustomEvent<any>;
        textUpdate: CustomEvent<any>;
        endEditing: CustomEvent<any>;
        onFocusOutText: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type TextComponentProps = typeof __propDef.props;
export type TextComponentEvents = typeof __propDef.events;
export type TextComponentSlots = typeof __propDef.slots;
export default class TextComponent extends SvelteComponent<TextComponentProps, TextComponentEvents, TextComponentSlots> {
    get setFocus(): () => Promise<void>;
}
export {};
//# sourceMappingURL=TextComponent.svelte.d.ts.map