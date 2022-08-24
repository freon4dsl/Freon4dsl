/** Dispatch event on click outside of node */
// TODO Should use https://svelte.dev/repl/dae848c2157e48ab932106779960f5d5?version=3.19.2
export function clickOutside(node) {

    const handleClick = event => {
        // console.log('clickOutside: ' + JSON.stringify(event.target) + " " + event.defaultPrevented);
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
            node.dispatchEvent(
                new CustomEvent('click_outside', node)
            )
        }
    }

    document.addEventListener('click', handleClick, true);
    document.addEventListener('contextmenu', handleClick, true);

    return {
        destroy() {
            document.removeEventListener('click', handleClick, true);
        }
    }
}
