<script lang="ts">
    import Card from '@smui/card';
    import {RenderComponent} from "@freon4dsl/core-svelte";
    import {Box, FreEditor} from "@freon4dsl/core";
    export let box: Box;
    export let editor: FreEditor;

</script>

<Card>
        {#each box.children as childBox}
            <div id="ssss">
                <RenderComponent box={childBox} editor={editor} />
            </div>
        {/each}
</Card>
