import { Names } from '../on-lang/Names.js';
import {
	FreInstanceExp,
	FreLangAppliedFeatureExp,
	FreLangExp,
	FreLangFunctionCallExp,
	FreLangSelfExp
} from '../../languagedef/metalanguage/index.js';
import { FreMetaConceptProperty } from '../../languagedef/metalanguage/index.js';

export class ExpressionUtil {

	/**
	 * Returns a string representation of 'exp' that can be used in TypeScript code.
	 * @param exp       the expression to turn into TypeScript
	 * @param paramName the name to be used for the
	 * @param noRef
	 */
	public static langExpToTypeScript(exp: FreLangExp, paramName: string, noRef?: boolean): string {
		let result: string;
		if (exp instanceof FreLangSelfExp) {
			result = `${paramName}.${this.langExpToTypeScript(exp.appliedfeature, paramName, noRef)}`;
		} else if (exp instanceof FreLangFunctionCallExp) {
			if (exp.sourceName === "ancestor") {
				const metaType: string = this.langExpToTypeScript(exp.actualparams[0], paramName, noRef); // there is always 1 param to this function
				result = `this.ancestor(${paramName}, "${metaType}") as ${metaType}`;
			} else {
				result = `this.${exp.sourceName} (${exp.actualparams
					.map((param) => `${this.langExpToTypeScript(param, paramName, noRef)}`)
					.join(", ")})`;
			}
			if (!!exp.appliedfeature) {
				result = `(${result}).${this.langExpToTypeScript(exp.appliedfeature, paramName, noRef)}`;
			}
		} else if (exp instanceof FreLangAppliedFeatureExp) {
			// TODO this should be replaced by special getters and setters for reference properties
			// and the unparser should be adjusted to this
			const isRef = noRef ? false : this.isReferenceProperty(exp);
			result =
				(isRef ? Names.refName(exp.referredElement) : exp.sourceName) +
				(exp.appliedfeature ? `?.${this.langExpToTypeScript(exp.appliedfeature, paramName, noRef)}` : "");
		} else if (exp instanceof FreInstanceExp) {
			if (exp.sourceName === "container") {
				result = `${paramName}.freOwner().${exp.instanceName}`;
			} else {
				result = `${exp.sourceName}.${exp.instanceName}`;
			}
		} else {
			result = exp?.toFreString();
		}
		return result;
	}

	/**
	 * Returns true if the feature to which 'exp' refers, is marked to be a reference
	 * property in the language.
	 * @param exp
	 */
	private static isReferenceProperty(exp: FreLangAppliedFeatureExp) {
		let isRef: boolean = false;
		const ref = exp.$referredElement?.referred;
		if (!!ref) {
			// should be present, otherwise it is an incorrect model
			// now see whether it is marked in the .ast file as 'reference'
			isRef = ref instanceof FreMetaConceptProperty && !ref.isPart && !ref.isList;
		}
		return isRef;
	}
}
