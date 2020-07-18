import { PiElement, PiModel } from "../language/PiModel";

// tag::initialization-interface[]
export interface PiModelInitialization {
    /**
     * Used to initialize a completely new model. It returns the first model unit in the model.
     */
    initialize(): PiElement;

    /**
     * Returns an empty model unit within 'model' of type 'unitTypeName'.
     *
     * @param model
     * @param unitTypeName
     */
    newUnit(model: PiElement, unitTypeName: string): PiElement;

    /**
     * Returns an empty model with name 'modelName'
     *
     * @param modelName
     */
    newModel(modelName: string): PiModel;
}
// end::initialization-interface[]
