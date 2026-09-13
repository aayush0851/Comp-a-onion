import type { MessageEvent } from '@nestjs/common';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { fromEvent, interval, merge, type Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

const HEARTBEAT_MS = 20000;

// Render's proxy (and most others) drops an SSE connection that's been silent
// too long, so every stream gets a periodic no-op 'ping' event the client can ignore.
export function sseStream<T>(
  emitter: EventEmitter2,
  event: string,
  matches: (payload: T) => boolean,
  toData: (payload: T) => object,
): Observable<MessageEvent> {
  const data$ = fromEvent<T>(emitter, event).pipe(
    filter(matches),
    map((payload): MessageEvent => ({ data: toData(payload) })),
  );
  const heartbeat$ = interval(HEARTBEAT_MS).pipe(map((): MessageEvent => ({ type: 'ping', data: undefined })));
  return merge(data$, heartbeat$);
}
