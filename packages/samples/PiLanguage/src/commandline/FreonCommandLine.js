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
exports.FreonCommandLine = void 0;
// Generated by the Freon Language Generator.
var ts_command_line_1 = require("@rushstack/ts-command-line");
var FreonCommandLine = /** @class */ (function (_super) {
    __extends(FreonCommandLine, _super);
    function FreonCommandLine() {
        return _super.call(this, {
            toolFilename: "lionweb",
            toolDescription: "Freon toolset for playing with LionWeb.",
        }) || this;
    }
    FreonCommandLine.prototype.onDefineParameters = function () {
        this.verboseArg = this.defineFlagParameter({
            parameterLongName: "--verbose",
            parameterShortName: "-v",
            description: "Show extra logging detail",
        });
    };
    FreonCommandLine.prototype.onExecute = function () {
        try {
            return _super.prototype.onExecute.call(this);
        }
        catch (e) {
            console.error("Exception in onExecute: " + e.message + "\n" + e.stack);
        }
        return null;
    };
    return FreonCommandLine;
}(ts_command_line_1.CommandLineParser));
exports.FreonCommandLine = FreonCommandLine;
