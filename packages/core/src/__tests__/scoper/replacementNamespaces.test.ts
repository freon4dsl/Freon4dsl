/*
 * This set of tests is based on model2 created by ModelCreator,
 * which is based on the implementations in scoper-model.
 * All tests determine whether the set of visible nodes of a namespaces is correct,
 * taking into account the hierarchical namespace relationships, and several
 * replacement namespaces.
 *
 * NOTE: the actual replacements are defined in the ReplacementNamespaceScoper!
 * We regulate the actual replacement with a set of boolean properties in this class,
 * e.g. useReference, which is used in test "A_2_2 with [NodeY, UnitB], and B_2 as replacement NS".
 */
import { beforeEach, describe, test, expect } from 'vitest';
import { ScoperModel } from './scoper-model/ScoperModel.js';
import { ModelCreator } from './ModelCreator';
import { initializeLanguage, NodeX, NodeY, UnitA, UnitB } from './scoper-model';
import { FreCompositeScoper, FreScoper, } from '../../scoper';
import { FreNamedNode, FreNodeReference } from '../../ast';
import { FreLanguage } from '../../language';
import { AdditionalNamespacesScoper } from './scoper-model/AdditionalNamespacesScoper.js';
import { AST } from '../../change-manager';
import { FreLanguageEnvironment } from '../../environment';
import { ReplacementNamespaceScoper } from './scoper-model/ReplacementNamespaceScoper';

// !!!!!!!!!!!!!!!!!! model name may not be in fqn. This name is not visible in the model itself!!!!!!!!!!!!!!!!!!

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
	let unitB1: UnitA;
	let concept_B_4: NodeX;
	let concept_B_4_3: NodeX;

	initializeLanguage();
	const scoper: ReplacementNamespaceScoper = new ReplacementNamespaceScoper();
	const mainScoper: FreCompositeScoper = new FreCompositeScoper();
	mainScoper.appendScoper(scoper);

	beforeEach(() => {
		// create a simple model where some nodes are namespaces and some are not
		// and get some handles to nodes in the AST
		model = ModelCreator.createModel2();
		unitA1 = model.findUnit('UnitA1') as UnitA;
		concept_A_2 = unitA1.childrenWithName.find(child => child.name === 'A_2') as NodeY;
		if (!!concept_A_2) {
			concept_A_2_2 = concept_A_2.childrenWithName.find(child => child.name === 'A_2_2') as NodeX;
		}
		unitB1 = model.findUnit('UnitB1') as UnitB;
		concept_B_4 = unitB1.childrenWithName.find(child => child.name === 'B_4') as NodeX;
		if (!!concept_B_4) {
			concept_B_4_3 = concept_B_4.childrenWithName.find(child => child.name === 'B_4_3') as NodeX;
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
		// visible should be: 50 grandchildren plus 10 children plus 2 units
		expect(set.length).toBe(30);
		expect(set.map(x => x.name)).toStrictEqual(['UnitA1', 'UnitB1',
			'A_1', 'A_2',
			'A_1_1', 'A_1_2',
			'A_1_1_1', 'A_1_1_2', 'A_1_2_1', 'A_1_2_2',
			'A_2_1', 'A_2_2',
			'A_2_1_1', 'A_2_1_2', 'A_2_2_1', 'A_2_2_2',
			'B_1', 'B_2',
			'B_1_1', 'B_1_2',
			'B_1_1_1', 'B_1_1_2', 'B_1_2_1', 'B_1_2_2',
			'B_2_1', 'B_2_2',
			'B_2_1_1', 'B_2_1_2', 'B_2_2_1', 'B_2_2_2'])
	})

	test(" unitA1 with [NodeX, UnitA], and UnitB1 as replacement NS", () => {
		// test namespace for 'unitA1'
		if (!!unitA1) {
			setNamespaces(['NodeX', 'UnitA']);
			scoper.useUnitB = true;
			//
			const set: FreNamedNode[] = scoper.getVisibleNodes(unitA1);
			printNames(set);
			expect(set.length).toBe(8);
			expect(set.map(x => x.name)).toStrictEqual([
				'A_1', 'A_2',
				'A_1_1', 'A_1_2',
				'A_2_1', 'A_2_2',
				'B_1', 'B_2'])
			// unset namespaces, do not interfere with other tests
			unsetNamespaces();
			scoper.useUnitB = false;
		}
	})

	test(" unitA1 with [NodeX, UnitA], and children of UnitB1 as replacement NS", () => {
		// test namespace for 'unitA1'
		if (!!unitA1) {
			setNamespaces(['NodeX', 'UnitA']);
			scoper.useNodeX = true;
			//
			const set: FreNamedNode[] = scoper.getVisibleNodes(unitA1);
			printNames(set);
			expect(set.length).toBe(10);
			expect(set.map(x => x.name)).toStrictEqual([
				'A_1', 'A_2',
				'A_1_1', 'A_1_2',
				'A_2_1', 'A_2_2',
				'B_1_1', 'B_1_2',
				'B_2_1', 'B_2_2'])
			// unset namespaces, do not interfere with other tests
			unsetNamespaces();
			scoper.useNodeX = false;
		}
	})

	test(" A_2_2 with [NodeY, 'NodeX'], and B_2 as replacement NS", () => {
		// test namespace for 'A_2_2'
		if (!!concept_A_2_2) {
			setNamespaces(['NodeY', 'NodeX']);
			scoper.useReference = true;
			const set: FreNamedNode[] = scoper.getVisibleNodes(concept_A_2_2);
			// printNames(set);
			// expect(set.length).toBe(12);
			expect(set.map(x => x.name)).toStrictEqual([
				"A_2_2_1",
				"A_2_2_2",
				"A_2_1",
				"A_2_2",
				"B_2_1",
				"B_2_2",
				// The following are not visible anymore, because of the replacement
				// "UnitA1",
				// "UnitB1",
				// "A_1",
				// "A_2",
				// "B_1",
				// "B_2",
			])
			// unset namespaces, do not interfere with other tests
			unsetNamespaces();
			scoper.useReference = false;
		}
	})
})
