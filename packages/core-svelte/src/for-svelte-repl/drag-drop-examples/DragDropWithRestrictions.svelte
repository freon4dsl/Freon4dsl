<!-- From https://www.npmjs.com/package/svelte-drag-and-drop-actions?activeTab=readme#examples -->
<style>
    :global([draggable]) {
        -webkit-touch-callout:none;
        -ms-touch-action:none; touch-action:none;
        -moz-user-select:none; -webkit-user-select:none; -ms-user-select:none; user-select:none;
    }

    .DropZone                  { border:solid 4px transparent }
    .DropZone:global(.hovered) { border:solid 4px gold }
</style>

<script context="module">
    import DragDropTouch               from 'svelte-drag-drop-touch'
    import { asDroppable, asDropZone } from 'svelte-drag-and-drop-actions'
</script>

<script>
    function onDropped (x,y, Operation, TypeTransferred, DataTransferred, DropZoneExtras, DroppableExtras) {
        console.log('Droppable.onDropped:')
        console.log(' x,y:            ',x,y)
        console.log(' Operation:      ',Operation)
        console.log(' TypeTransferred:',TypeTransferred)
        console.log(' DataTransferred:',DataTransferred)
        console.log(' DropZoneExtras: ',DropZoneExtras)
        console.log(' DroppableExtras:',DroppableExtras)
    }

    function onDrop (x,y, Operation, DataOffered, DroppableExtras, DropZoneExtras) {
        console.log('DropZone.onDrop:')
        console.log(' x,y:            ',x,y)
        console.log(' Operation:      ',Operation)
        console.log(' DataOffered:    ',DataOffered)
        console.log(' DroppableExtras:',DroppableExtras)
        console.log(' DropZoneExtras: ',DropZoneExtras)

        let TypeAccepted = undefined
        for (let Type in DataOffered) {
            if (DataOffered.hasOwnProperty(Type)) { TypeAccepted = Type }
        }
        return TypeAccepted
    }
</script>

<p style="line-height:150%">
    In this example any droppable from the left may only be dropped onto the
    corresponding drop zone on the right. The visual appearance of such a drop
    zone changes while the droppable remains within its bounds because of the
    CSS class "hovered" assigned to the drop zone during that time
</p>

<div style="
  display:block; position:relative;
  width:400px; height:400px;
  margin:20px;
  border:dotted 1px black; border-radius:4px;
">
    <div style="
    display:block; position:absolute;
    left:20px; top:20px; width:80px; height:30px;
    background:gold; color:black;
    line-height:30px; text-align:center;
    cursor:move;
  " use:asDroppable={{
    Extras:'Text', Operations:'copy', DataToOffer:{ 'text/plain':'some Text' },
    onDropped
  }}>Text</div>

    <div style="
    display:block; position:absolute;
    left:20px; top:120px; width:80px; height:30px;
    background:fuchsia; color:black;
    line-height:30px; text-align:center;
    cursor:move;
  " use:asDroppable={{
    Extras:'Image', Operations:'copy', DataToOffer:{ 'image/gif':'(should be an image)' },
    onDropped
  }}>Image</div>

    <div style="
    display:block; position:absolute;
    left:20px; top:220px; width:80px; height:30px;
    background:cyan; color:black;
    line-height:30px; text-align:center;
    cursor:move;
  " use:asDroppable={{
    Extras:'Object', Operations:'copy', DataToOffer:{ 'application/octet-stream':'' },
    onDropped
  }}>Object</div>


    <div class="DropZone" style="
    display:block; position:absolute;
    left:240px; top:20px; width:140px; height:50px;
    background:orangered; color:white;
    line-height:50px; text-align:center;
  " use:asDropZone={{
    Extras:'Text Zone', TypesToAccept:{ 'text/plain':'all' }, onDrop
  }}>Text Zone</div>

    <div class="DropZone" style="
    display:block; position:absolute;
    left:240px; top:120px; width:140px; height:50px;
    background:limegreen; color:white;
    line-height:50px; text-align:center;
  " use:asDropZone={{
    Extras:'Image Zone', TypesToAccept:{ 'image/gif':'all' }, onDrop
  }}>Image Zone</div>

    <div class="DropZone" style="
    display:block; position:absolute;
    left:240px; top:220px; width:140px; height:50px;
    background:dodgerblue; color:white;
    line-height:50px; text-align:center;
  " use:asDropZone={{
    Extras:'Object Zone', TypesToAccept:{ 'application/octet-stream':'all' }, onDrop
  }}>Object Zone</div>
</div>

<p style="line-height:150%">
    Look into console to see the "onDrop" and "onDropped" callbacks
</p>
