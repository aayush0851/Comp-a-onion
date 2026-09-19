import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { chatApi } from '../api';
import { useAppDispatch } from '../store';

// While a chat is on screen it counts as read: clears its unread flag on open, keeps new
// messages from flagging it, and moves the server's read marker again on leave.
export function useChatThreadRead(postId: string, peerId?: string) {
  const dispatch = useAppDispatch();
  useFocusEffect(useCallback(() => {
    const key = chatApi.threadKey(postId, peerId);
    const markRead = () => {
      dispatch({ type: 'CLEAR_CHAT_UNREAD', key });
      chatApi.markThreadRead(postId, peerId).catch(() => {});
    };
    chatApi.setOpenThread(key);
    markRead();
    return () => { chatApi.setOpenThread(null); markRead(); };
  }, [postId, peerId, dispatch]));
}
