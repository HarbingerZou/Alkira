import { GetServerSidePropsContext } from "next";
import { authenticateTokenSSR } from "../lib/auth";
import { Message } from "../db/models/Message";
import { User } from "../db/models/User";
import { useState } from "react";
import Link from "next/link";

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

interface UserType {
  _id: string;
  email: string;
  access_level: string;
  is_temporary: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProfileProps {
  userMessages: MessageType[];
  user: {
    userId: string;
    email: string;
  };
  userProfile: UserType;
}

export default function Profile({ userMessages, user, userProfile }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'messages'>('profile');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <div className="flex space-x-4 items-center">
              <div className="text-sm text-gray-600">
                Welcome, {user.email}
              </div>
              <Link 
                href="/dashboard" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'messages'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Messages ({userMessages.length})
              </button>
            </nav>
          </div>

          {/* Profile Tab Content */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Account Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Email Address</h3>
                  <p className="text-gray-700">{userProfile.email}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Access Level</h3>
                  <p className="text-gray-700 capitalize">
                    {userProfile.access_level || 'No access level set'}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Account Type</h3>
                  <p className="text-gray-700">
                    {userProfile.is_temporary ? 'Temporary Account' : 'Regular Account'}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Member Since</h3>
                  <p className="text-gray-700">
                    {new Date(userProfile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Account Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Total Messages:</span>
                    <span className="ml-2 text-blue-600">{userMessages.length}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Last Activity:</span>
                    <span className="ml-2 text-blue-600">
                      {userMessages.length > 0 
                        ? new Date(userMessages[0].createdAt).toLocaleDateString()
                        : 'No messages yet'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages Tab Content */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">My Messages</h2>
              
              {userMessages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-lg mb-2">No messages yet</p>
                  <p className="text-sm">Start sharing your thoughts on the dashboard!</p>
                  <Link 
                    href="/dashboard" 
                    className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userMessages.map((message) => (
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
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = authenticateTokenSSR(async (context: GetServerSidePropsContext) => {
  try {
    const userId = (context.req as any).user.userId;
    
    // Fetch user's messages
    const userMessages = await Message.find({ userId })
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch user profile information
    const userProfile = await User.findById(userId)
      .select('email access_level is_temporary createdAt updatedAt')
      .lean();

    if (!userProfile) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    return {
      props: {
        userMessages: JSON.parse(JSON.stringify(userMessages)),
        user: {
          userId: (context.req as any).user.userId,
          email: (context.req as any).user.email
        },
        userProfile: JSON.parse(JSON.stringify(userProfile))
      },
    };
  } catch (error) {
    console.error('Error fetching profile data:', error);
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
});
