import { VehicleModelEnvironment } from "../freon/config/VehicleModelEnvironment.js";
import { VehicleModel, VehicleUnit } from "../freon/language/index.js";
import { compareReadAndWrittenUnits } from "../../utils/HelperFunctions.js";
import { describe, test } from "vitest";

const writer = VehicleModelEnvironment.getInstance().writer;
const reader = VehicleModelEnvironment.getInstance().reader;

describe("Vehicles parser on", () => {
    test(" test1 ", () => {
        const model = new VehicleModel();
        compareReadAndWrittenUnits(reader, writer, model, "src/vehicles/__inputs__/test1.veh", "VehicleUnit");
    });
});
