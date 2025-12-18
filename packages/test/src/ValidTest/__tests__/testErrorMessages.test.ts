import { describe, test, expect, beforeEach } from "vitest";
import { FileHandler } from '../../utils/FileHandler.js';
import { ROOTEnvironment } from '../freon/config/ROOTEnvironment.js';
import { AST, FreError } from '@freon4dsl/core';
import { BBBBBB, ROOT } from "../freon/language/index.js"
const reader = ROOTEnvironment.getInstance().reader;
const validator = ROOTEnvironment.getInstance().validator;
const handler = new FileHandler();
const testdir = "src/ValidTest/__inputs__/";

describe("Testing Validator on Error Messages", () => {

    beforeEach(() => {
        ROOTEnvironment.getInstance();
    });

    test("all names empty", () => {
        let unit1: BBBBBB;
        AST.change( () => {
            const model = new ROOT();
            model.name = "test";
            unit1 = reader.readFromString(
              handler.stringFromFile(testdir + "valid-test-input4.txt"),
              "BBBBBB",
              model,
            ) as BBBBBB;
        });
        expect(unit1).not.toBeNull();
        expect(unit1).not.toBeUndefined();
        const errors: FreError[] = validator.validate(unit1);
        expect(errors.length).toBe(8);
        const messages: string[] = errors.map(error=> error.message);
        // console.log(messages);
        expect(messages.includes("Property 'name' of BBprop1 of B must have a value")).toBeTruthy();
        expect(messages.includes("Property 'name' of ZZprop1 of BBprop1 of B must have a value")).toBeTruthy();
        expect(messages.includes("Property 'name' of YYprop1 of ZZprop1 of BBprop1 of B must have a value")).toBeTruthy();
        expect(messages.includes("Property 'name' of ZZlist[0] of BBprop1 of B must have a value")).toBeTruthy();
        expect(messages.includes("Property 'name' of ZZlist[1] of BBprop1 of B must have a value")).toBeTruthy();
        expect(messages.includes("Property 'name' of BBprop2 of B must have a value")).toBeTruthy();
        expect(messages.includes("Property 'name' of YYprop1 of BBprop2 of B must have a value")).toBeTruthy();
        expect(messages.includes("Property 'name' of BBprop3 of B must have a value")).toBeTruthy();
    });

    test("some names empty", () => {
        let unit1: BBBBBB;
        AST.change( () => {
            const model = new ROOT();
            model.name = "test";
            unit1 = reader.readFromString(
                handler.stringFromFile(testdir + "valid-test-input5.txt"),
                "BBBBBB",
                model,
            ) as BBBBBB;
        });
        expect(unit1).not.toBeNull();
        expect(unit1).not.toBeUndefined();
        const errors: FreError[] = validator.validate(unit1);
        expect(errors.length).toBe(5);
        const messages: string[] = errors.map(error=> error.message);
        console.log(messages);
        expect(messages.includes("Property 'name' of BBprop1 of B must have a value")).toBeTruthy();
        expect(messages.includes("Property 'name' of YYprop1 of rr must have a value")).toBeTruthy();
        expect(messages.includes("Property 'name' of ZZlist[1] of BBprop1 of B must have a value")).toBeTruthy();
        expect(messages.includes("Property 'name' of YYprop1 of pp must have a value")).toBeTruthy();
        expect(messages.includes("Property 'name' of BBprop3 of B must have a value")).toBeTruthy();
    });

});
