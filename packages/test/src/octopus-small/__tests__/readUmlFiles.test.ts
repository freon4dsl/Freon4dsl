import { ast2string, FreLionwebSerializer, FreModelSerializer, FreModelUnit, FreUtils } from "@freon4dsl/core";
import { FileHandler } from "../../utils/FileHandler";
import { OctopusModelEnvironment } from "../config/gen/OctopusModelEnvironment";
import { compareReadAndWrittenUnits } from "../../utils/HelperFunctions";
import { OctopusModel } from "../language/gen";
import { describe, expect, test } from "vitest";

const writer = OctopusModelEnvironment.getInstance().writer;
const reader = OctopusModelEnvironment.getInstance().reader;

// const serial: FreLionwebSerializer = new FreLionwebSerializer();
const serial: FreModelSerializer = new FreModelSerializer();
const handler: FileHandler = new FileHandler();

describe("Testing Parser", () => {
    // TODO use snapshots
    test("book unparsed and parsed again", () => {
        const model = new OctopusModel();
        compareReadAndWrittenUnits(reader, writer, model, "src/octopus-small/__inputs__/Book.uml2", "UmlPart");
    });

    test("orders model unparsed and parsed again", () => {
        const model = new OctopusModel();
        compareReadAndWrittenUnits(reader, writer, model, "src/octopus-small/__inputs__/orders.uml2", "UmlPart");
    });

    test("catalog model unparsed and parsed again", () => {
        const model = new OctopusModel();
        const langSpec: string = handler.stringFromFile("src/octopus-small/__inputs__/catalog.uml2");
        const unit1 = reader.readFromString(langSpec, "UmlPart", model);
        const result: string = writer.writeToString(unit1, 0, false);
        console.log("========== unit 1  writer ============")
        console.log(result);
        console.log("========== unit 1  ast2string ============")
        console.log(ast2string(unit1, "    "))
        console.log("======================")
        // handler.stringToFile(filepath+ "out", result);
        expect(result.length).toBeGreaterThan(0);
        let unit2
        (unit1 as FreModelUnit).name = "somethingDifferent"; // name should be unique during reading and adding of unit2
        // FreUtils.resetId()
        unit2 = reader.readFromString(result, "UmlPart", model);
        // simply comparing the units does not work because the id properties of the two units
        // are not the same, therefore we use the hack of checking whether both units in JSON
        // format are the same
        // Note that also the names should be equal, therefore ...
        (unit1 as FreModelUnit).name = (unit2 as FreModelUnit).name;
        const unit1_json = serial.convertToJSON(unit1);
        const unit2_json = serial.convertToJSON(unit2);
        expect(unit1_json).toEqual(unit2_json);
        // compareReadAndWrittenUnits(reader, writer, model, "src/octopus-small/__inputs__/catalog.uml2", "UmlPart");
    });

    test("trainWagon model unparsed and parsed again", () => {
        const model = new OctopusModel();
        compareReadAndWrittenUnits(reader, writer, model, "src/octopus-small/__inputs__/trainWagon.uml2", "UmlPart");
    });
});
