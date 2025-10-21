import { GetServerSidePropsContext } from "next";
import { authenticateTokenSSR } from "../lib/auth";
import { Message } from "../db/models/Message";
import { useState } from "react";

interface MessageType {
  _id: string;
  message: string;
  userId: {
    _id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface DashboardProps {
  messages: MessageType[];
  user: {
    userId: string;
    email: string;
  };
}

export default function Dashboard({ messages, user }: DashboardProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageList, setMessageList] = useState(messages);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      alert("Please enter a message");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add the new message to the top of the list
        setMessageList([data.message, ...messageList]);
        setNewMessage("");
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to post message');
      }
    } catch (error) {
      console.error('Error posting message:', error);
      alert('Failed to post message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="text-sm text-gray-600">
              Welcome, {user.email}
            </div>
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="What's on your mind?"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                maxLength={1000}
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting || !newMessage.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {newMessage.length}/1000 characters
            </div>
          </form>

          {/* Messages List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Messages</h2>
            {messageList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No messages yet. Be the first to post something!
              </div>
            ) : (
              messageList.map((message) => (
                <div key={message._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-900">
                      {message.userId.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {message.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = authenticateTokenSSR(async (context: GetServerSidePropsContext) => {
    try {
        // Fetch messages with user information
        const messages = await Message.find()
            .populate('userId', 'email')
            .sort({ createdAt: -1 }) // Most recent first
            .limit(50) // Limit to 50 most recent messages
            .lean(); // Use lean() for better performance

        return {
            props: {
                messages: JSON.parse(JSON.stringify(messages)), // Convert to plain objects
                user: {
                    userId: (context.req as any).user.userId,
                    email: (context.req as any).user.email
                }
            },
        };
    } catch (error) {
        console.error('Error fetching messages:', error);
        return {
            props: {
                messages: [],
                user: {
                    userId: (context.req as any).user.userId,
                    email: (context.req as any).user.email
                }
            },
        };
    }
});