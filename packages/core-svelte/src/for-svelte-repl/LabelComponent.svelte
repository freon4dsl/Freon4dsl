<script lang="ts">
    export let label; // LabelBox
    let text = label;
    let id = 'label-' + label;
    let style;
    let cssClass;

    // 	    autorun( () => {
    //         text = label;
    //         // text = label.getLabel();
    //         // style = label.cssStyle;
    //         // cssClass = label.cssClass;
    //     });
</script>

<div class="label {text} {cssClass}"
     style="{style}"
     id="{id}"
>
    {text}
</div>

<style>
    .label:empty:before {
        content: attr(data-placeholdertext);
        margin: var(--freon-label-component-margin, 1px);
        padding: var(--freon-label-component-padding, 1px);
        background-color: var(--freon-label-component-background-color, inherit);
    }

    .label {
        color: var(--freon-label-component-color, inherit);
        background-color: var(--freon-label-component-background-color, inherit);
        font-style: var(--freon-label-component-font-style, inherit);
        font-weight: var(--freon-label-component-font-weight, normal);
        font-size: var(--freon-label-component-font-size, inherit);
        font-family: var(--freon-label-component-font-family, "inherit");
        padding: var(--freon-label-component-padding, 1px);
        margin: var(--freon-label-component-margin, 1px);
        white-space: normal;
        display: inline-block;
    }
</style>
