<script>
    // 	import CustomMenu from './CustomMenu.svelte';
    import Steps from './Steps.svelte'

    let steps = [{name:"One", isRed:false},
        {name:"Two", isRed:false},
        {name:"Three", isRed:false},
        {name:"Four", isRed:false},
        {name:"Five", isRed:false}
    ]
</script>

<h1>
    Context Menu
</h1>

<p>
    Right-click on a steps and choose the action
</p>

<Steps steps={steps}/>
