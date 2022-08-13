<script>
    import Step from './Step.svelte'
    export let steps = []
</script>


<ul>
    {#each steps as step}
        <Step step="{step}" bind:steps={steps}/>
    {/each}
</ul>
