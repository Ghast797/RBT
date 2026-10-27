import React from 'react';
import { useMissionStore } from '../store/useMissionStore';
import { ChatView } from './ChatView';

export const ChatApp: React.FC = () => {
  const {
    chatMessages,
    chatAvailableChoices,
    isByteMasterTyping,
    isChatAttentionActive,
    chooseChatOption
  } = useMissionStore();

  return (
    <ChatView
      messages={chatMessages}
      choices={chatAvailableChoices}
      isTyping={isByteMasterTyping}
      onChoose={chooseChatOption}
      attention={isChatAttentionActive}
    />
  );
};
