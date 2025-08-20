import { EventEmitter } from "events";
import { IEvents } from "./event.interface";

export class TypedEventEmitter<Events> {
  emitter = new EventEmitter();
  on<k extends keyof Events>(
    event: k,
    listener: (payload: Events[k]) => void
  ): this {
    this.emitter.on(event as string, listener);
    return this;
  }

  emit<k extends keyof Events>(event: k, payload: Events[k]): boolean {
    return this.emitter.emit(event as string, payload);
  }
}

export const eventBus = new TypedEventEmitter<IEvents>();
