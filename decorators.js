"use strict";
exports.__esModule = true;
function convertDate() {
    return function (target, propertyKey, descriptor) {
        return Object.defineProperty(target, propertyKey, descriptor);
    };
}
exports.convertDate = convertDate;
