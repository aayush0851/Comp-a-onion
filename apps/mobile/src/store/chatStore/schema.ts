// Unread message counts keyed by chat threadKey (see api/chat.ts); a key is absent once read.
// Drives the dot on the Chats tab and the count on each row of the list.
export type ChatState = {
  chatUnread: Record<string, number>;
};

export type ChatAction =
  | { type: 'SET_CHAT_UNREAD'; counts: Record<string, number> }
  | { type: 'BUMP_CHAT_UNREAD'; key: string }
  | { type: 'CLEAR_CHAT_UNREAD'; key: string };
