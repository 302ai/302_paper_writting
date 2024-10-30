import { Event } from '@/types';

type EventHandler = (data: any) => void;

class EventCenter {
  private handlers: Record<string, EventHandler[]> = {};

  subscribe(eventType: string, handler: EventHandler) {
    if (!this.handlers[eventType]) {
      this.handlers[eventType] = [];
    }
    this.handlers[eventType].push(handler);
  }

  unsubscribe(eventType: string, handler: EventHandler) {
    if (this.handlers[eventType]) {
      this.handlers[eventType] = this.handlers[eventType].filter(
        (h) => h !== handler
      );
    }
  }

  dispatch(event: Event) {
    const handlers = this.handlers[event.event];

    if (handlers) {
      handlers.forEach((handler) => handler(event.data));
    }
  }
}

export const eventCenter = new EventCenter();
