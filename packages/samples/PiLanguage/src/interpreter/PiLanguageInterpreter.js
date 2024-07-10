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
exports.PiLanguageInterpreter = void 0;
var PiLanguageInterpreterBase_1 = require("./gen/PiLanguageInterpreterBase");
var main;
/**
 * The class containing all interpreter functions twritten by thge language engineer.
 * This class is initially empty,  and will not be overwritten if it already exists..
 */
var PiLanguageInterpreter = /** @class */ (function (_super) {
    __extends(PiLanguageInterpreter, _super);
    function PiLanguageInterpreter(m) {
        var _this = _super.call(this) || this;
        main = m;
        return _this;
    }
    return PiLanguageInterpreter;
}(PiLanguageInterpreterBase_1.PiLanguageInterpreterBase));
exports.PiLanguageInterpreter = PiLanguageInterpreter;
