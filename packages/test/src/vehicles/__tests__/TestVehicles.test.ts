import { VehiclesEnvironment } from "../config/gen/VehiclesEnvironment";
import { VehicleUnit } from "../language/gen";
import { compareReadAndWrittenUnits } from "../../utils/HelperFunctions";

const writer = VehiclesEnvironment.getInstance().writer;
const reader = VehiclesEnvironment.getInstance().reader;

describe("Vehicles parser on", () => {

    test( " test1 ", () => {
            compareReadAndWrittenUnits(reader, writer,"src/vehicles/__inputs__/test1.veh", "VehicleUnit");
    });

});
