import { describe, test, expect } from "vitest";
import { CalculatorModelEnvironment } from "../config/gen/CalculatorModelEnvironment";
import {CalculatorModel} from "../language/gen/internal";
import {FreModelUnit} from "@freon4dsl/core";

describe("Parser test", () => {
    const reader = CalculatorModelEnvironment.getInstance().reader;

    test(" number 1", () => {
        try {
            const sentence: string =
                `Calculator a
                input i
                output o`;
            const unit1: FreModelUnit = reader.readFromString(
                sentence,
                "Calculator",
                new CalculatorModel(),
            ) as FreModelUnit;
            expect(unit1).not.toBeNull();
        } catch (e) {
            console.log(e.message + e.stack);
            expect(e).toBeNull();
        }
    });
});
