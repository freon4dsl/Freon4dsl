import { MockVariables } from "../mock-components/MockVariables";
import { fireEvent } from "@testing-library/svelte";

export async function pressKeys(htmlElement: HTMLElement) {
    // reset MockVariables
    MockVariables.reset();

    // press arrow up
    await fireEvent.keyPress(htmlElement, { key: "ArrowUp", code: "ArrowUp", charCode: 38 });
    expect(MockVariables.nrKeypress).toBe(1);
    expect(MockVariables.keypressValues[MockVariables.keypressValues.length - 1]).toStrictEqual({
        code: "ArrowUp",
        key: "ArrowUp",
        meta: 0
    });

    // press arrow down
    await fireEvent.keyPress(htmlElement, { key: "ArrowDown", code: "ArrowDown", charCode: 40 });
    expect(MockVariables.nrKeypress).toBe(2);
    expect(MockVariables.keypressValues[MockVariables.keypressValues.length - 1]).toStrictEqual({
        code: "ArrowDown",
        key: "ArrowDown",
        meta: 0
    });

    // press arrow left
    await fireEvent.keyPress(htmlElement, { key: "ArrowLeft", code: "ArrowLeft", charCode: 37 });
    expect(MockVariables.nrKeypress).toBe(3);
    expect(MockVariables.keypressValues[MockVariables.keypressValues.length - 1]).toStrictEqual({
        code: "ArrowLeft",
        key: "ArrowLeft",
        meta: 0
    });

    // press arrow right
    await fireEvent.keyPress(htmlElement, { key: "ArrowRight", code: "ArrowRight", charCode: 39 });
    expect(MockVariables.nrKeypress).toBe(4);
    expect(MockVariables.keypressValues[MockVariables.keypressValues.length - 1]).toStrictEqual({
        code: "ArrowRight",
        key: "ArrowRight",
        meta: 0
    });

    // press tab
    await fireEvent.keyPress(htmlElement, { key: "Tab", code: "Tab", charCode: 9, shiftKey: false });
    expect(MockVariables.nrKeypress).toBe(5);
    expect(MockVariables.keypressValues[MockVariables.keypressValues.length - 1]).toStrictEqual({
        code: "Tab",
        key: "Tab",
        meta: 0
    });

    // press shift tab
    await fireEvent.keyPress(htmlElement, { key: "Tab", code: "Tab", charCode: 9, shiftKey: true });
    // console.log(`AFTER MockVariables keyPress: ${MockVariables.nrKeypress}, keyDown: ${MockVariables.nrKeydown}, keyUp: ${MockVariables.nrKeyup}`)
    expect(MockVariables.nrKeypress).toBe(6);
    expect(MockVariables.keypressValues[MockVariables.keypressValues.length - 1]).toStrictEqual({
        code: "Tab",
        key: "Tab",
        meta: 3
    });
}
