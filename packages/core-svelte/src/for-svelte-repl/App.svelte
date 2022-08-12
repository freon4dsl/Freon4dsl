<script>
    import TextDropdownComponent from "./TextDropdownComponent.svelte";
    import LabelComponent from "./LabelComponent.svelte";
    import TextComponent from "./TextComponent.svelte";
    //     import DropdownComponent from "./DropdownComponent.svelte";
    import ListComponent from "./ListComponent.svelte";
    let name = 'world';

    const getOptions = () => {
        return [{id:'opt1', label:'optxxx1'}, {id:'opt2', label:'optxxy2'}, {id:'opt3', label:'optxxzz3'}, {id:'opt4', label:'optxaa4'}, {id:'opt5', label:'optxbb5'}];
    }

    const onKeyDown = (event /*: KeyboardEvent */ ) => {
        switch (event.key) {
            case 'Tab' : {
                if (event.shiftKey) {
                    console.log("Shift-Tab on App: " + document.activeElement.id);
                } else {
                    console.log("Tab on App: "+ document.activeElement.id);
                }
// 					event.preventDefault()
                break;
            }
        }
    }
</script>

<div on:keydown={onKeyDown}>

    <h1>Hello {name}!</h1>
    <LabelComponent label="Some text before." />
    <TextComponent partOfAlias={false}/>
    <LabelComponent label="Some text in between." />
    <TextDropdownComponent getOptions={getOptions}/>
    <LabelComponent label="Some text in between." />
    <TextComponent partOfAlias={false}/>
    <LabelComponent label="Some text after." />
    <br>
    <br>
    <ListComponent boxId=20 />
    <br>
    <ListComponent boxId=40 />

</div>
