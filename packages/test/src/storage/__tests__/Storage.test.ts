import { describe, it, expect, beforeEach, afterEach, test } from "vitest";
import { AST, FreLogger, InMemoryModel, LionWebRepositoryCommunication, ServerCommunication2 } from "@freon4dsl/core";
import { RulesModelEnvironment } from "../config/gen/RulesModelEnvironment.js";
import { Data, Rules, RulesModel } from "../language/gen/index.js";
import { fillDataUnit, fillRulesUnit, modelToString } from "./StoreModelCreator.js";

/**
 * For these test to run, a server should be up and running
 */
describe.skip("Store test", () => {
    let inMemoryModel: InMemoryModel;
    let env = RulesModelEnvironment.getInstance();
    let freonServer = new ServerCommunication2();
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
        unit1 = (await inMemoryModel.createUnit("dataUnit1", "Data")) as Data;
        unit2 = (await inMemoryModel.createUnit("rulesUnit1", "Rules")) as Rules;
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

    it("open existing model", async () => {
        const retrievedModel = (await inMemoryModel.openModel("serverModel")) as RulesModel;
        expect(retrievedModel.getUnits().length === 2);
        expect(retrievedModel.freLanguageConcept(), `Model ${retrievedModel.freLanguageConcept()}`).toBe("RulesModel");
        expect(retrievedModel.name, `Model ${retrievedModel.name}`).toBe("serverModel");
        expect(retrievedModel.getUnits().some((unit) => unit.name === "dataUnit1"), `Unit ${retrievedModel?.getUnits()?.map(u => u.name).join(", ")}`).toBeTruthy();
        expect(retrievedModel.getUnits().some((unit) => unit.name === "rulesUnit1"), `Unit ${retrievedModel?.getUnits()?.map(u => u.name).join(", ")}`).toBeTruthy();
        expect(
            retrievedModel
                .getUnits()
                .find((unit) => unit.name === "dataUnit1")
                .freLanguageConcept() === "Data",
        );
        expect(
            retrievedModel
                .getUnits()
                .find((unit) => unit.name === "rulesUnit1")
                .freLanguageConcept() === "Rules",
        );

        expect(modelToString(originalModel), "Retrieved model should be identical to stored model").toBe(
            modelToString(retrievedModel),
        );
    });

    test("delete unit model", async () => {
        const unit1 = await inMemoryModel.getUnitByName("dataUnit1");
        expect(unit1).toBeDefined();
        const unit2 = await inMemoryModel.getUnitByName("rulesUnit1");
        expect(unit2).toBeDefined();
        expect(inMemoryModel.model.getUnits().length).toBe(2);
        await inMemoryModel.deleteUnit(unit1);
        expect(inMemoryModel.model.getUnits().length).toBe(1);

        const newInMemoryModel = new InMemoryModel(env, communication);
        const retrievedModel = (await newInMemoryModel.openModel("serverModel")) as RulesModel;
        expect(retrievedModel.getUnits().length === 1);
    })
    
    test("rename  unit", async () => {
        const unit1 = await inMemoryModel.getUnitByName("dataUnit1");
        expect(unit1).toBeDefined();
        unit1.name = "dataUnit1-changed"
        await freonServer.renameModelUnit(inMemoryModel.model.name, "dataUnit1", "dataUnit1 has <changed>@#$% !", unit1)

        const newInMemoryModel = new InMemoryModel(env, communication);
        const retrievedModel = (await newInMemoryModel.openModel("serverModel")) as RulesModel;
        expect(retrievedModel.getUnits().length === 2);
        expect(retrievedModel.getUnits().map(u => u.name).includes("dataUnit1 has <changed>@#$% !"));
        expect(retrievedModel.getUnits().map(u => u.name).includes("rulesUnit1"));
    })
});
