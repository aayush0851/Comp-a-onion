import type { ChatMessage } from '../../data';

export type ChatState = {
  msgs: ChatMessage[];
  requesterMsgs: Record<string, ChatMessage[]>;
};

export type ChatAction =
  | { type: 'SEND_MSG'; text: string }
  | { type: 'SEND_REQUESTER_MSG'; requesterId: string; text: string };
