import React, { useState } from 'react';
import { Group, Participant, Post, Comment } from '../types';
import { store } from '../store';
import { Heart, MessageCircle, Send, Gift, Eye, EyeOff, Loader2 } from 'lucide-react';

interface SocialFeedProps {
  group: Group;
  currentUser: Participant;
  onReload: () => void;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ group, currentUser, onReload }) => {
  const [newPost, setNewPost] = useState('');
  const [showReveal, setShowReveal] = useState(false);
  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setLoading(true);

    await store.addPost(group.id, currentUser.id, newPost);
    setNewPost('');
    await onReload(); // Refresh data from backend
    setLoading(false);
  };

  const handleLike = async (postId: string) => {
    await store.toggleLike(postId, currentUser.id);
    await onReload(); // Optimistic UI could be better here, but simple reload ensures consistency
  };

  const handleComment = async (postId: string) => {
    const text = commentText[postId];
    if (!text?.trim()) return;

    await store.addComment(postId, currentUser.id, text);
    setCommentText({ ...commentText, [postId]: '' });
    await onReload();
  };

  const getAuthorName = (authorId: string) => {
    return group.participants.find(p => p.id === authorId)?.name || 'Desconhecido';
  };

  const getAuthorColor = (authorId: string) => {
    const p = group.participants.find(p => p.id === authorId);
    return p?.avatarColor || 'bg-indigo-100 text-indigo-700';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">

      {/* Header / Reveal Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-1">{group.name}</h1>
        <p className="text-indigo-100 text-sm mb-6">Bem-vindo(a), {currentUser.name}!</p>


      </div>

      {/* Create Post */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
          <Gift className="w-5 h-5 text-pink-500" />
          O que você quer ganhar?
        </h3>
        <form onSubmit={handlePost}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Conte para seu amigo secreto o que você gostaria de ganhar..."
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24 text-sm text-gray-900 placeholder-gray-500"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!newPost.trim() || loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Publicar Desejo
            </button>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {group.posts.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p>Ninguém postou nada ainda. Seja o primeiro!</p>
          </div>
        ) : (
          group.posts.map(post => {
            const isLiked = post.likes.includes(currentUser.id);
            return (
              <div key={post.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                {/* Post Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getAuthorColor(post.authorId)}`}>
                    {getAuthorName(post.authorId).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{getAuthorName(post.authorId)}</p>
                    <p className="text-xs text-gray-500">{new Date(post.timestamp).toLocaleDateString()} às {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                {/* Content */}
                <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-4 border-t border-gray-100 pt-3 mb-3">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isLiked ? 'text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    {post.likes.length > 0 ? post.likes.length : 'Curtir'}
                  </button>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments.length > 0 ? `${post.comments.length} Comentários` : 'Comentar'}
                  </div>
                </div>

                {/* Comments */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  {post.comments.map(comment => (
                    <div key={comment.id} className="flex gap-2 text-sm">
                      <span className="font-bold text-gray-800 shrink-0">{getAuthorName(comment.authorId)}:</span>
                      <span className="text-gray-600 break-words">{comment.content}</span>
                    </div>
                  ))}

                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Escreva um comentário..."
                      value={commentText[post.id] || ''}
                      onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                      className="flex-1 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-sm outline-none focus:border-indigo-400 text-gray-900 placeholder-gray-500"
                    />
                    <button
                      onClick={() => handleComment(post.id)}
                      disabled={!commentText[post.id]?.trim()}
                      className="text-indigo-600 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};