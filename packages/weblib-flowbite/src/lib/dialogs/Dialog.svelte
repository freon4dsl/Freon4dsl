<script  lang="ts">
    import { dialogClosed, WebappConfigurator } from '$lib';

    /**
     *  Dialog component for use in flowbite webapp.
     */
    import type { DialogProps } from "$lib/language/DialogHelpers"

    let { children, open }: DialogProps = $props()
    
    let dialog: HTMLDialogElement
    
    $effect( () => {
        if (open) {
            dialog.showModal()
        } else {
            dialog.close()
            WebappConfigurator.getInstance().langEnv?.editor?.selectionChanged()
        }
    })

    /**
     * Closes the dialog when clicked outside the content
     * @param event
     */
    function clicked(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            dialog.close();
            // also correct the state in the store
            dialogClosed();
        }
    }
</script>

<div class="w-full text-light-base-900 dark:text-dark-base-50 bg-light-base-100 dark:bg-dark-base-800">
    <dialog bind:this={dialog} class="backdrop:bg-black/80 open:flex flex-col max-h-[90hv] rounded-lg divide-y text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-800 divide-gray-300 dark:divide-gray-700 pointer-events-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-2xl w-full bg-light-base-100 dark:bg-dark-base-800"
            tabindex="-1"
    onclick={clicked}>
        <div class="p-4 text-light-base-900 dark:text-dark-base-50">
            {@render children()}
        </div>
    </dialog>
</div>

