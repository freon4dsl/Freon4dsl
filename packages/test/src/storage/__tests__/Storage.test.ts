import { describe, it, expect, beforeEach, afterEach, test } from "vitest";
import { FREON, CoreConfig, ModelManager, ServerCommunication } from "@freon4dsl/core"
import { RulesModelEnvironment } from "../freon/config/RulesModelEnvironment.js";
import { Data, Rules, RulesModel } from "../freon/language/index.js";
import { fillDataUnit, fillRulesUnit, modelToString } from "./StoreModelCreator.js";

/**
 * For these test to run, a server should be up and running 
 */
describe.skip("Store test", () => {
    CoreConfig.initialize(RulesModelEnvironment.getInstance(), new ServerCommunication())
    let originalModel: RulesModel;

    beforeEach(async () => {
        // Create a model in the server
        originalModel = (await FREON.modelManager.createModel("serverModel")) as RulesModel;
        let unit1 = (await FREON.modelManager.createUnit("data Unit1", "Data")) as Data;
        let unit2 = (await FREON.modelManager.createUnit("rules Unit1", "Rules")) as Rules;
        FREON.astChanger.change(() => {
            fillDataUnit(unit1);
            fillRulesUnit(unit2);
        })
        await FREON.modelManager.saveUnit(unit1);
        await FREON.modelManager.saveUnit(unit2);
    });

    afterEach(async () => {
        await FREON.modelManager.deleteModel();
    });
    
    it("create new model", async () => {
        const newModel = (await FREON.modelManager.createModel(("New Model")) as RulesModel)
        const retrievedModel = (await FREON.modelManager.openModel("New Model")) as RulesModel;
        expect(retrievedModel !== undefined).toBeTruthy()
        expect(retrievedModel.freLanguageConcept(), `Model ${retrievedModel.freLanguageConcept()}`).toBe("RulesModel");
        expect(retrievedModel.name, `Model ${retrievedModel.name}`).toBe("New Model");
    })

    it("open existing model", async () => {
        const retrievedModel = (await FREON.modelManager.openModel("serverModel")) as RulesModel;
        expect(retrievedModel.getUnits().length === 2);
        expect(retrievedModel.freLanguageConcept(), `Model ${retrievedModel.freLanguageConcept()}`).toBe("RulesModel");
        expect(retrievedModel.name, `Model ${retrievedModel.name}`).toBe("serverModel");
        expect(retrievedModel.getUnits().some((unit) => unit.name === "data Unit1"), `Unit ${retrievedModel?.getUnits()?.map(u => u.name).join(", ")}`).toBeTruthy();
        expect(retrievedModel.getUnits().some((unit) => unit.name === "rules Unit1"), `Unit ${retrievedModel?.getUnits()?.map(u => u.name).join(", ")}`).toBeTruthy();
        expect(
            retrievedModel
                .getUnits()
                .find((unit) => unit.name === "data Unit1")
                .freLanguageConcept() === "Data",
        );
        expect(
            retrievedModel
                .getUnits()
                .find((unit) => unit.name === "rules Unit1")
                .freLanguageConcept() === "Rules",
        );

        expect(modelToString(originalModel), "Retrieved model should be identical to stored model").toBe(
            modelToString(retrievedModel),
        );
    });

    test("delete unit model", async () => {
        const unit1 = await FREON.modelManager.getUnitByName("data Unit1");
        expect(unit1).toBeDefined();
        const unit2 = await FREON.modelManager.getUnitByName("rules Unit1");
        expect(unit2).toBeDefined();
        expect(FREON.modelManager.model.getUnits().length).toBe(2);
        await FREON.modelManager.deleteUnit(unit1);
        expect(FREON.modelManager.model.getUnits().length).toBe(1);

        const newModelManager = new ModelManager();
        const retrievedModel = (await newModelManager.openModel("serverModel")) as RulesModel;
        expect(retrievedModel.getUnits().length === 1);
    })
    
    test("rename  unit", async () => {
        const unit1 = await FREON.modelManager.getUnitByName("data Unit1");
        expect(unit1).toBeDefined();
        unit1.name = "data Unit1 has <changed>@#$% !"
        await FREON.server.renameModelUnit(FREON.modelManager.model.name, "data Unit1", "data Unit1 has <changed>@#$% !", unit1)

        const newModelManager = new ModelManager();
        const retrievedModel = (await newModelManager.openModel("serverModel")) as RulesModel;
        expect(retrievedModel.getUnits().length === 2);
        expect(!retrievedModel.getUnits().map(u => u.name).includes("data Unit1"));
        expect(retrievedModel.getUnits().map(u => u.name).includes("data Unit1 has <changed>@#$% !"));
        expect(retrievedModel.getUnits().map(u => u.name).includes("rules Unit1"));
    })
});
