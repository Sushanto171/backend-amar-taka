"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = exports.TypedEventEmitter = void 0;
const events_1 = require("events");
class TypedEventEmitter {
    constructor() {
        this.emitter = new events_1.EventEmitter();
    }
    on(event, listener) {
        this.emitter.on(event, listener);
        return this;
    }
    emit(event, payload) {
        return this.emitter.emit(event, payload);
    }
}
exports.TypedEventEmitter = TypedEventEmitter;
exports.eventBus = new TypedEventEmitter();
