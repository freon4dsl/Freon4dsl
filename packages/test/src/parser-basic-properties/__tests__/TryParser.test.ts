import { TestParserEnvironment } from "../environment/gen/TestParserEnvironment";
import { FileHandler } from "../../utils/FileHandler";
import { LimitedTest, PartsTest, PrimitivesTest, RefsTest, WithKeywordProj } from "../language/gen";

describe("Parser properties of type", () => {
    const reader = TestParserEnvironment.getInstance().reader;
    const writer = TestParserEnvironment.getInstance().writer;
    const fileHandler = new FileHandler();

    test( " Primitive ", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test1.pri");
            const unit1: PrimitivesTest = reader.readFromString(input, "PrimitivesTest") as PrimitivesTest;
            // console.log(writer.writeToString(unit1));
            expect(unit1).toMatchSnapshot();
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test( " Primitive with Keyword projection ", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test1.wit");
            const unit1: WithKeywordProj = reader.readFromString(input, "WithKeywordProj") as WithKeywordProj;
            // console.log(writer.writeToString(unit1));
            expect(unit1).toMatchSnapshot();
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test( " Limited Concept ", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test1.lim");
            const unit1: LimitedTest = reader.readFromString(input, "LimitedTest") as LimitedTest;
            // console.log(writer.writeToString(unit1));
            expect(unit1).toMatchSnapshot();
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test( " Part ", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test1.par");
            const unit1: PartsTest = reader.readFromString(input, "PartsTest") as PartsTest;
            // console.log(writer.writeToString(unit1));
            expect(unit1).toMatchSnapshot();
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test( " Part with Optionals present", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test3.par");
            const unit1: PartsTest = reader.readFromString(input, "PartsTest") as PartsTest;
            // console.log(writer.writeToString(unit1));
            expect(unit1).toMatchSnapshot();
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test( " Part and Sub Parts ", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test2.par");
            const unit1: PartsTest = reader.readFromString(input, "PartsTest") as PartsTest;
            // console.log(writer.writeToString(unit1));
            expect(unit1).toMatchSnapshot();
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test( " Ref ", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test1.ref");
            const unit1: RefsTest = reader.readFromString(input, "RefsTest") as RefsTest;
            // console.log(writer.writeToString(unit1));
            expect(unit1).toMatchSnapshot();
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

    test( " Ref with Optionals present", () => {
        try {
            let input = fileHandler.stringFromFile("src/parser-basic-properties/__inputs__/test2.ref");
            const unit1: RefsTest = reader.readFromString(input, "RefsTest") as RefsTest;
            // console.log(writer.writeToString(unit1));
            expect(unit1).toMatchSnapshot();
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });
});
