import React, { useState } from 'react';
import { ChatState } from '../Context/ChatProvider';
import MyChats from '../components/MyChats';
import ChatBox from '../components/ChatBox';

const ChatPage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <div className="chat-layout">
      {user && <MyChats fetchAgain={fetchAgain} />}
      {user && (
        <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
      )}
    </div>
  );
};

export default ChatPage;
