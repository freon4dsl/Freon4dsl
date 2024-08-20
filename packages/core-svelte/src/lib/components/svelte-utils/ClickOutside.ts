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
export function clickOutsideConditional(node, { enabled: boolean }) {
    /**
     * onClick callback method, dispatches a new event when clicked outside the `node`.
     * @param event
     */
    const handleClick = (event) => {
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
            node.dispatchEvent(new CustomEvent("click_outside", node));
        }
    };
    function update({ enabled }) {
        if (enabled) {
            document.addEventListener("click", handleClick, true);
            document.addEventListener("contextmenu", handleClick, true);
        } else {
            document.removeEventListener("click", handleClick, true);
            document.removeEventListener("contextmenu", handleClick, true);
        }
    }

    update({ enabled: boolean });
    return {
        update,
        destroy() {
            document.removeEventListener("click", handleClick, true);
            document.removeEventListener("contextmenu", handleClick, true);
        },
    };
}
