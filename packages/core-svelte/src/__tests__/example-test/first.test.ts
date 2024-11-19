import { render, screen } from "@testing-library/svelte";
import { TextComponent } from "../../lib/components/index.js";
import { FreEditor, TextBox } from "@freon4dsl/core";

// see https://testing-library.com/docs/ for testing options

describe("First test in core-svelte", () => {
    test("see if test is starting", () => {
        expect(true).not.toBe(false);
    });

    test.skip("says 'hello world!'", () => {
        const myTextBox = new TextBox(
            null,
            "role",
            () => "Hello world!",
            (v: string) => {
                return;
            },
        );
        const myEditor = new FreEditor(null, null);
        render<TextComponent>(TextComponent, { box: myTextBox, editor: myEditor, text: myTextBox.getText() });
        const node = screen.queryByText("Hello world!");
        expect(node).not.toBeNull();
    });
});
