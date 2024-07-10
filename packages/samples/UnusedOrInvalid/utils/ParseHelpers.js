"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseHelpers = void 0;
var ParseHelpers = /** @class */ (function () {
    function ParseHelpers() {
    }
    ParseHelpers.printTree = function (node, indent) {
        var _a;
        var result = '';
        if (node !== null && node !== undefined) {
            if (indent === null || indent === undefined) {
                indent = 0;
            }
            if (node.isLeaf) {
                result += ParseHelpers.printLeaf(node, indent);
            }
            else if (node.isBranch) {
                result += ParseHelpers.printBranch(node, indent);
            }
            else if (Array.isArray(node)) {
                node.forEach(function (n) {
                    result += ParseHelpers.printTree(n, indent) + "\n";
                });
            }
            else {
                result += 'UNKNOWN node TYPE: ' + node.constructor.name + ' (' + ((_a = node.matchedText) === null || _a === void 0 ? void 0 : _a.trimEnd()) + ')';
            }
        }
        return result;
    };
    ParseHelpers.printLeaf = function (node, indent) {
        var tmp = node === null || node === void 0 ? void 0 : node.nonSkipMatchedText.trim();
        return "LEAF [" + tmp + "]";
    };
    ParseHelpers.printBranch = function (branch, indent) {
        var tmp = '';
        var indentStr = '';
        for (var i = 0; i < indent; i++) {
            indentStr += '\t';
        }
        var children = branch.nonSkipChildren.toArray();
        indent++;
        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
            var child = children_1[_i];
            tmp += '\n\t' + indentStr + ParseHelpers.printTree(child, indent);
        }
        return "BRANCH ".concat(branch.name, " #children[").concat(children === null || children === void 0 ? void 0 : children.length, "] [ ").concat(tmp, " \n").concat(indentStr, "]");
    };
    return ParseHelpers;
}());
exports.ParseHelpers = ParseHelpers;
