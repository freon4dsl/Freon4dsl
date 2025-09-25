import {
	FreMetaClassifier,
	FreMetaLanguage,
	FreMetaPrimitiveProperty,
	FreMetaPrimitiveType,
	FreMetaProperty
} from '../../languagedef/metalanguage/index.js';
import { Names } from './Names.js';

export class GenerationUtil {
	/**
	 * Returns the type of the property 'prop' without taking into account 'isList', 'isOptional', or 'isPart'.
	 */
	public static getBaseTypeAsString(property: FreMetaProperty): string {
		const myType: FreMetaClassifier = property.type;
		if (property instanceof FreMetaPrimitiveProperty) {
			if (myType === FreMetaPrimitiveType.identifier) {
				return "string";
			} else if (myType === FreMetaPrimitiveType.string) {
				return "string";
			} else if (myType === FreMetaPrimitiveType.boolean) {
				return "boolean";
			} else if (myType === FreMetaPrimitiveType.number) {
				return "number";
			}
			return "any";
		} else {
			return Names.classifier(myType);
		}
	}

	/**
	 * Returns the type of the property 'prop' without taking into account 'isList', 'isOptional', or 'isPart'.
	 * This returns the Freon type, so also 'identifier', different from the method above.
	 */
	public static getFreonBaseTypeAsString(property: FreMetaProperty): string {
		const myType = property.type;
		if (property instanceof FreMetaPrimitiveProperty) {
			if (myType === FreMetaPrimitiveType.identifier) {
				return "identifier";
			} else if (myType === FreMetaPrimitiveType.string) {
				return "string";
			} else if (myType === FreMetaPrimitiveType.boolean) {
				return "boolean";
			} else if (myType === FreMetaPrimitiveType.number) {
				return "number";
			}
			return "any";
		} else {
			return Names.classifier(myType);
		}
	}
	/**
	 * Returns the type of the property 'prop' TAKING INTO ACCOUNT 'isList' or 'isPart'
	 */
	public static getTypeAsString(property: FreMetaProperty): string {
		let type: string = this.getBaseTypeAsString(property);
		if (!property.isPart) {
			type = `${Names.FreNodeReference}<${type}>`;
		}
		if (property.isList) {
			type = type + "[]";
		}
		return type;
	}

	public static allConceptsAndUnits(language: FreMetaLanguage): Set<string> {
		return new Set<string>([
			...language.concepts.map((c) => Names.concept(c)),
			...language.units.map((c) => Names.classifier(c)),
			Names.classifier(language.modelConcept)
		]);
	}

	public static allConceptsInterfacesAndUnits(language: FreMetaLanguage): Set<string> {
		return new Set<string>([
			...language.concepts?.map(concept => Names.concept(concept)),
			...language.interfaces?.map(intf => Names.interface(intf)),
			...language.units?.map(intf => Names.classifier(intf))
		])
	}
}
