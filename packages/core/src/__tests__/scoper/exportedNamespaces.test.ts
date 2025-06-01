/*
 * This set of tests is based on model3 created by ModelCreator,
 * which is based on the implementations in scoper-model.
 * All tests determine whether the set of visible nodes of a namespaces is correct,
 * taking into account the hierarchical namespace relationships, and several
 * replacement namespaces.
 *
 * NOTE: the actual replacements are defined in the ExportedNamespaceScoper!
 * We regulate the actual replacement with a set of boolean properties in this class,
 * e.g. useReference, which is used in test "A_2_2 with [NodeY, UnitB], and B_2 as replacement NS".
 *
 * All imports of UnitA instances are not re-exported, but the imports of UnitB instances are!
 */
import { beforeEach, describe, test, expect } from 'vitest';
import { ScoperModel } from './scoper-model/ScoperModel.js';
import { ModelCreator } from './ModelCreator';
import { initializeLanguage, NodeX, NodeY, UnitA, UnitB } from './scoper-model';
import { FreCompositeScoper, } from '../../scoper';
import { FreNamedNode } from '../../ast';
import { FreLanguage } from '../../language';
import { FreLanguageEnvironment } from '../../environment';
import { ExportedNamespacesScoper } from './scoper-model/ExportedNamespacesScoper.js';

function printNames(set: FreNamedNode[]) {
	let names: string = '';
	set.forEach(x => names += x.name + ', ');
	console.log(names);
}

function setNamespaces(names: string[]) {
	for (const name of names) {
		FreLanguage.getInstance().classifier(name).isNamespace = true;
	}
}

/**
 * Unset all possible namespaces, because we do not want to interfere with other tests
 */
function unsetNamespaces() {
	for (const name of ['UnitA', 'UnitB', 'NodeX', 'NodeY', 'IWithName']) {
		FreLanguage.getInstance().classifier(name).isNamespace = false;
	}
}

describe("FreNamespace visibleNames with replacements, but without additions, ", () => {
	let model: ScoperModel;
	let unitA1: UnitA;
	let concept_A_2: NodeY;
	let concept_A_2_2: NodeX;
	let unitB2: UnitA;
	let concept_B_2: NodeX;
	let concept_B_2_1: NodeX;

	initializeLanguage();
	const scoper: ExportedNamespacesScoper = new ExportedNamespacesScoper();
	const mainScoper: FreCompositeScoper = new FreCompositeScoper();
	mainScoper.appendScoper(scoper);

	beforeEach(() => {
		// create a simple model where some nodes are namespaces and some are not
		// and get some handles to nodes in the AST
		model = ModelCreator.createModel3();
		unitA1 = model.findUnit('UnitA1') as UnitA;
		concept_A_2 = unitA1.childrenWithName.find(child => child.name === 'A_2') as NodeY;
		if (!!concept_A_2) {
			concept_A_2_2 = concept_A_2.childrenWithName.find(child => child.name === 'A_2_2') as NodeX;
		}
		unitB2 = model.findUnit('UnitB2') as UnitB;
		concept_B_2 = unitB2.childrenWithName.find(child => child.name === 'B_2') as NodeX;
		if (!!concept_B_2) {
			concept_B_2_1 = concept_B_2.childrenWithName.find(child => child.name === 'B_2_1') as NodeX;
		}

		//
		FreLanguageEnvironment.getInstance().scoper = mainScoper;
	});

	// Note that in the whole test the order of the names is important!

	test(" model with []", () => {
		// This test is here to assure that all elements that should be in the model,
		// are present, and are visible in the model namespace, when no other namespaces are defined.
		const set: FreNamedNode[] = scoper.getVisibleNodes(model);
		// printNames(set);
		// expect(set.length).toBe(30);
		expect(set.map(x => x.name)).toStrictEqual([
			"UnitA1", "UnitA3", "UnitB2", "UnitB4",
			"A1_1",	"A1_2",
			"A1_1_1", "A1_1_2",
			"A1_1_1_1", "A1_1_1_2", "A1_1_2_1", "A1_1_2_2",
			"A1_2_1",	"A1_2_2",
			"A1_2_1_1", "A1_2_1_2", "A1_2_2_1", "A1_2_2_2",
			"A3_1", "A3_2",
			"A3_1_1", "A3_1_2",
			"A3_1_1_1", "A3_1_1_2", "A3_1_2_1", "A3_1_2_2",
			"A3_2_1", "A3_2_2",
			"A3_2_1_1", "A3_2_1_2", "A3_2_2_1", "A3_2_2_2",
			"B2_1", "B2_2",
			"B2_1_1", "B2_1_2",
			"B2_1_1_1", "B2_1_1_2",	"B2_1_2_1", "B2_1_2_2",
			"B2_2_1", "B2_2_2",
			"B2_2_1_1", "B2_2_1_2",	"B2_2_2_1", "B2_2_2_2",
			"B4_1", "B4_2",
			"B4_1_1", "B4_1_2",
			"B4_1_1_1", "B4_1_1_2",	"B4_1_2_1",	"B4_1_2_2",
			"B4_2_1",	"B4_2_2",
			"B4_2_1_1",	"B4_2_1_2",	"B4_2_2_1",	"B4_2_2_2"
		])
	})

	test(" unitA1 with namespaces [UnitA, UnitB], the imports as defined in model3, no recursive imports ", () => {
		// Unit 'unitA1' imports 'unitB2', 'unitB2' imports 'unitA3', 'unitA3' imports 'unitB4'.
		// test namespace for 'unitA1'
		if (!!unitA1) {
			setNamespaces(['UnitB', 'UnitA']);
			//
			const set: FreNamedNode[] = scoper.getVisibleNodes(unitA1);
			// printNames(set);
			// expect(set.length).toBe(8);
			expect(set.map(x => x.name)).toStrictEqual([
				"A1_1",	"A1_2",
				"A1_1_1", "A1_1_2",
				"A1_1_1_1", "A1_1_1_2", "A1_1_2_1", "A1_1_2_2",
				"A1_2_1",	"A1_2_2",
				"A1_2_1_1", "A1_2_1_2", "A1_2_2_1", "A1_2_2_2",
				// in other order:
				"UnitA1", "UnitA3", "UnitB2", "UnitB4",
				// not available here:
				// "A3_1", "A3_2",
				// "A3_1_1", "A3_1_2",
				// "A3_1_1_1", "A3_1_1_2", "A3_1_2_1", "A3_1_2_2",
				// "A3_2_1", "A3_2_2",
				// "A3_2_1_1", "A3_2_1_2", "A3_2_2_1", "A3_2_2_2",
				"B2_1", "B2_2",
				"B2_1_1", "B2_1_2",
				"B2_1_1_1", "B2_1_1_2",	"B2_1_2_1", "B2_1_2_2",
				"B2_2_1", "B2_2_2",
				"B2_2_1_1", "B2_2_1_2",	"B2_2_2_1", "B2_2_2_2",
				// not available here:
				// "B4_1", "B4_2",
				// "B4_1_1", "B4_1_2",
				// "B4_1_1_1", "B4_1_1_2",	"B4_1_2_1",	"B4_1_2_2",
				// "B4_2_1",	"B4_2_2",
				// "B4_2_1_1",	"B4_2_1_2",	"B4_2_2_1",	"B4_2_2_2"
			])
			// unset namespaces, do not interfere with other tests
			unsetNamespaces();
		}
	})

	test(" unitA1 with namespaces [UnitA, UnitB], the imports as defined in model3, UnitB recursive ", () => {
		// Unit 'unitA1' imports 'unitB2', 'unitB2' imports 'unitA3', 'unitA3' imports 'unitB4'.
		// test namespace for 'unitA1'
		if (!!unitA1) {
			setNamespaces(['UnitB', 'UnitA']);
			scoper.recursiveImportsB = true;
			//
			const set: FreNamedNode[] = scoper.getVisibleNodes(unitA1);
			// printNames(set);
			// expect(set.length).toBe(8);
			expect(set.map(x => x.name)).toStrictEqual([
				"A1_1",	"A1_2",
				"A1_1_1", "A1_1_2",
				"A1_1_1_1", "A1_1_1_2", "A1_1_2_1", "A1_1_2_2",
				"A1_2_1",	"A1_2_2",
				"A1_2_1_1", "A1_2_1_2", "A1_2_2_1", "A1_2_2_2",
				// in other order:
				"UnitA1", "UnitA3", "UnitB2", "UnitB4",
				// nodes from B2
				"B2_1", "B2_2",
				"B2_1_1", "B2_1_2",
				"B2_1_1_1", "B2_1_1_2",	"B2_1_2_1", "B2_1_2_2",
				"B2_2_1", "B2_2_2",
				"B2_2_1_1", "B2_2_1_2",	"B2_2_2_1", "B2_2_2_2",
				// should be available from re-export, but in different order:
				"A3_1", "A3_2",
				"A3_1_1", "A3_1_2",
				"A3_1_1_1", "A3_1_1_2", "A3_1_2_1", "A3_1_2_2",
				"A3_2_1", "A3_2_2",
				"A3_2_1_1", "A3_2_1_2", "A3_2_2_1", "A3_2_2_2",
				// not available here:
				// "B4_1", "B4_2",
				// "B4_1_1", "B4_1_2",
				// "B4_1_1_1", "B4_1_1_2",	"B4_1_2_1",	"B4_1_2_2",
				// "B4_2_1",	"B4_2_2",
				// "B4_2_1_1",	"B4_2_1_2",	"B4_2_2_1",	"B4_2_2_2"
			])
			// unset namespaces, do not interfere with other tests
			unsetNamespaces();
			scoper.recursiveImportsB = false;
		}
	})

})
