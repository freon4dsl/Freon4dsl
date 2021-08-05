<Dialog width="50%"  bind:visible={$helpDialogVisible}>
    <div slot="title" class="title">Help for ProjectIt</div>

    <div class="content">
    Currently there is no in-build help functionality. We refer you to our website:
        <br>
        <br>
        <a href="http://www.projectit.org/" target="_blank">
            www.projectit.org
        </a>
    </div>

    <div slot="actions" class="actions center">
        <Button color="var(--color)" on:click={() => handleSubmit()}>Ok</Button>
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
        color: var(--color);
        text-align: center;
        margin: auto;
    }
    .actions{
        color: var(--color);
    }
    .title {
        color: var(--inverse-color);
    }
    a{
        color: var(--color);
        text-decoration: underline;
    }
</style>
