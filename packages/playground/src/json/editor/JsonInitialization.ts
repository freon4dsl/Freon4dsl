import { JsonFile, JsonObject } from "../language/gen";

export class JsonInitialization {

    initialize() {
        const result = new JsonFile();
        result.contents = new JsonObject();

        return result;
    }
}
