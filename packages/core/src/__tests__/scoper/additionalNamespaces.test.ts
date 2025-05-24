/*
 * This set of tests is based on the simple model created by ModelCreator,
 * which is based on the implementations in scoper-model.
 * All tests determine whether the set of visible nodes of a namespaces is correct,
 * taking into account the hierarchical namespace relationships, and several
 * additional namespaces.
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

describe("FreNamespace visibleNames with additions, but without replacements", () => {
	let model: ScoperModel;
	let unitA1: UnitA;
	let concept_A_2: NodeY;
	let concept_A_2_2: NodeX;
	let unitB1: UnitA;
	let concept_B_4: NodeX;
	let concept_B_4_3: NodeX;

	initializeLanguage();
	const scoper: FreScoper = new AdditionalNamespacesScoper();
	const mainScoper: FreCompositeScoper = new FreCompositeScoper();
	mainScoper.appendScoper(scoper);

	beforeEach(() => {
		// create a simple model where some nodes are namespaces and some are not
		// and get some handles to nodes in the AST
		model = ModelCreator.createSimpleModel();
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

	test(" unitA1 with [NodeX, UnitA], and B_2 as additional NS", () => {
		// test namespace for 'unitA1'
		if (!!unitA1) {
			// add reference to B2 to unitA1, otherwise additional namespace will not be found
			AST.change(() => {
				unitA1.myRef.push(FreNodeReference.create<NodeX>(['B_2'], 'NodeX'));
			})
			setNamespaces(['NodeX', 'UnitA']);
			//
			const set: FreNamedNode[] = scoper.getVisibleNodes(unitA1);
			// printNames(set);
			expect(set.length).toBe(42);
			expect(set.map(x => x.name)).toStrictEqual([
				'A_0', 'A_1', 'A_2', 'A_3', 'A_4',
				'A_0_0', 'A_0_1', 'A_0_2', 'A_0_3', 'A_0_4',
				'A_1_0', 'A_1_1', 'A_1_2', 'A_1_3', 'A_1_4',
				'A_2_0', 'A_2_1', 'A_2_2', 'A_2_3', 'A_2_4',
				'A_3_0', 'A_3_1', 'A_3_2', 'A_3_3', 'A_3_4',
				'A_4_0', 'A_4_1', 'A_4_2', 'A_4_3', 'A_4_4',
				'UnitA1', 'UnitB1',
				'B_0', 'B_1', 'B_2', 'B_3', 'B_4',
				'B_2_0', 'B_2_1', 'B_2_2', 'B_2_3', 'B_2_4',])
			// unset namespaces, do not interfere with other tests
			unsetNamespaces();
		}
	})

	test.skip(" unitA1 with [NodeX, UnitA, UnitB]", () => {
		// test namespace for 'unitA1'
		if (!!unitA1) {
			setNamespaces(['NodeY', 'UnitA', 'UnitB']);
			const set: FreNamedNode[] = scoper.getVisibleNodes(unitA1);
			// printNames(set);
			expect(set.length).toBe(7);
			expect(set.map(x => x.name)).toStrictEqual(['A_0', 'A_1', 'A_2', 'A_3', 'A_4', 'UnitA1', 'UnitB1'])
			// unset namespaces, do not interfere with other tests
			unsetNamespaces();
		}
	})

	test.skip(" unitA1 with [NodeY, UnitA]", () => {
		// test namespace for 'unitA1'
		if (!!unitA1) {
			setNamespaces(['NodeY', 'UnitA']);
			const set: FreNamedNode[] = scoper.getVisibleNodes(unitA1);
			// printNames(set);
			expect(set.length).toBe(37);
			expect(set.map(x => x.name)).toStrictEqual(['A_0', 'A_1', 'A_2', 'A_3', 'A_4', 'UnitA1', 'UnitB1',
				'B_0', 'B_1', 'B_2', 'B_3', 'B_4',
				'B_0_0', 'B_0_1', 'B_0_2', 'B_0_3', 'B_0_4',
				'B_1_0', 'B_1_1', 'B_1_2', 'B_1_3', 'B_1_4',
				'B_2_0', 'B_2_1', 'B_2_2', 'B_2_3', 'B_2_4',
				'B_3_0', 'B_3_1', 'B_3_2', 'B_3_3', 'B_3_4',
				'B_4_0', 'B_4_1', 'B_4_2', 'B_4_3', 'B_4_4'])
			// unset namespaces, do not interfere with other tests
			unsetNamespaces();
		}
	})

	test.skip(" unitA1 with [NodeY, UnitA, UnitB]", () => {
		// test namespace for 'unitA1'
		if (!!unitA1) {
			setNamespaces(['NodeY', 'UnitA', 'UnitB']);
			const set: FreNamedNode[] = scoper.getVisibleNodes(unitA1);
			// printNames(set);
			expect(set.length).toBe(7);
			expect(set.map(x => x.name)).toStrictEqual(['A_0', 'A_1', 'A_2', 'A_3', 'A_4','UnitA1', 'UnitB1'])
			unsetNamespaces();
		}
	})

	test.skip(" unitA1 with [NodeX, NodeY, UnitA, UnitB]", () => {
		// test namespace for 'unitA1'
		if (!!unitA1) {
			setNamespaces(['NodeX', 'NodeY', 'UnitA', 'UnitB']);
			const set: FreNamedNode[] = scoper.getVisibleNodes(unitA1);
			// printNames(set);
			expect(set.length).toBe(7);
			expect(set.map(x => x.name)).toStrictEqual(['A_0', 'A_1', 'A_2', 'A_3', 'A_4','UnitA1', 'UnitB1'])
			// unset namespaces, do not interfere with other tests
			unsetNamespaces();
		}
	})

	// Allnames:
	// expect(set.map(x => x.name)).toStrictEqual(['UnitA1', 'UnitB1',
	// 	'A_0', 'A_1', 'A_2', 'A_3', 'A_4',
	// 	'A_0_0', 'A_0_1', 'A_0_2', 'A_0_3', 'A_0_4',
	// 	'A_1_0', 'A_1_1', 'A_1_2', 'A_1_3', 'A_1_4',
	// 	'A_2_0', 'A_2_1', 'A_2_2', 'A_2_3', 'A_2_4',
	// 	'A_3_0', 'A_3_1', 'A_3_2', 'A_3_3', 'A_3_4',
	// 	'A_4_0', 'A_4_1', 'A_4_2', 'A_4_3', 'A_4_4',
	// 	'B_0', 'B_1', 'B_2', 'B_3', 'B_4',
	// 	'B_0_0', 'B_0_1', 'B_0_2', 'B_0_3', 'B_0_4',
	// 	'B_1_0', 'B_1_1', 'B_1_2', 'B_1_3', 'B_1_4',
	// 	'B_2_0', 'B_2_1', 'B_2_2', 'B_2_3', 'B_2_4',
	// 	'B_3_0', 'B_3_1', 'B_3_2', 'B_3_3', 'B_3_4',
	// 	'B_4_0', 'B_4_1', 'B_4_2', 'B_4_3', 'B_4_4'])
})
