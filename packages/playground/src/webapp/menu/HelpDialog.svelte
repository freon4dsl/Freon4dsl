<Dialog width="50%"  bind:visible={$helpDialogVisible}>
    <div slot="title" class="title">Help for ProjectIt</div>

    <div class="content">
    <p>Currently there is no in-build help functionality. We refer you to our website.
        <a href="http://projectit.org/" target="_blank">
            www.projectit.org.
        </a>
    </div>

    <div slot="actions" class="actions center">
        <Button color="var(--inverse-color)" on:click={() => handleSubmit()}>Ok</Button>
    </div>

</Dialog>

<script>
    import {Button, Dialog} from 'svelte-mui';
    import {helpDialogVisible} from "../WebappStore";

    const handleSubmit = () => {
        $helpDialogVisible = false;
    }
</script>

<style>
    .content{
        color: var(--inverse-color);
        margin: auto;
    }
    .actions{
        color: var(--inverse-color);
    }
    .center{
        color: var(--inverse-color);
    }
</style>
