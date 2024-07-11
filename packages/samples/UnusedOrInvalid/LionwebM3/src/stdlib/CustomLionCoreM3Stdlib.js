"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomLionCoreM3Stdlib = void 0;
var index_1 = require("../language/gen/index");
var CustomLionCoreM3Stdlib = /** @class */ (function () {
    function CustomLionCoreM3Stdlib() {
        this.library = [];
        var booleanType = new index_1.PrimitiveType("LionCore-builtins-Boolean");
        booleanType.name = "Boolean";
        this.library.push(booleanType);
        var stringType = new index_1.PrimitiveType("LionCore-builtins-String");
        stringType.name = "String";
        this.library.push(stringType);
        var integerType = new index_1.PrimitiveType("LionCore-builtins-Integer");
        integerType.name = "Integer";
        this.library.push(integerType);
        var jsonType = new index_1.PrimitiveType("LionCore-builtins-JSON");
        jsonType.name = "JSON";
        this.library.push(jsonType);
    }
    Object.defineProperty(CustomLionCoreM3Stdlib.prototype, "elements", {
        // add all your extra predefined instances here
        get: function () {
            return this.library;
        },
        enumerable: false,
        configurable: true
    });
    return CustomLionCoreM3Stdlib;
}());
exports.CustomLionCoreM3Stdlib = CustomLionCoreM3Stdlib;
