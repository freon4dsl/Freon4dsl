<script lang="ts">
    import {
        type Box,
        ElementBox,
        FragmentBox,
        FreEditor,
        FreLanguageEnvironment,
        type FreNode,
        FreProjectionHandler,
        GridBox,
        GridCellBox,
        HorizontalLayoutBox,
        IndentBox,
        LabelBox,
        LayoutBox,
        OptionalBox2,
        VerticalLayoutBox
    } from '@freon4dsl/core';
    import { SimpleElement } from '$lib/__test__/test-environment/simple-models/SimpleElement.js';
    import ElementComponent from '$lib/components/ElementComponent.svelte';
    import FragmentComponent from '$lib/components/FragmentComponent.svelte';
    import { ModelMaker } from '$lib/__test__/test-environment/simple-models/ModelMaker.js';
    import { ElementWithList } from '$lib/__test__/test-environment/simple-models/ElementWithList.js';
    import GridComponent from '$lib/components/GridComponent.svelte';
    import IndentComponent from '$lib/components/IndentComponent.svelte';
    import LayoutComponent from '$lib/components/LayoutComponent.svelte';
    import OptionalComponent from '$lib/components/OptionalComponent.svelte';
    import ExpandableComponent from "$lib/components/ExpandableComponent.svelte";

    let editor = new FreEditor(new FreProjectionHandler(), new FreLanguageEnvironment());

    // for FragmentComponent
    let element2: FreNode = new SimpleElement('id66');
    let labelBox2: LabelBox = new LabelBox(element2, 'element-label-box', () => {
        return 'LABEL222';
    });
    let fragmentBox: FragmentBox = new FragmentBox(element2, 'fragment', labelBox2);

</script>

<div class="top">
    <h1>Test for new components</h1>
    <div class="button-container">
        <a href=".">Basic tests</a>
        <!--    <a href="./render">Tests that use RenderComponent</a>-->
        <a href="./dragdrop">Drag and Drop tests</a>
        <a href="./tabbing">Selection tests</a>
    </div>
</div>

<div class="test-area">
    <ul>
        <li>
            Test ExpandableComponent: <ExpandableComponent {editor} box={fragmentBox} />
            <hr class="line" />
        </li>
    </ul>
</div>
