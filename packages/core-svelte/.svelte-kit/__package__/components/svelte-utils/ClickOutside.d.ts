/**
 * Svelte action to catch a click outside a certain node.
 * Will raise a custom event name "click_outside" on the node.
 *
 * @see https://svelte.dev/repl/dae848c2157e48ab932106779960f5d5?version=3.19.2
 *
 * @param node
 * @param boolean If true, this action is active, it will add an eventlistener for the click outside.
 *                if false, it will not create an event listener, or remove the existing one.
 */
export declare function clickOutsideConditional(node: any, { enabled: boolean }: {
    enabled: any;
}): {
    update: ({ enabled }: {
        enabled: any;
    }) => void;
    destroy(): void;
};
//# sourceMappingURL=ClickOutside.d.ts.map