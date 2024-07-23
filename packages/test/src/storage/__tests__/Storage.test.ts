import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { InMemoryModel, LionWebRepositoryCommunication, ServerCommunication } from "@freon4dsl/core"
import { RulesModelEnvironment } from "../config/gen/RulesModelEnvironment"
import { Data, Rules, RulesModel } from "../language/gen/index.js"
import { fillDataUnit, fillRulesUnit, modelToString } from "./StoreModelCreator.js"

/**
 * For these test to run, a server should be up and running
 */
describe.skip("Store test", () => {
    let inMemoryModel: InMemoryModel
    let env = RulesModelEnvironment.getInstance()
    let freonServer = new ServerCommunication()
    let lionWebServer = new LionWebRepositoryCommunication()
    const communication = freonServer
    let originalModel: RulesModel
    // FreLogger.unmute("LionWebRepositoryCommunication")

    beforeEach( async () => {
        inMemoryModel = new InMemoryModel(env, communication)
        // Create a model in the server
        originalModel = await inMemoryModel.createModel("serverModel") as RulesModel
        const unit1 = await inMemoryModel.createUnit("dataUnit1", "Data") as Data
        const unit2 = await inMemoryModel.createUnit("rulesUnit1", "Rules") as Rules
        fillDataUnit(unit1)
        fillRulesUnit(unit2)
        await inMemoryModel.saveUnit(unit1)
        await inMemoryModel.saveUnit(unit2)
    });

    afterEach( async () => {
        await inMemoryModel.deleteModel()
    });

    it("open existing model", async () => {
        const retrievedModel = await inMemoryModel.openModel("serverModel") as RulesModel
        expect(retrievedModel.getUnits().length === 2)
        expect(retrievedModel.freLanguageConcept()).toBe("RulesModel")
        expect(retrievedModel.getUnits().some(unit => unit.name === "dataUnit1")).toBeTruthy()
        expect(retrievedModel.getUnits().some(unit => unit.name === "rulesUnit1")).toBeTruthy()
        
        expect(retrievedModel.getUnits().find(unit => unit.name === "dataUnit1").freLanguageConcept() === "Data")
        expect(retrievedModel.getUnits().find(unit => unit.name === "rulesUnit1").freLanguageConcept() === "Rules")

        expect(modelToString(originalModel), "Retrieved model should be identical to stored model")
            .toBe(modelToString(retrievedModel))
    });

    it("delete unit model", async () => {
        const unit1 = inMemoryModel.getUnitByName("dataUnit1")
        expect(unit1).toBeDefined
        expect(inMemoryModel.model.getUnits().length).toBe(2)
        await inMemoryModel.deleteUnit(unit1)
        expect(inMemoryModel.model.getUnits().length).toBe(1)

        const newInMemoryModel = new InMemoryModel(env, communication)
        const retrievedModel = await newInMemoryModel.openModel("serverModel") as RulesModel
        expect(retrievedModel.getUnits().length === 1)
    });

});
