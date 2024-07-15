<script lang="ts">
    import type { IconBox } from "@freon4dsl/core";
    import { afterUpdate, onMount } from "svelte";
    import { componentId } from "./svelte-utils/index.js";
    import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
   
    export let box: IconBox;

    let id: string;
    // Assuming a generic type for iconDef. Adjust according to your needs or based on FontAwesome documentation.
    let iconDef: any; 
    let css: string = "";
    let cursorStyle: string = "";

    onMount( () => {
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        box.refreshComponent = refresh;
    });
    const refresh = (why?: string) => {
        id = !!box ? componentId(box) : 'icon-for-unknown-box';
        iconDef = box.iconDef;
        css = box.cssClass;
        cursorStyle = box.cursorStyle || 'default';
    }

    refresh();
</script>

<FontAwesomeIcon class="w-3 h-3" style="cursor: {cursorStyle};" icon={iconDef} />

<style>

</style>
