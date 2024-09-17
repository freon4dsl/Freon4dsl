import { SimpleReader } from "./SimpleReader";
import { describe, test } from "vitest";

describe("Testing Parser", () => {

    test("some input", () => {
        let sentence =
        `Calculator a
        input i
        output o`;

        new SimpleReader().readFromString(sentence);
    });
});
