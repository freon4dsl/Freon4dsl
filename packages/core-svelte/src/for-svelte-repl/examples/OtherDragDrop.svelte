<script>
    let name = 'world';

    let drop_zone1;
    let drop_zone2;
    let objects = [
        { el: null, id: 1 },
        { el: null, id: 2 },
        { el: null, id: 3 }
    ];

    let dropped1 = [];
    let dropped2 = [];
    let status = '';

    let dropped_in = '';
    let active1 = false;
    let active2 = false;

    function handleDragEnter(e) {
        status = "You are dragging over " + e.target.getAttribute('id');
        if (e.target.getAttribute('id') === 'drop_zone1') {
            active1 = true;
        } else if (e.target.getAttribute('id') === 'drop_zone2') {
            active2 = true;
        }
    }

    function handleDragLeave(e) {
        status = "You left the " + e.target.getAttribute('id');
        if (e.target.getAttribute('id') === 'drop_zone1') {
            active1 = false;
        } else if (e.target.getAttribute('id') === 'drop_zone2') {
            active2 = false;
        }
    }

    function handleDragDrop(e) {
        e.preventDefault();
        var element_id = e.dataTransfer.getData("text");
        if (e.target.getAttribute('id') === 'drop_zone1') {
            dropped1 = dropped1.concat(element_id);
            dropped_in = true;
            active1 = false;
        } else if (e.target.getAttribute('id') === 'drop_zone2') {
            dropped2 = dropped2.concat(element_id);
            dropped_in = true;
            active2 = false;
        }
        status = "You dropped " + element_id + " into drop zone";
    }

    function handleDragStart(e) {
        status = "Dragging the element " + e.target.getAttribute('id');
        e.dataTransfer.dropEffect = "move";
        e.dataTransfer.setData("text", e.target.getAttribute('id'));
    }

    function handleDragEnd(e) {
        if (dropped_in == false) {
            status = "You let the " + e.target.getAttribute('id') + " go.";
        }
        dropped_in = false;
    }

</script>

<h2 id="app_status">Drag status: {status}</h2>
<h1>Drop Zone 1 </h1>

<div
        class:active={active1}
        class='drop_zone'
        on:dragenter={handleDragEnter}
        on:dragleave={handleDragLeave}
        on:drop={handleDragDrop}
        bind:this={drop_zone1}
        id="drop_zone1"
        ondragover="return false"
>
    {#each objects.filter(v => dropped1.includes(`${v.id}`)) as {id}, i}

        <div class="objects" id={id} style="cursor: auto">
            Object {id}
        </div>

    {/each}
</div>
<h1>Drop Zone 2</h1>
<div
        class='drop_zone'
        class:active={active2 == true}
        on:dragenter={handleDragEnter}
        on:dragleave={handleDragLeave}
        on:drop={handleDragDrop}
        bind:this={drop_zone2}
        id="drop_zone2"
        ondragover="return false"
>
    {#each objects.filter(v => dropped2.includes(`${v.id}`) ) as {id}, i}

        <div class="objects" id={id} style="cursor: auto">
            Object {id}
        </div>

    {/each}
</div>

{#each objects.filter(v => !(dropped1.includes(`${v.id}`) || dropped2.includes(`${v.id}`)) ) as { id }, i}
    <div
            id="{id}"
            class="objects"
            draggable=true
            bind:this={objects[i].el}
            on:dragstart={handleDragStart}
            on:dragend={handleDragEnd}
    >
        Object { id }
    </div>
{/each}

<style>

    :global(html), :global(body) {
        margin: 0;
        height: 100%;
        overflow: hidden;
        user-select: none;
        -webkit-user-select: none;
    }

    .drop_zone {
        background-color: #eee;
        border: #999 1px solid ;
        width: 280px;
        height: 200px;
        padding: 8px;
        font-size: 19px;
    }

    .drop_zone.active {
        background-color: red;
    }

    .objects {
        display: inline-block;
        background-color: #FFF3CC;
        border: #DFBC6A 1px solid;
        width: 50px;
        height: 50px;
        margin: 10px;
        padding: 8px;
        font-size: 18px;
        text-align: center;
        box-shadow: 2px 2px 2px #999;
        cursor: move;
    }
</style>
