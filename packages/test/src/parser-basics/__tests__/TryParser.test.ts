import { TestParserEnvironment } from "../environment/gen/TestParserEnvironment";
import { FileHandler } from "../../utils/FileHandler";
import { LimitedTest, PartsTest, PrimitivesTest, RefsTest } from "../language/gen";

describe("Test the parser", () => {
    const reader = TestParserEnvironment.getInstance().reader;
    const writer = TestParserEnvironment.getInstance().writer;
    const fileHandler = new FileHandler();

    test( " on Primitives ", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basics/__inputs__/test1.pri");
            const unit1: PrimitivesTest = reader.readFromString(input, "PrimitivesTest") as PrimitivesTest;
            // console.log(writer.writeToString(unit1, 0, false));
            // expect(unit1).toMatchSnapshot();
        } catch (e) {
            console.log(e.stack);
            // expect(e).toBeNaN();
        }
    });

    test( " on Limited Concepts ", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basics/__inputs__/test1.lim");
            const unit1: LimitedTest = reader.readFromString(input, "LimitedTest") as LimitedTest;
            // console.log(writer.writeToString(unit1, 0, false));
            expect(unit1).toMatchSnapshot();
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test( " on Parts ", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basics/__inputs__/test1.par");
            const unit1: PartsTest = reader.readFromString(input, "PartsTest") as PartsTest;
            // console.log(writer.writeToString(unit1, 0, false));
            expect(unit1).toMatchSnapshot();
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test( " on Parts with Optionals present", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basics/__inputs__/test3.par");
            const unit1: PartsTest = reader.readFromString(input, "PartsTest") as PartsTest;
            // console.log(writer.writeToString(unit1, 0, false));
            expect(unit1).toMatchSnapshot();
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test( " on Parts and Sub Parts ", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basics/__inputs__/test2.par");
            const unit1: PartsTest = reader.readFromString(input, "PartsTest") as PartsTest;
            // console.log(writer.writeToString(unit1, 0, false));
            expect(unit1).toMatchSnapshot();
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test( " on Refs ", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basics/__inputs__/test1.ref");
            const unit1: RefsTest = reader.readFromString(input, "RefsTest") as RefsTest;
            // console.log(writer.writeToString(unit1, 0, false));
            expect(unit1).toMatchSnapshot();
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test( " on Refs with Optionals present", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basics/__inputs__/test2.ref");
            const unit1: RefsTest = reader.readFromString(input, "RefsTest") as RefsTest;
            // console.log(writer.writeToString(unit1, 0, false));
            expect(unit1).toMatchSnapshot();
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });
});
