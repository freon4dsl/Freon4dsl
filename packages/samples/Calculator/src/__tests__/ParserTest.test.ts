import { describe, test, expect } from "vitest";
import { CalculatorModelEnvironment } from "../freon/config/CalculatorModelEnvironment";
import {CalculatorModel} from "../freon/language/internal";
import {FreModelUnit} from "@freon4dsl/core";

describe("Parser test", () => {
    const reader = CalculatorModelEnvironment.getInstance().reader;
    // const writer = CalculatorModelEnvironment.getInstance().writer;

    test(" number 1", () => {
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
        // console.log(writer.writeToString(unit1));
    });
});
