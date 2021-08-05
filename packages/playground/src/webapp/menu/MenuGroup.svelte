<!-- this group is used in the AppBar -->
<!-- another group with the same menus is used in the LeftPanel: MenuList-->
<!-- this group shows the menus in a horizontal list -->

<div id="menugroup" style="white-space: nowrap;">
     <FileMenu {props}/>
     <EditMenu {props}/>
     <ProjectionMenu {props}/>
 </div>

<script>
    import FileMenu from "./FileMenu.svelte";
    import EditMenu from "./EditMenu.svelte";
    import ProjectionMenu from "./ProjectionMenu.svelte";

    // all activators for all menus in this group have the same props
    let props = {
        raised: false,
        unelevated: false,
        outlined: true,
        shaped: false,
        fab: false,
        dense: true,
        ripple: true,
        disabled: false,
        fullWidth: false,
        style: "color: var(--inverse-color); height:var(--pi-menu-height); text-transform: none; font-size: var(--button-font-size);"
    };
</script>

