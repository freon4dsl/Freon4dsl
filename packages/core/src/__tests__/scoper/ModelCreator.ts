import { IWithName, NodeY, NodeX, ScoperModel, UnitA, UnitB } from './scoper-model/index.js';
import { AST } from '../../change-manager/index.js';
import { FreNodeReference } from '../../ast/index.js';

export class ModelCreator {

	static createSimpleModel(): ScoperModel {
		let model: ScoperModel;
		AST.change( () => {
			let children : IWithName[] = [];
			for (let i = 0; i < 5; i++) {
				let grandchildren : IWithName[] = [];
				for (let j = 0; j < 5; j++) {
					grandchildren.push(NodeX.create({ name: 'A_'+ i + "_" + j}))
				}
				children.push(NodeY.create({ name: 'A_'+ i, childrenWithName: grandchildren}))
			}
			const unit1 = UnitA.create({ name: 'UnitA1', childrenWithName: children })

			children = [];
			for (let i = 0; i < 5; i++) {
				let grandchildren : IWithName[] = [];
				for (let j = 0; j < 5; j++) {
					grandchildren.push(NodeX.create({ name: 'B_'+ i + "_" + j}))
				}
				children.push(NodeX.create({ name: 'B_'+ i, childrenWithName: grandchildren}))
			}
			const unit2 = UnitB.create({ name: 'UnitB1', childrenWithName: children })
			model = ScoperModel.create({ name: 'MODEL', A_units: [unit1], B_units: [unit2] });
		})
		return model;
	}

	static createModel2(): ScoperModel {
		let model: ScoperModel;
		AST.change( () => {
			let children : IWithName[] = [];
			for (let i = 1; i < 3; i++) {
				let grandchildren : IWithName[] = [];
				for (let j = 1; j < 3; j++) {
					let grandgrandchildren : IWithName[] = [];
					for (let l = 1; l < 3; l++) {
						grandgrandchildren.push(NodeY.create({ name: 'A_' + i + "_" + j + "_" + l }))
					}
					grandchildren.push(NodeX.create({ name: 'A_'+ i + "_" + j, childrenWithName: grandgrandchildren}))
				}
				children.push(NodeY.create({ name: 'A_'+ i, childrenWithName: grandchildren}))
			}
			const unit1 = UnitA.create({ name: 'UnitA1', childrenWithName: children })

			children = [];
			for (let i = 1; i < 3; i++) {
				let grandchildren : IWithName[] = [];
				for (let j = 1; j < 3; j++) {
					let grandgrandchildren : IWithName[] = [];
					for (let l = 1; l < 3; l++) {
						grandgrandchildren.push(NodeY.create({ name: 'B_' + i + "_" + j + "_" + l }))
					}
					grandchildren.push(NodeX.create({ name: 'B_'+ i + "_" + j, childrenWithName: grandgrandchildren}))
				}
				children.push(NodeX.create({ name: 'B_'+ i, childrenWithName: grandchildren}))
			}
			const unit2 = UnitB.create({ name: 'UnitB1', childrenWithName: children })
			model = ScoperModel.create({ name: 'MODEL', A_units: [unit1], B_units: [unit2] });
		})
		return model;
	}

	static createModel3(): ScoperModel {
		let model: ScoperModel;
		AST.change( () => {
			let children : IWithName[] = [];
			for (let i = 1; i < 3; i++) {
				let grandchildren : IWithName[] = [];
				for (let j = 1; j < 3; j++) {
					let grandgrandchildren : IWithName[] = [];
					for (let l = 1; l < 3; l++) {
						grandgrandchildren.push(NodeY.create({ name: 'A1_' + i + "_" + j + "_" + l }))
					}
					grandchildren.push(NodeX.create({ name: 'A1_'+ i + "_" + j, childrenWithName: grandgrandchildren}))
				}
				children.push(NodeY.create({ name: 'A1_'+ i, childrenWithName: grandchildren}))
			}
			const unit1 = UnitA.create({ name: 'UnitA1', childrenWithName: children })

			children = [];
			for (let i = 1; i < 3; i++) {
				let grandchildren : IWithName[] = [];
				for (let j = 1; j < 3; j++) {
					let grandgrandchildren : IWithName[] = [];
					for (let l = 1; l < 3; l++) {
						grandgrandchildren.push(NodeY.create({ name: 'B2_' + i + "_" + j + "_" + l }))
					}
					grandchildren.push(NodeX.create({ name: 'B2_'+ i + "_" + j, childrenWithName: grandgrandchildren}))
				}
				children.push(NodeX.create({ name: 'B2_'+ i, childrenWithName: grandchildren}))
			}
			const unit2 = UnitB.create({ name: 'UnitB2', childrenWithName: children })

			children = [];
			for (let i = 1; i < 3; i++) {
				let grandchildren : IWithName[] = [];
				for (let j = 1; j < 3; j++) {
					let grandgrandchildren : IWithName[] = [];
					for (let l = 1; l < 3; l++) {
						grandgrandchildren.push(NodeY.create({ name: 'A3_' + i + "_" + j + "_" + l }))
					}
					grandchildren.push(NodeX.create({ name: 'A3_'+ i + "_" + j, childrenWithName: grandgrandchildren}))
				}
				children.push(NodeY.create({ name: 'A3_'+ i, childrenWithName: grandchildren}))
			}
			const unit3 = UnitA.create({ name: 'UnitA3', childrenWithName: children })

			children = [];
			for (let i = 1; i < 3; i++) {
				let grandchildren : IWithName[] = [];
				for (let j = 1; j < 3; j++) {
					let grandgrandchildren : IWithName[] = [];
					for (let l = 1; l < 3; l++) {
						grandgrandchildren.push(NodeY.create({ name: 'B4_' + i + "_" + j + "_" + l }))
					}
					grandchildren.push(NodeX.create({ name: 'B4_'+ i + "_" + j, childrenWithName: grandgrandchildren}))
				}
				children.push(NodeX.create({ name: 'B4_'+ i, childrenWithName: grandchildren}))
			}
			const unit4 = UnitB.create({ name: 'UnitB4', childrenWithName: children })

			// There are four units in this model.
			// Unit 'unitA1' imports 'unitB2', 'unitB2' imports 'unitA3', 'unitA3' imports 'unitB4'.
			unit1.myRef.push(FreNodeReference.create<UnitB>(unit2, "UnitB"));
			unit2.myRef.push(FreNodeReference.create<UnitA>(unit3, "UnitA"));
			unit3.myRef.push(FreNodeReference.create<UnitB>(unit4, "UnitB"));
			// todo test what happens when we add the following line:
			// unit4.myRef.push(FreNodeReference.create<UnitB>(unit1, "UnitB"));
			model = ScoperModel.create({ name: 'MODEL', A_units: [unit1, unit3], B_units: [unit2, unit4] });
		})
		return model;
	}
}
