<script>

    import List from './List.svelte'

    let items = [{name:"One", isRed:false},
        {name:"Two", isRed:false},
        {name:"Three", isRed:false},
        {name:"Four", isRed:false},
        {name:"Five", isRed:false}
    ]

</script>

<h1>Context menu example</h1>

<p>Right click anywhere to view.</p>

<List items={items}></List>
