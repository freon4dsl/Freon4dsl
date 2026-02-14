<script lang="ts">
    let popoverEl: HTMLDivElement;

    function open() {
        popoverEl.showPopover();
    }

    function close() {
        popoverEl.hidePopover();
    }
</script>

<button onclick={open}>
    Show Options
</button>

<div bind:this={popoverEl} popover>
    <p>Extra configuration</p>
    <button onclick={close}>Close</button>
</div>

<style>
    [popover] {
        padding: 1rem;
        border-radius: 6px;
        border: 1px solid #ccc;
        background: white;
    }
</style>
