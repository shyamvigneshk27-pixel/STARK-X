import { useState } from 'react';
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const Community = () => {
  // Demo Data based on Excalidraw wireframe
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: { name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
      time: '2 hours ago',
      content: 'Just finalized my 2-week itinerary for Japan! Cannot wait for cherry blossom season 🌸. Anyone have recommendations for hidden gems in Kyoto?',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
      likes: 42,
      comments: 12,
      isLiked: false
    },
    {
      id: 2,
      user: { name: 'Marcus Chen' },
      time: '5 hours ago',
      content: 'Pro tip for EuroTrips: always book the high-speed trains at least 4 weeks in advance. Just saved over €150 on my Paris to Amsterdam route!',
      image: null,
      likes: 128,
      comments: 34,
      isLiked: true
    },
    {
      id: 3,
      user: { name: 'Elena Rodriguez', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80' },
      time: '1 day ago',
      content: 'My budget breakdown for 10 days in Bali is now public on my profile! Managed to keep it under $800 excluding flights. Check it out if you are planning a trip soon!',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      likes: 89,
      comments: 5,
      isLiked: false
    }
  ]);

  const toggleLike = (id) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="mb-8 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold text-gray-800">Community Feed</h1>
        <p className="text-gray-500">Discover itineraries, tips, and connect with fellow travelers.</p>
      </div>

      {/* New Post Input Box */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-8 border border-gray-100">
        <div className="flex items-start gap-4">
          <UserCircleIcon className="w-10 h-10 text-gray-400 flex-shrink-0" />
          <div className="flex-grow">
            <textarea 
              placeholder="Share your travel plans or ask for recommendations..."
              className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink-dark border border-gray-100 resize-none min-h-[80px]"
            ></textarea>
            <div className="flex justify-end mt-3">
              <button className="bg-brand-pink-dark text-white px-6 py-2 rounded-full font-medium hover:bg-pink-600 transition-colors shadow-sm text-sm">
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Social Feed */}
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 md:p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                {post.user.avatar ? (
                  <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-pink text-white flex items-center justify-center font-bold">
                    {post.user.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-800 text-sm md:text-base">{post.user.name}</h3>
                  <p className="text-xs text-gray-500">{post.time}</p>
                </div>
              </div>

              {/* Content */}
              <p className="text-gray-700 text-sm md:text-base mb-4 leading-relaxed">
                {post.content}
              </p>

              {/* Image attachment */}
              {post.image && (
                <div className="mb-4 rounded-xl overflow-hidden max-h-80">
                  <img src={post.image} alt="Post attachment" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Interactions */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-50 text-gray-500">
                <button 
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 text-sm hover:text-brand-pink-dark transition-colors ${post.isLiked ? 'text-brand-pink-dark' : ''}`}
                >
                  {post.isLiked ? <HeartSolidIcon className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                  <span className="font-medium">{post.likes}</span>
                </button>
                <button className="flex items-center gap-1.5 text-sm hover:text-blue-500 transition-colors">
                  <ChatBubbleLeftIcon className="w-5 h-5" />
                  <span className="font-medium">{post.comments}</span>
                </button>
                <button className="flex items-center gap-1.5 text-sm hover:text-green-500 transition-colors ml-auto">
                  <ShareIcon className="w-5 h-5" />
                  <span className="font-medium">Share</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
