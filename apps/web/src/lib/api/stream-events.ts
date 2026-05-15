import type { Message } from "./types";

export type StreamChunkEvent = { type: "chunk"; delta: string };
export type StreamDoneEvent = { type: "done"; message: Message };
export type StreamErrorEvent = { type: "error"; error: string };

export type StreamMessageEvent = StreamChunkEvent | StreamDoneEvent | StreamErrorEvent;
