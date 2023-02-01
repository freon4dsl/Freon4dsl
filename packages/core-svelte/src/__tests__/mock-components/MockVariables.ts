import { PiKey, toPiKey } from "@projectit/core";

/**
 * Class to keep track of keystrokes for MockSurroundingComponent
 */
export class MockVariables {
    static nrKeypress: number = 0;
    static nrKeydown: number = 0;
    static nrKeyup: number = 0;
    static keypressValues: PiKey[];
    static keydownValues: PiKey[];
    static keyupValues: PiKey[];

    static reset(): void {
        MockVariables.nrKeydown = 0;
        MockVariables.nrKeypress = 0;
        MockVariables.nrKeyup = 0;
        MockVariables.keyupValues = [];
        MockVariables.keydownValues = [];
        MockVariables.keypressValues = [];
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
}

