import { describe, it, expect, beforeEach, afterEach, test } from "vitest";
import { AST, FreLogger, InMemoryModel, LionWebRepositoryCommunication, ServerCommunication } from "@freon4dsl/core";
import { RulesModelEnvironment } from "../config/gen/RulesModelEnvironment.js";
import { Data, Rules, RulesModel } from "../language/gen/index.js";
import { fillDataUnit, fillRulesUnit, modelToString } from "./StoreModelCreator.js";

/**
 * For these test to run, a server should be up and running
 */
describe.skip("Store test", () => {
    let inMemoryModel: InMemoryModel;
    let env = RulesModelEnvironment.getInstance();
    let freonServer = new ServerCommunication();
    let lionWebServer = new LionWebRepositoryCommunication();
    const communication = freonServer;
    let originalModel: RulesModel;

    beforeEach(async () => {
        // FreLogger.unmute("ServerCommunication2")
        // FreLogger.unmute("InMemoryModel")
        inMemoryModel = new InMemoryModel(env, communication);
        // Create a model in the server

        let unit1
        let unit2
        originalModel = (await inMemoryModel.createModel("serverModel")) as RulesModel;
        unit1 = (await inMemoryModel.createUnit("data Unit1", "Data")) as Data;
        unit2 = (await inMemoryModel.createUnit("rules Unit1", "Rules")) as Rules;
        AST.change(() => {
            fillDataUnit(unit1);
            fillRulesUnit(unit2);
        })
        await inMemoryModel.saveUnit(unit1);
        await inMemoryModel.saveUnit(unit2);
    });

    afterEach(async () => {
        await inMemoryModel.deleteModel();
    });
    
    it("create new model", async () => {
        const newModel = (await inMemoryModel.createModel(("New Model")) as RulesModel)
        const retrievedModel = (await inMemoryModel.openModel("New Model")) as RulesModel;
        expect(retrievedModel !== undefined).toBeTruthy()
        expect(retrievedModel.freLanguageConcept(), `Model ${retrievedModel.freLanguageConcept()}`).toBe("RulesModel");
        expect(retrievedModel.name, `Model ${retrievedModel.name}`).toBe("New Model");
    })

    it("open existing model", async () => {
        const retrievedModel = (await inMemoryModel.openModel("serverModel")) as RulesModel;
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
        const unit1 = await inMemoryModel.getUnitByName("data Unit1");
        expect(unit1).toBeDefined();
        const unit2 = await inMemoryModel.getUnitByName("rules Unit1");
        expect(unit2).toBeDefined();
        expect(inMemoryModel.model.getUnits().length).toBe(2);
        await inMemoryModel.deleteUnit(unit1);
        expect(inMemoryModel.model.getUnits().length).toBe(1);

        const newInMemoryModel = new InMemoryModel(env, communication);
        const retrievedModel = (await newInMemoryModel.openModel("serverModel")) as RulesModel;
        expect(retrievedModel.getUnits().length === 1);
    })
    
    test("rename  unit", async () => {
        const unit1 = await inMemoryModel.getUnitByName("data Unit1");
        expect(unit1).toBeDefined();
        unit1.name = "data Unit1 has <changed>@#$% !"
        await freonServer.renameModelUnit(inMemoryModel.model.name, "data Unit1", "data Unit1 has <changed>@#$% !", unit1)

        const newInMemoryModel = new InMemoryModel(env, communication);
        const retrievedModel = (await newInMemoryModel.openModel("serverModel")) as RulesModel;
        expect(retrievedModel.getUnits().length === 2);
        expect(!retrievedModel.getUnits().map(u => u.name).includes("data Unit1"));
        expect(retrievedModel.getUnits().map(u => u.name).includes("data Unit1 has <changed>@#$% !"));
        expect(retrievedModel.getUnits().map(u => u.name).includes("rules Unit1"));
    })
});
