import { FREON, CoreConfig } from "@freon4dsl/core"
import { VehicleModelEnvironment } from "../freon/config/VehicleModelEnvironment.js";
import { VehicleModel, VehicleUnit } from "../freon/language/index.js";
import { compareReadAndWrittenUnits } from "../../utils/HelperFunctions.js";
import { describe, test } from "vitest";

CoreConfig.initialize(VehicleModelEnvironment.getInstance(), null)
const writer = FREON.environment.writer;
const reader = FREON.environment.reader;

describe("Vehicles parser on", () => {
    test(" test1 ", () => {
        const model = new VehicleModel();
        compareReadAndWrittenUnits(reader, writer, model, "src/vehicles/__inputs__/test1.veh", "VehicleUnit");
    });
});
