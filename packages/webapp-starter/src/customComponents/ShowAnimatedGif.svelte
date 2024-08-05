<script lang="ts">
    // let src = '/rick-roll-rick-rolled.gif';
    // let name = 'Rick Astley dancing';
    import {Box, FreEditor} from "@freon4dsl/core";

    let src = '/cats-kittens.gif';
    let name = 'Two kittens licking';
    // let src = '/lenny-confetti-hired-kitten.gif';
    // let name = 'Staring kitten';
    export let box: Box;
    export let editor: FreEditor;
</script>

<!-- {src} is short for src={src} -->
<img {src} alt="{name}" />
