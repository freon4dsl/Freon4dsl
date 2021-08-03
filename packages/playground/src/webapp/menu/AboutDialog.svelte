<Dialog width="100%" bind:visible>
    <div slot="title" class="dialog-title">About ProjectIt</div>

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
                <a href="http://openmodeling.nl/" target="_blank">
                    www.openmodeling.nl.
                </a>
    </div>
    <hr>

    <div slot="actions" class="actions center">
        <Button on:click={() => handleSubmit()}>Ok</Button>
    </div>

</Dialog>

<script>
    import {Button, Dialog} from 'svelte-mui';
    import {versionNumber} from "../WebappStore";

    export let visible = false;

    const handleSubmit = () => {
        visible = false;
    }
</script>

<style>
    .dialog-title{
        color: var(--inverse-color);
        background-color: var(--bg-app-bar);
    }
    .content{
        color: var(--pi-darkblue);
    }
    a{
        color: var(--pi-darkblue);
        text-decoration: underline;
    }
    /*.actions center{*/
    /*    color: var(--pi-darkblue);*/
    /*}*/
</style>
