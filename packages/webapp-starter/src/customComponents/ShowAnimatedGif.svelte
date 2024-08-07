<script lang="ts">

    import {ExternalBox, FreEditor} from "@freon4dsl/core";

    let src1 = '/cats-kittens.gif';
    let name1 = 'Two kittens licking';
    let src2 = '/rick-roll-rick-rolled.gif';
    let name2 = 'Rick Astley dancing';
    let src3 = '/lenny-confetti-hired-kitten.gif';
    let name3 = 'Staring kitten';
    export let box: ExternalBox;
    export let editor: FreEditor;

    let src;
    let name;

    let nrOfSrc: number = Number.parseInt(box.findParam("number"));
    switch (nrOfSrc) {
        case 1: {
            src = src1;
            name = name1;
            break;
        }
        case 2: {
            src = src2;
            name = name2;
            break;
        }
        case 3: {
            src = src3;
            name = name3;
            break;
        }
    }

</script>

<!-- {src} is short for src={src} -->
<img {src} alt="{name}" />
