import { PiKey, SelectOption, toPiKey } from "@projectit/core";

/**
 * Class to keep track of keystrokes for MockSurroundingComponent
 */
export class MockVariables {
    static nrKeypress: number = 0;
    static nrKeydown: number = 0;
    static nrKeyup: number = 0;
    static keypressValues: PiKey[] = [];
    static keydownValues: PiKey[] = [];
    static keyupValues: PiKey[] = [];
    static nrPi_itemSelected: number = 0;
    static pi_itemSelectedValues: SelectOption[] = [];

    static reset(): void {
        MockVariables.nrKeydown = 0;
        MockVariables.nrKeypress = 0;
        MockVariables.nrKeyup = 0;
        MockVariables.nrPi_itemSelected = 0;
        MockVariables.keyupValues = [];
        MockVariables.keydownValues = [];
        MockVariables.keypressValues = [];
        MockVariables.pi_itemSelectedValues = [];
    }

    static keypress(k: KeyboardEvent): void {
        MockVariables.nrKeypress++;
        MockVariables.keypressValues.push(toPiKey(k));
    }

    static keyup(k: KeyboardEvent): void {
        MockVariables.nrKeyup++;
        MockVariables.keyupValues.push(toPiKey(k));
    }

    static keydown(k: KeyboardEvent): void {
        MockVariables.nrKeydown++;
        MockVariables.keydownValues.push(toPiKey(k));
    }

    static pi_itemSelected(event: CustomEvent<SelectOption>): void {
        MockVariables.nrPi_itemSelected++;
        MockVariables.pi_itemSelectedValues.push(event.detail);
    }
}

