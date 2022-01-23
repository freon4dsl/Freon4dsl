import { FileHandler } from "../../utils/FileHandler";
import { VehiclesEnvironment } from "../environment/gen/VehiclesEnvironment";
import { VehicleUnit } from "../language/gen";

describe("Vehicles parser on", () => {
    const reader = VehiclesEnvironment.getInstance().reader;
    const writer = VehiclesEnvironment.getInstance().writer;
    const fileHandler = new FileHandler();

    test( " test1 ", () => {
        try {
            const input = fileHandler.stringFromFile("src/vehicles/__inputs__/test1.veh");
            const unit1: VehicleUnit = reader.readFromString(input, "VehicleUnit") as VehicleUnit;
            // console.log(writer.writeToString(unit1, 0, false));
            expect(unit1).toMatchSnapshot();
        } catch (e) {
            // console.log(e.stack);
            expect(e).toBeNaN();
        }
    });

});
