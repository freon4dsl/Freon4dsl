<script>
    import { getContext } from "svelte";
    const { theme, toggle } = getContext("theme");
</script>

<button on:click={toggle}
 class="but">{$theme.name}</button>
<style>
    .but {
        color: var(--theme-buttontext);
    }
</style>
