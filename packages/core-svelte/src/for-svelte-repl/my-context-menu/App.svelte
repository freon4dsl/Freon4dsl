<script>
    // 	import CustomMenu from './CustomMenu.svelte';
    import Step from './Step.svelte'

    let steps = [{name:"One", isRed:false},
        {name:"Two", isRed:false},
        {name:"Three", isRed:false},
        {name:"Four", isRed:false},
        {name:"Five", isRed:false}
    ]
</script>

<h1>
    Context Menu
</h1>

<p>
    Right-click on a steps and choose the action
</p>

<div class="XXX">
    {#each steps as step}
        <Step step="{step}" bind:steps={steps}/>
    {/each}
</div>

<style>
    .XXX {
        margin-left: 30px;
    }
</style>
