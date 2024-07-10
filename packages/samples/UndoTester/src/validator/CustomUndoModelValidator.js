"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomUndoModelValidator = void 0;
var UndoModelDefaultWorker_1 = require("../utils/gen/UndoModelDefaultWorker");
var CustomUndoModelValidator = /** @class */ (function (_super) {
    __extends(CustomUndoModelValidator, _super);
    function CustomUndoModelValidator() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.errorList = [];
        return _this;
    }
    return CustomUndoModelValidator;
}(UndoModelDefaultWorker_1.UndoModelDefaultWorker));
exports.CustomUndoModelValidator = CustomUndoModelValidator;
