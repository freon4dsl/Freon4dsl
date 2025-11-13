import { VehicleModelEnvironment } from "../freon/config/gen/VehicleModelEnvironment";
import { VehicleModel, VehicleUnit } from "../freon/language/gen";
import { compareReadAndWrittenUnits } from "../../utils/HelperFunctions";
import { describe, test } from "vitest";

const writer = VehicleModelEnvironment.getInstance().writer;
const reader = VehicleModelEnvironment.getInstance().reader;

describe("Vehicles parser on", () => {
    test(" test1 ", () => {
        const model = new VehicleModel();
        compareReadAndWrittenUnits(reader, writer, model, "src/vehicles/__inputs__/test1.veh", "VehicleUnit");
    });
});
