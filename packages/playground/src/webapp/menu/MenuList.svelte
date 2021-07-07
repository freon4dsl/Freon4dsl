<!-- this group is used in the LeftPanel -->
<!-- another group with the same menus is used in the AppBar: MenuGroup -->
<!-- this list shows the menus in a vertical list -->

 <div class="menulist">
     <FileMenu {props} />
      <br>
     <EditMenu {props}/>
      <br>
     <ProjectionMenu {props}/>
      <br>
     <HelpMenu {props}/>
 </div>

<script>
    import FileMenu from "./FileMenu.svelte";
    import EditMenu from "./EditMenu.svelte";
    import HelpMenu from "./HelpMenu.svelte";
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
        style: "color: var(--color); height:var(--pi-menu-height); text-transform: none; font-size: var(--button-font-size); width: 68px; margin: 8px;"
    };
</script>

<style>
    .menulist{
        margin: 10px 10px;
    }
</style>

