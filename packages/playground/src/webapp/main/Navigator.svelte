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
        color: var(--theme-colors-color);
        font-size: var(--pi-error-font-size);
        padding: 6px;
    }
    .list {
        list-style-type: none;
        padding-left: 16px;
    }
</style>
