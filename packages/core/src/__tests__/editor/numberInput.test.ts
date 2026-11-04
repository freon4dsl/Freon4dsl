import { CharAllowed } from "../../editor/boxes/TextBox.js";
import { isNumber } from "../../editor/simplifiedBoxAPI/box-util-helpers/UtilPrimHelper.js";
import { describe, it, expect } from "vitest";

// The text box for a number property accepts the characters a whole number may have.
describe("Typing a number", () => {
    it("accepts digits anywhere", () => {
        expect(isNumber("", "2", 0)).toBe(CharAllowed.OK);
        expect(isNumber("2", "8", 1)).toBe(CharAllowed.OK);
    });

    it("accepts a minus sign as the first character, once", () => {
        expect(isNumber("", "-", 0)).toBe(CharAllowed.OK);
        expect(isNumber("28", "-", 0)).toBe(CharAllowed.OK);
        expect(isNumber("-28", "-", 0)).not.toBe(CharAllowed.OK);
    });

    it("does not accept a minus sign after the first character", () => {
        expect(isNumber("2", "-", 1)).toBe(CharAllowed.GOTO_NEXT);
        expect(isNumber("28", "-", 1)).toBe(CharAllowed.NOT_OK);
    });

    it("moves out of the box on another character at either end", () => {
        expect(isNumber("28", "x", 2)).toBe(CharAllowed.GOTO_NEXT);
        expect(isNumber("28", "x", 0)).toBe(CharAllowed.GOTO_PREVIOUS);
    });
});
