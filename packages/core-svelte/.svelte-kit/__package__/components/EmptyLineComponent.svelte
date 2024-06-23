<script>import { componentId } from "./svelte-utils/index.js";
export let box;
let id = !!box ? componentId(box) : "emptyline-for-unknown-box";
</script>

<span id="{id}" >
    <br>
</span>

