"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var StateObservable_1 = require("./StateObservable");
var console_1 = require("./utils/console");
function createEpicMiddleware(options) {
    if (options === void 0) { options = {}; }
    // This isn't great. RxJS doesn't publicly export the constructor for
    // QueueScheduler nor QueueAction, so we reach in. We need to do this because
    // we don't want our internal queuing mechanism to be on the same queue as any
    // other RxJS code outside of redux-observable internals.
    var QueueScheduler = rxjs_1.queueScheduler.constructor;
    var uniqueQueueScheduler = new QueueScheduler(rxjs_1.queueScheduler.SchedulerAction);
    if (process.env.NODE_ENV !== 'production' && typeof options === 'function') {
        throw new TypeError('Providing your root Epic to `createEpicMiddleware(rootEpic)` is no longer supported, instead use `epicMiddleware.run(rootEpic)`\n\nLearn more: https://redux-observable.js.org/MIGRATION.html#setting-up-the-middleware');
    }
    var epic$ = new rxjs_1.Subject();
    var store;
    var epicMiddleware = function (_store) {
        if (process.env.NODE_ENV !== 'production' && store) {
            // https://github.com/redux-observable/redux-observable/issues/389
            console_1.warn('this middleware is already associated with a store. createEpicMiddleware should be called for every store.\n\nLearn more: https://goo.gl/2GQ7Da');
        }
        store = _store;
        var actionSubject$ = new rxjs_1.Subject();
        var stateSubject$ = new rxjs_1.Subject();
        var action$ = actionSubject$
            .asObservable()
            .pipe(operators_1.observeOn(uniqueQueueScheduler));
        var state$ = new StateObservable_1.StateObservable(stateSubject$.pipe(operators_1.observeOn(uniqueQueueScheduler)), store.getState());
        var result$ = epic$.pipe(operators_1.map(function (epic) {
            var output$ = epic(action$, state$, options.dependencies);
            if (!output$) {
                throw new TypeError("Your root Epic \"" + (epic.name ||
                    '<anonymous>') + "\" does not return a stream. Double check you're not missing a return statement!");
            }
            return output$;
        }), operators_1.mergeMap(function (output$) {
            return rxjs_1.from(output$).pipe(operators_1.subscribeOn(uniqueQueueScheduler), operators_1.observeOn(uniqueQueueScheduler));
        }));
        result$.subscribe(store.dispatch);
        return function (next) {
            return function (action) {
                // Downstream middleware gets the action first,
                // which includes their reducers, so state is
                // updated before epics receive the action
                var result = next(action);
                // It's important to update the state$ before we emit
                // the action because otherwise it would be stale
                stateSubject$.next(store.getState());
                actionSubject$.next(action);
                return result;
            };
        };
    };
    epicMiddleware.run = function (rootEpic) {
        if (process.env.NODE_ENV !== 'production' && !store) {
            console_1.warn('epicMiddleware.run(rootEpic) called before the middleware has been setup by redux. Provide the epicMiddleware instance to createStore() first.');
        }
        epic$.next(rootEpic);
    };
    return epicMiddleware;
}
exports.createEpicMiddleware = createEpicMiddleware;
