<Dialog width="80%"  bind:visible>
    <div slot="title" class="title">About ProjectIt</div>

    <div class="content" >
        ProjectIt is an open source project which can be found at:
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
            <div align="center" >
                <a href="http://openmodeling.nl/" target="_blank">
                    www.openmodeling.nl.
                </a>
            </div>
    </div>
    <hr>

    <div slot="actions" class="actions center">
        <Button color="primary" on:click={() => handleSubmit()}>Ok</Button>
    </div>

</Dialog>

<script>
    import {Button, Dialog} from 'svelte-mui';
    import {versionNumber} from "../menu-ts-files/WebappStore";

    export let visible = false;

    const handleSubmit = () => {
        visible = false;
    }
</script>

<style>
    .content{
        color: var(--pi-darkblue);
    }
    .actions{
        color: var(--pi-darkblue);
    }
    .center{
        color: var(--pi-darkblue);
    }
</style>
