<script lang="ts">
    import {Popover} from 'flowbite-svelte';
    import {RenderComponent} from "@freon4dsl/core-svelte";
    import {Box, FreEditor} from "@freon4dsl/core";
    export let box: Box;
    export let editor: FreEditor;

</script>

{#each box.children as childBox}
    <span id="b1">
        <RenderComponent box={childBox} editor={editor} />
    </span>
    <Popover class="w-64 text-sm font-light" title="Element Info" triggeredBy="#b1">
        This is box ${childBox.$id} showing "${box.element.freLanguageConcept()}.${childBox.propertyName}".
    </Popover>
{/each}
