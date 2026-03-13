<script lang="ts">
    import { dialogClosed, WebappConfigurator } from "$lib";
    import type { DialogProps } from "$lib/language/DialogHelpers";

    let { children, open }: DialogProps = $props();

    let dialog: HTMLDialogElement;

    $effect(() => {
        if (!dialog) return;

        if (open) {
            if (!dialog.open) {
                dialog.showModal();
            }
        } else {
            if (dialog.open) {
                dialog.close();
            }
            WebappConfigurator.getInstance().langEnv?.editor?.selectionChanged();
        }
    });

    function clicked(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            if (dialog.open) {
                dialog.close();
            }
            // also correct the state in the store
            dialogClosed();
        }
    }
</script>

<div class="freon-dialog-host">
    <dialog
        bind:this={dialog}
        class="freon-dialog-shell"
        tabindex="-1"
        onclick={clicked}
    >
        <div class="freon-dialog-content">
            {@render children()}
        </div>
    </dialog>
</div>
