import { describe, test, expect, beforeEach } from "vitest";
import { FileHandler } from '../../utils/FileHandler';
import { ROOTEnvironment } from '../config/gen/ROOTEnvironment';
import { XX } from '../../typer-test8';
import { AST, FreError } from '@freon4dsl/core';
import { AAAAAA } from '../language/gen';

const reader = ROOTEnvironment.getInstance().reader;
const validator = ROOTEnvironment.getInstance().validator;
const handler = new FileHandler();
const testdir = "src/ValidTest/__inputs__/";

describe("Testing Validator on Inheritance", () => {

    beforeEach(() => {
        ROOTEnvironment.getInstance();
    });

    test("rules defined on base concept, should be checked on sub concepts", () => {
        // the rule 'CCprop3 <= 12' is defined for concept CC, and should also be checked on any of its sub concepts
        let unit1: AAAAAA;
        AST.change( () => {
            const model = new XX();
            unit1 = reader.readFromString(
              handler.stringFromFile(testdir + "valid-test-input1.txt"),
              "AAAAAA",
              model,
            ) as AAAAAA;
        });
        expect(unit1).not.toBeNull();
        expect(unit1).not.toBeUndefined();
        const errors: FreError[] = validator.validate(unit1);
        expect(errors.length).toBe(4);
        const messages: string[] = errors.map(error => error.message);
        // console.log(messages);
        expect(messages.includes("'self.CCprop3 <= 12' is false")).toBeTruthy();
        expect(messages.includes("'self.CCprop3 <= 6' is false")).toBeTruthy();

        errors.forEach((error: FreError) => {
            if (error.message === "'self.CCprop3 <= 12' is false") {
                if (!Array.isArray(error.reportedOn)) {
                    expect(error.reportedOn.freLanguageConcept()).toBeOneOf(["CC", "BB", "SubCC"]);
                }
            }
            if (error.message === "'self.CCprop3 <= 6' is false") {
                if (!Array.isArray(error.reportedOn)) {
                    expect(error.reportedOn.freLanguageConcept()).toBeOneOf(["SubCC"]);
                }
            }
        })

    });

    test("rules defined on interface, should be checked on implementing concepts", () => {
        // the rule 'DDprop3 >= 10' is defined for interface DD, and should also be checked on any of its implementors
        let unit1: AAAAAA;
        AST.change( () => {
            const model = new XX();
            unit1 = reader.readFromString(
              handler.stringFromFile(testdir + "valid-test-input2.txt"),
              "AAAAAA",
              model,
            ) as AAAAAA;
        });
        expect(unit1).not.toBeNull();
        expect(unit1).not.toBeUndefined();
        const errors: FreError[] = validator.validate(unit1);
        expect(errors.length).toBe(1);
        const messages: string[] = errors.map(error => error.message);
        // console.log(messages);

        expect(messages.includes("'self.DDprop3 >= 10' is false")).toBeTruthy();
        errors.forEach((error: FreError) => {
            if (error.message == "'self.DDprop3 >= 10' is false") {
                if (!Array.isArray(error.reportedOn)) {
                    expect(error.reportedOn.freLanguageConcept()).toBe("SubCC");
                }
            }
        })
    });

    test("rules defined on base interface, should be checked all implementing concepts", () => {
        // the rule 'FFprop3 < 4' is defined for interface FF, and should also be checked on any of its implementors
        let unit1: AAAAAA;
        AST.change( () => {
            const model = new XX();
            unit1 = reader.readFromString(
              handler.stringFromFile(testdir + "valid-test-input3.txt"),
              "AAAAAA",
              model,
            ) as AAAAAA;
        });
        expect(unit1).not.toBeNull();
        expect(unit1).not.toBeUndefined();
        const errors: FreError[] = validator.validate(unit1);
        expect(errors.length).toBe(1);
        const messages: string[] = errors.map(error => error.message);
        expect(messages.includes("'self.FFprop3 < 4' is false")).toBeTruthy();
        errors.forEach((error: FreError) => {
            if (error.message == "'self.FFprop3 < 4' is false") {
                if (!Array.isArray(error.reportedOn)) {
                    expect(error.reportedOn.freLanguageConcept()).toBe("SubCC");
                }
            }
        })
    });
});
