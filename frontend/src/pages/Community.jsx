import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const Community = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(name, profile_photo)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        setPosts(data);
      }
      setLoading(false);
    };

    fetchPosts();

    // Real-time listener for new posts
    const subscription = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, async (payload) => {
        // Fetch profile for the new post
        const { data: profile } = await supabase.from('profiles').select('name, profile_photo').eq('id', payload.new.user_id).single();
        const fullPost = { ...payload.new, profiles: profile };
        setPosts(prev => [fullPost, ...prev]);
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user) return;

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      content: newPostContent
    });

    if (error) {
      console.error('Error creating post:', error);
    } else {
      setNewPostContent('');
    }
  };

  const toggleLike = async (postId, currentLikes) => {
    // This is a simplified like logic for the demo
    const { error } = await supabase
      .from('posts')
      .update({ likes_count: currentLikes + 1 })
      .eq('id', postId);
    
    if (!error) {
      setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));
    }
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
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share your travel plans or ask for recommendations..."
              className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink-dark border border-gray-100 resize-none min-h-[80px]"
            ></textarea>
            <div className="flex justify-end mt-3">
              <button 
                onClick={handleCreatePost}
                className="bg-brand-pink-dark text-white px-6 py-2 rounded-full font-medium hover:bg-pink-600 transition-colors shadow-sm text-sm"
              >
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
                {post.profiles?.profile_photo ? (
                  <img src={post.profiles.profile_photo} alt={post.profiles.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-pink text-white flex items-center justify-center font-bold">
                    {post.profiles?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-800 text-sm md:text-base">{post.profiles?.name || 'Anonymous'}</h3>
                  <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
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
                  onClick={() => toggleLike(post.id, post.likes_count)}
                  className={`flex items-center gap-1.5 text-sm hover:text-brand-pink-dark transition-colors ${post.likes_count > 0 ? 'text-brand-pink-dark' : ''}`}
                >
                  {post.likes_count > 0 ? <HeartSolidIcon className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                  <span className="font-medium">{post.likes_count}</span>
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
