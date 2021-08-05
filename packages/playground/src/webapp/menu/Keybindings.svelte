<Dialog width="80%"  bind:visible={$keybindingsDialogVisible}>
    <div slot="title" class="title">Keybindings</div>

    <ul class="keybinding">
        <li>Arrow Keys move in the expected direction</li>
        <li>TAB key moves to next place where the user can type something</li>
        <li>Ctrl-UP selects the parent element in the AST</li>
        <li>Ctrl-DOWN selects the first child element in the AST</li>
        <li>Ctrl-SPACE shows popup menu of possible options</li>
        <li>DEL deletes the next character or the currently selected item from the AST</li>
    </ul>

    <div slot="actions" class="actions center">
        <Button color="var(--inverse-color)" on:click={() => handleSubmit()}>Ok</Button>
    </div>

</Dialog>

<script>
    import {Button, Dialog} from 'svelte-mui';
    import {keybindingsDialogVisible} from "../WebappStore";

    const handleSubmit = () => {
        $keybindingsDialogVisible = false;
    }
</script>

<style>
    .keybinding {
        color: var(--inverse-color);
    }
    .keybinding li {
        padding: 10px;
    }
    .actions{
        color: var(--inverse-color);
    }
    .center{
        color: var(--inverse-color);
    }
    .title{
        color: var(--inverse-color);
    }
</style>
