"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var createEpicMiddleware_1 = require("./createEpicMiddleware");
exports.createEpicMiddleware = createEpicMiddleware_1.createEpicMiddleware;
var StateObservable_1 = require("./StateObservable");
exports.StateObservable = StateObservable_1.StateObservable;
var combineEpics_1 = require("./combineEpics");
exports.combineEpics = combineEpics_1.combineEpics;
var operators_1 = require("./operators");
exports.ofType = operators_1.ofType;
// eslint-disable-next-line camelcase
var console_1 = require("./utils/console");
exports.__FOR_TESTING__resetDeprecationsSeen = console_1.resetDeprecationsSeen;
