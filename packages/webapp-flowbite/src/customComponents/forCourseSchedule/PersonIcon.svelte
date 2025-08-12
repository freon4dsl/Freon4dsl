<script lang="ts">
    import { SimpleExternalBox } from "@freon4dsl/core";
    import type { FreComponentProps } from "@freon4dsl/core-svelte";

    // Freon expects both props to be present, even if they are not used.
    // Props
    let { editor, box }: FreComponentProps<SimpleExternalBox> = $props();

</script>

<img src='./customImages/icons8-person-94.png' alt="Icon showing Person" height="30px"/>
