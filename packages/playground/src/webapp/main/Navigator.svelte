<div class="navigator">
    Model {$currentModelName}
    <ul class="list">
        {#each $unitTypes as name}
            <li class="item-name">units of type <i>{name}:</i></li>
        {/each}
    </ul>
</div>

<script>
    import { unitTypes } from "../WebappStore";
    import { currentModelName } from "../WebappStore";
</script>

<style>
    .navigator {
        color: var(--color);
        font-size: var(--error-font-size);
        padding: 6px;
    }
    .list {
        list-style-type: none;
        padding-left: 16px;
    }
</style>
