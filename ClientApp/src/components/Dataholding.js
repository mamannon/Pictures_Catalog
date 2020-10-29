"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Dataholding = /** @class */ (function () {
    function Dataholding() {
        this.clickedNaviButton = false;
    }
    Dataholding.prototype.setClickedNaviButton = function (data) {
        this.clickedNaviButton = data;
    };
    Dataholding.prototype.getClickedNaviButton = function () {
        return this.clickedNaviButton;
    };
    return Dataholding;
}());
exports.default = new Dataholding();
//# sourceMappingURL=Dataholding.js.map