"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LionWeb2FreonTemplate = void 0;
var LionWeb2FreonTemplate = /** @class */ (function () {
    function LionWeb2FreonTemplate() {
    }
    LionWeb2FreonTemplate.prototype.generateFreonAst = function (metamodel) {
        var _this = this;
        var result = "";
        result += ("language ".concat(metamodel.name, "\n"));
        metamodel.entities.forEach(function (entity) {
            switch (entity.freLanguageConcept()) {
                case "Concept":
                    var concept = entity;
                    var abstract = concept.abstract ? "abstract " : "";
                    var base = !!(concept.extends) ? " base ".concat(concept.extends.name) : "";
                    var implments = concept.implements.length !== 0 ? "implements ".concat(concept.implements.map(function (i) { return i.name; }).join(", "), " ") : "";
                    result += ("".concat(abstract, "concept ").concat(concept.name).concat(base).concat(implments, " {\n"));
                    entity.features.forEach(function (feature) {
                        result += _this.exportFeature(feature) + "\n";
                    });
                    break;
                case "ConceptInterface":
                    var intface = entity;
                    var xtends = intface.extends.length !== 0 ? "extends ".concat(intface.extends.map(function (i) { return i.name; }).join(", "), " ") : "";
                    result += ("interface ".concat(intface.name, " {\n"));
                    intface.features.forEach(function (feature) {
                        result += _this.exportFeature(feature) + "\n";
                    });
                    break;
                case "Enumeration":
                    var enumeration = entity;
                    result += ("limited ".concat(enumeration.name, " {\n"));
                    enumeration.literals.forEach(function (literal) {
                        result += ("    ".concat(literal.name, ";\n"));
                    });
                    break;
                case "PrimitiveType":
                    var primType = entity;
                    result += ("concept ".concat(primType.name, " { // primitive\n"));
                    break;
                default:
                    console.log("Unknown concept type =>  ".concat(entity.name, ": ").concat(entity.freLanguageConcept()));
            }
            ;
            result += ("}\n");
        });
        return result;
    };
    LionWeb2FreonTemplate.prototype.exportFeature = function (feature) {
        switch (feature.freLanguageConcept()) {
            case "Property":
                return ("    ".concat(feature.name, ": ").concat(feature.type.name, ";"));
                break;
            case "Reference":
                return ("    reference ".concat(feature.name, ": ").concat(feature.type.name).concat(feature.multiple ? "[]" : "", ";"));
                break;
            case "Containment":
                return ("    ".concat(feature.name, ": ").concat(feature.type.name).concat(feature.multiple ? "[]" : "", ";"));
                break;
            default:
                return ("    ".concat(feature.name, ": ").concat(feature.freLanguageConcept()));
        }
    };
    return LionWeb2FreonTemplate;
}());
exports.LionWeb2FreonTemplate = LionWeb2FreonTemplate;
