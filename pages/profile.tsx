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

// Page Header Component (reused from dashboard)
interface PageHeaderProps {
  title: string;
  user: { email: string };
  navLink: { href: string; label: string; className: string };
}

function PageHeader({ title, user, navLink }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <div className="flex space-x-4 items-center">
        <div className="text-sm text-gray-600">
          Welcome, {user.email}
        </div>
        <Link href={navLink.href} className={navLink.className}>
          {navLink.label}
        </Link>
      </div>
    </div>
  );
}

// Tab Navigation Component
interface TabNavigationProps {
  activeTab: 'profile' | 'messages';
  setActiveTab: (tab: 'profile' | 'messages') => void;
  messageCount: number;
}

function TabNavigation({ activeTab, setActiveTab, messageCount }: TabNavigationProps) {
  return (
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
          My Messages ({messageCount})
        </button>
      </nav>
    </div>
  );
}

// Profile Info Card Component
interface ProfileInfoCardProps {
  title: string;
  value: string;
}

function ProfileInfoCard({ title, value }: ProfileInfoCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700">{value}</p>
    </div>
  );
}

// Profile Information Component
interface ProfileInformationProps {
  userProfile: UserType;
  userMessages: MessageType[];
}

function ProfileInformation({ userProfile, userMessages }: ProfileInformationProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Account Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileInfoCard 
          title="Email Address" 
          value={userProfile.email} 
        />
        
        <ProfileInfoCard 
          title="Access Level" 
          value={userProfile.access_level || 'No access level set'} 
        />
        
        <ProfileInfoCard 
          title="Account Type" 
          value={userProfile.is_temporary ? 'Temporary Account' : 'Regular Account'} 
        />
        
        <ProfileInfoCard 
          title="Member Since" 
          value={new Date(userProfile.createdAt).toLocaleDateString()} 
        />
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
  );
}

// Message Card Component (reused from dashboard)
interface MessageCardProps {
  message: MessageType;
}

function MessageCard({ message }: MessageCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
  );
}

// Empty State Component
interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  actionText: string;
  actionHref: string;
}

function EmptyState({ icon, title, subtitle, actionText, actionHref }: EmptyStateProps) {
  return (
    <div className="text-center py-12 text-gray-500">
      <div className="text-6xl mb-4">{icon}</div>
      <p className="text-lg mb-2">{title}</p>
      <p className="text-sm">{subtitle}</p>
      <Link 
        href={actionHref} 
        className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        {actionText}
      </Link>
    </div>
  );
}

// User Messages Component
interface UserMessagesProps {
  userMessages: MessageType[];
}

function UserMessages({ userMessages }: UserMessagesProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">My Messages</h2>
      
      {userMessages.length === 0 ? (
        <EmptyState 
          icon="📝"
          title="No messages yet"
          subtitle="Start sharing your thoughts on the dashboard!"
          actionText="Go to Dashboard"
          actionHref="/dashboard"
        />
      ) : (
        <div className="space-y-4">
          {userMessages.map((message) => (
            <MessageCard key={message._id} message={message} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Profile({ userMessages, user, userProfile }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'messages'>('profile');

  const navLink = {
    href: "/dashboard",
    label: "Dashboard",
    className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <PageHeader title="My Profile" user={user} navLink={navLink} />
          
          <TabNavigation 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            messageCount={userMessages.length}
          />

          {activeTab === 'profile' && (
            <ProfileInformation 
              userProfile={userProfile}
              userMessages={userMessages}
            />
          )}

          {activeTab === 'messages' && (
            <UserMessages userMessages={userMessages} />
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
