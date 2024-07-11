<script lang="ts">
    import type { IconBox } from "@freon4dsl/core";
    import { afterUpdate, onMount } from "svelte";
    import { componentId } from "./svelte-utils/index.js";
    import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
    import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

    export let box: IconBox;

    let id: string;
    let iconDef: IconDefinition;
    let css: string = "";

    onMount( () => {
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        box.refreshComponent = refresh;
    });
    const refresh = (why?: string) => {
        id = !!box? componentId(box) : 'icon-for-unknown-box';
        iconDef = box.iconDef;
        css = box.cssClass;
    }

    refresh();
</script>

<FontAwesomeIcon class="w-3 h-3" icon={this.iconDef} />

<style>

</style>
