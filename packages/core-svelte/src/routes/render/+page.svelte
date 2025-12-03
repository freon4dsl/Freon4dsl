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
        type LayoutBox,
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

    let editor = new FreEditor(new FreProjectionHandler(), new FreLanguageEnvironment());

    // for ElementComponent
    let element: FreNode = new SimpleElement('id24');
    let elementBox: ElementBox = new ElementBox(element, 'element-box-role');
    let labelBox: LabelBox = new LabelBox(element, 'element-label-box', () => {
        return 'LABEL111';
    });
    elementBox.content = labelBox;

    // for FragmentComponent
    let element2: FreNode = new SimpleElement('id66');
    let labelBox2: LabelBox = new LabelBox(element2, 'element-label-box', () => {
        return 'LABEL222';
    });
    let fragmentBox: FragmentBox = new FragmentBox(element2, 'fragment', labelBox2);

    // for GridComponent
    let listElement: ElementWithList = ModelMaker.makeList('forGrid');
    let cells: GridCellBox[] = [];
    listElement.myList.forEach((xx, index) => {
        const labelBox3: LabelBox = new LabelBox(xx, 'grid-label-box', () => {
            return `Grid content ${index}`;
        });
        cells.push(new GridCellBox(xx, `cell-${index}`, index + 1, index + 1, labelBox3));
    });
    let gridBox: GridBox = new GridBox(listElement, 'grid', cells);

    // for IndentComponent
    let indentBox: IndentBox = new IndentBox(element, 'indent', 8, labelBox2);

    // for LayoutComponent
    let children: Box[] = [];
    listElement.myList.forEach((xx, index) => {
        children.push(
            new LabelBox(xx, 'layout-label-box', () => {
                return `Layout content ${index}`;
            })
        );
    });
    let layoutBox: LayoutBox = new HorizontalLayoutBox(element, 'horizontal-layout', children);
    let layoutBox2: LayoutBox = new VerticalLayoutBox(element, 'vertical-layout', children);

    // for OptionalComponent
    let optionalNode: FreNode = new SimpleElement('optional');
    let content = layoutBox2;
    let mustShow: boolean = false;
    let optionalCond: boolean = $state(false);
    let placeholder = new LabelBox(optionalNode, 'element-label-box', () => {
        return 'placeholder';
    });
    let optionalBox: OptionalBox2 = new OptionalBox2(
        optionalNode,
        'optional',
        () => {
            return optionalCond;
        },
        content,
        mustShow,
        placeholder
    );
    let conditionString: string = $state('false');

    function onChange() {
        if (conditionString === 'false') {
            optionalCond = false;
        } else if (conditionString === 'true') {
            optionalCond = true;
        }
    }
</script>

<div class="top">
    <h1>Test for components that call RenderComponent, without drag and drop</h1>
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
            Test ElementComponent: <ElementComponent {editor} box={elementBox} />
            <hr class="line" />
        </li>
        <li>
            Test FragmentComponent: <FragmentComponent {editor} box={fragmentBox} />
            <hr class="line" />
        </li>
        <li>
            Test GridComponent: <GridComponent {editor} box={gridBox} />
            <hr class="line" />
        </li>
        <li>
            <p>Test IndentComponent:</p>
            <IndentComponent {editor} box={indentBox} />
            <hr class="line" />
        </li>
        <li>
            Test LayoutComponent horizontal: <LayoutComponent {editor} box={layoutBox} />
            Test LayoutComponent vertical: <LayoutComponent {editor} box={layoutBox2} />
            <hr class="line" />
        </li>
        <li>
            <p>Test OptionalComponent:</p>
            <div>
                <p>Change how it is displayed here: <input bind:value={conditionString} onchange={onChange}/></p>
            </div>
            <OptionalComponent {editor} box={optionalBox} />
            <hr class="line" />
        </li>
    </ul>
</div>
