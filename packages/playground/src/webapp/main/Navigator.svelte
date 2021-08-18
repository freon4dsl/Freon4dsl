<div class="navigator">
    {$currentModelName}
    <ul class="list">
        {#each $unitTypes as name}
            <li class="item-name">unit type <i>{name}</i>
                <ul class="bullet-list">
                    {#each $units as unit}
                        <li class="item-name"><i>{unit.name}</i></li>
                    {/each}
                </ul>
            </li>
        {/each}
    </ul>
</div>

<script>
    import { unitTypes, units } from "../WebappStore";
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
        padding-left: 12px;
    }
    .bullet-list {
        list-style-type: square;
        padding-left: 18px;
    }
</style>
