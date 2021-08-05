<Dialog width="100%" bind:visible={$aboutDialogVisible}>
    <div slot="title" class="title">About ProjectIt</div>

    <div class="content" >
        ProjectIt is an open source project which can be found at:
        <br/>
        <br/>
        <div align="center" >
            <a href="http://projectit.org/" target="_blank">
                www.projectit.org.
            </a>
        </div>
    </div>
    <hr>
    <div class="content">
        <p>Version: {versionNumber} </p>
    </div>
    <hr>
    <div class="content">
        <p> Created by:
                <a href="http://www.openmodeling.nl/" target="_blank">
                    www.openmodeling.nl.
                </a>
    </div>
    <hr>

    <div slot="actions" class="actions center">
        <Button color="var(--color)" on:click={() => handleSubmit()}>Ok</Button>
    </div>

</Dialog>

<script>
    import {Button, Dialog} from 'svelte-mui';
    import {versionNumber, aboutDialogVisible} from "../WebappStore";

    const handleSubmit = () => {
        $aboutDialogVisible = false;
    }
</script>

<style>
    .title {
        color: var(--inverse-color);
    }
    .content{
        color: var(--color);
    }
    a{
        color: var(--color);
        text-decoration: underline;
    }
</style>
