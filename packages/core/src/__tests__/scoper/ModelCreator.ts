import { IWithName, NodeY, NodeX, ScoperModel, UnitA, UnitB } from './scoper-model';
import { AST } from '../../change-manager';

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
			model = ScoperModel.create({ name: 'MODEL', noNameSpaceUnits: [unit1], nameSpaceUnits: [unit2] });
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
			model = ScoperModel.create({ name: 'MODEL', noNameSpaceUnits: [unit1], nameSpaceUnits: [unit2] });
		})
		return model;
	}
}
