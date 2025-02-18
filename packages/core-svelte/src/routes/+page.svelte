<script lang="ts">
    import ButtonComponent from '$lib/components/ButtonComponent.svelte';
    import {
        BooleanControlBox,
        ButtonBox,
        NumberControlBox,
        SvgBox,
        ElementBox,
        FreEditor,
        FreLanguageEnvironment,
        FreProjectionHandler,
        MenuItem,
        TextBox,
        MultiLineTextBox
    } from '@freon4dsl/core';
    import { SimpleElement } from '$lib/test-environment/models/SimpleElement.js';
    import BooleanCheckboxComponent from '$lib/components/BooleanCheckboxComponent.svelte';
    import BooleanRadioComponent from '$lib/components/BooleanRadioComponent.svelte';
    import DropdownUser from '$lib/extras/DropdownUser.svelte';
    import ContextMenu from '$lib/components/ContextMenu.svelte';
    import EmptyLineComponent from '$lib/components/EmptyLineComponent.svelte';
    import { contextMenu } from '$lib/components/stores/AllStores.svelte.js';
    import InnerSwitchComponent from '$lib/components/BooleanInnerSwitchComponent.svelte';
    import LimitedCheckboxUser from '$lib/extras/LimitedCheckboxUser.svelte';
    import LimitedRadioUser from '$lib/extras/LimitedRadioUser.svelte';
    import NumericSliderComponent from '$lib/components/NumericSliderComponent.svelte';
    import BooleanSwitchComponent from '$lib/components/BooleanSwitchComponent.svelte';
    import SvgComponent from '$lib/components/SvgComponent.svelte';
    import MultiLineTextComponent from '$lib/components/MultiLineTextComponent.svelte';
    import TextComponent from '$lib/components/TextComponent.svelte';

    let editor = new FreEditor(new FreProjectionHandler(), new FreLanguageEnvironment());

    // for TryComponent
    let textVar2: string = $state('start try');
    let textBox2: TextBox = new TextBox(
        new SimpleElement('id-textbox'),
        'text',
        () => {
            return textVar2;
        },
        (text: string) => {
            textVar2 = text;
        }
    );
    textBox2.placeHolder = 'add';

    // for SimpleTextComponent
    let textVar: string = $state('startText');
    let textBox: TextBox = new TextBox(
        new SimpleElement('id-textbox'),
        'text',
        () => {
            return textVar;
        },
        (text: string) => {
            textVar = text;
        }
    );
    textBox.placeHolder = 'add something';

    // for MultilineTextComponent
    let multiTextVar: string = $state('');
    let multiTextBox = new MultiLineTextBox(
        new SimpleElement('multi'),
        'multi',
        () => {
            return multiTextVar;
        },
        (text: string) => {
            multiTextVar = text;
        }
    );

    // for ButtonComponent
    let buttonBox = new ButtonBox(new SimpleElement(), 'TEXT', 'role');

    // for BooleanCheckboxComponent
    let boolVar: boolean = $state(true);
    let booleanBox = new BooleanControlBox(
        new SimpleElement(),
        'boolean-role',
        () => {
            return boolVar;
        },
        (newValue: boolean) => {
            boolVar = newValue;
        }
    );

    // for BooleanRadioComponent
    let boolVar2: boolean = $state(true);
    let booleanBox2 = new BooleanControlBox(
        new SimpleElement(),
        'boolean-role',
        () => {
            return boolVar2;
        },
        (newValue: boolean) => {
            boolVar2 = newValue;
        }
    );

    // for BooleanSwitchComponent
    let boolVar3: boolean = $state(true);
    let booleanBox3 = new BooleanControlBox(
        new SimpleElement(),
        'boolean-role',
        () => {
            return boolVar3;
        },
        (newValue: boolean) => {
            boolVar3 = newValue;
        }
    );

    // for ContextMenu
    function showContextMenu(event: MouseEvent, index: number) {
        const xx: MenuItem[] = [
            new MenuItem('ABCD', 'abcd', (element, index, editor) => {
                console.log(element.freLanguageConcept() + index + editor);
            }),
            new MenuItem('EFGH', 'efgh', (element, index, editor) => {
                console.log(element.freLanguageConcept() + index + editor);
            })
        ];
        if (contextMenu.instance) {
            contextMenu.instance.items = xx;
            contextMenu.instance.show(event, index);
            event.preventDefault();
        }
    }

    // for EmptyLineComponent
    let elementBox: ElementBox = new ElementBox(new SimpleElement('id24'), 'element-box-role');

    // for InnerSwitchComponent
    let boolVar4: boolean = $state(true);
    let booleanBox4 = new BooleanControlBox(
        new SimpleElement(),
        'boolean-role',
        () => {
            return boolVar4;
        },
        (newValue: boolean) => {
            boolVar4 = newValue;
        }
    );

    // for NumericSliderComponent
    let numVar1: number = $state(0);
    let numericBox1: NumberControlBox = new NumberControlBox(
        new SimpleElement(),
        'numeric-slider',
        () => {
            return numVar1;
        },
        (newValue: number) => {
            numVar1 = newValue;
        }
    );

    // for SVGComponent
    let svgBox: SvgBox = new SvgBox(new SimpleElement(), 'svg-role', 'M150 5 L75 200 L225 200 Z');
    svgBox.viewBoxHeight = 210;
    svgBox.viewBoxWidth = 400;
    svgBox.viewPortHeight = 210;
    svgBox.viewPortWidth = 400;
    svgBox.cssStyle = 'fill:none;stroke:green;stroke-width:3';
</script>

<h1>Welcome to the Freon core-svelte library</h1>
<p>Here you can find some tests of the components that are available.</p>
<div class="button-container">
    <a href="./render">Click here for tests that use the RenderComponent</a>
    <a href="./dragdrop">Click here for the Drag and Drop tests</a>
</div>

<div class="test-area">
    <ul>
        <li>
            Test TextComponent: <TextComponent
                box={textBox}
                {editor}
                isEditing={false}
                text=""
                partOfDropdown={false}
                toParent={(eventType, details) => {console.log(eventType + JSON.stringify(details))} }
            />
            current value:
            {textVar}
            <hr class="line" />
        </li>
        <li>
            Test MultiLineTextComponent: <MultiLineTextComponent
                box={multiTextBox}
                {editor}
            />
            current value:
            {multiTextVar}
            <hr class="line" />
        </li>
        <li>
            Test ButtonComponent: <ButtonComponent {editor} box={buttonBox} />
            <hr class="line" />
        </li>
        <li>
            Test BooleanCheckboxComponent: <BooleanCheckboxComponent {editor} box={booleanBox} /> current
            value:
            {boolVar}
            <hr class="line" />
        </li>
        <li>
            Test BooleanRadioComponent: <BooleanRadioComponent {editor} box={booleanBox2} /> current
            value:
            {boolVar2}
            <hr class="line" />
        </li>
        <li>
            Test InnerSwitchComponent: <InnerSwitchComponent {editor} box={booleanBox3} /> current value:
            {boolVar3}
            <hr class="line" />
        </li>
        <li>
            Test BooleanSwitchComponent: <BooleanSwitchComponent {editor} box={booleanBox4} /> current
            value:
            {boolVar4}
            <hr class="line" />
        </li>
        <li>
            Test LimitedCheckboxComponent: <LimitedCheckboxUser {editor} />
            <hr class="line" />
        </li>
        <li>
            Test LimitedRadioComponent: <LimitedRadioUser {editor} />
            <hr class="line" />
        </li>
        <li>
            Test NumericSliderComponent: <NumericSliderComponent {editor} box={numericBox1} />
            current value:
            {numVar1}
            <hr class="line" />
        </li>
        <li>
            Test DropdownUser: <DropdownUser />
            <div style="height:10rem"></div>
            <hr class="line" />
        </li>
        <li>
            <ContextMenu bind:this={contextMenu.instance} items={[]} {editor} />
            <div
                role="button"
                tabindex={0}
                class="contextmenu-area"
                oncontextmenu={(event) => showContextMenu(event, 2)}
            >
                Click in this area to open context menu
            </div>
            <hr class="line" />
        </li>
        <li>
            Test EmptyLineComponent: there should be a line break between the following two texts.
            TEXT1
            <EmptyLineComponent {editor} box={elementBox} />
            TEXT2
            <hr class="line" />
        </li>
        <li>
            Test SvgComponent:
            <SvgComponent {editor} box={svgBox} />
            TODO: SvgBox needs viewBoxHeight, viewBoxWidth, viewPortHeight, viewPortWidth, and cssStyle.
            Have params for these in the constructor.
            <hr class="line" />
        </li>
    </ul>
</div>
