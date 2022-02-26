import { VehiclesEnvironment } from "../environment/gen/VehiclesEnvironment";
import { VehicleModel, VehicleUnit } from "../language/gen";
import { compareReadAndWrittenUnits } from "../../utils/HelperFunctions";

const writer = VehiclesEnvironment.getInstance().writer;
const reader = VehiclesEnvironment.getInstance().reader;

describe("Vehicles parser on", () => {

    test( " test1 ", () => {
        const model = new VehicleModel();
        compareReadAndWrittenUnits(reader, writer, model,"src/vehicles/__inputs__/test1.veh", "VehicleUnit");
    });

});
