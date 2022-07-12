/// <reference types="svelte" />

// Make click-outside working without the following TS error:
//     Error: Type '{ onclick_outside: () => void;
//                    id: string; onkeydown: (e: KeyboardEvent) => void;
//                    onkeypress: (e: KeyboardEvent) => void;
//                    oninput: (event: Event) => any;
//                    onfocus: (e: FocusEvent) => void;
//                    onfocusin: (e: FocusEvent) => void;
//                    onclick: (e: MouseEvent) => void;
//                    style: string;
//                  }' is not assignable to type 'HTMLProps<HTMLDivElement>'.
//       Property 'onclick_outside' does not exist on type 'HTMLProps<HTMLDivElement>'. (ts)

// Make custom event working without the following TS error:
// Property 'onpiItemSelected' does not exist on type 'HTMLProps<HTMLDivElement>'.

declare type DndEvent = import("svelte-dnd-action").DndEvent;
declare namespace svelte.JSX {
    interface HTMLProps<T> {
        onclick_outside?: () => void;
        onpiItemSelected?: (event: CustomEvent<DndEvent> & {target: EventTarget & T}) => void;
    }
}
