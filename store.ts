import { Group, Post, Comment, Participant } from './types';
import { supabase } from './supabaseClient';

export const store = {

  createGroup: async (name: string, adminId: string): Promise<Group | null> => {
    const { data: group, error } = await supabase
      .from('amigo_groups')
      .insert({
        name,
        admin_id: adminId,
        slug: crypto.randomUUID() // Using UUID as slug for uniqueness
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating group:', error);
      return null;
    }

    return {
      id: group.id,
      name: group.name,
      adminId: group.admin_id,
      participants: [],
      posts: [],
      isDrawn: group.is_drawn,
      createdAt: new Date(group.created_at).getTime()
    };
  },

  getGroup: async (id: string): Promise<Group | null> => {
    // 1. Fetch Group Data
    const { data: group, error: groupError } = await supabase
      .from('amigo_groups')
      .select('*')
      .eq('id', id)
      .single();

    if (groupError || !group) return null;

    // 2. Fetch Participants
    const { data: participantsData } = await supabase
      .from('amigo_participants')
      .select('*')
      .eq('group_id', id);

    // 3. Fetch Draw Results (if drawn)
    let drawResults: Record<string, string> = {}; // Map<GiverID, ReceiverID>
    if (group.is_drawn) {
      const { data: draws } = await supabase
        .from('amigo_draw_results')
        .select('*')
        .eq('group_id', id);

      draws?.forEach(d => {
        // Now using UUIDs: giver_id -> receiver_id
        drawResults[d.giver_id] = d.receiver_id;
      });
    }

    // Map Participants
    const participants: Participant[] = (participantsData || []).map(p => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      avatarColor: p.avatar_color,
      secretFriendId: undefined, // mapped below
      secretFriendName: undefined // mapped below
    }));

    // Map Secret Friends (if drawn)
    if (group.is_drawn) {
      participants.forEach(p => {
        const receiverId = drawResults[p.id]; // p.id is the giver's UUID
        if (receiverId) {
          const receiver = participants.find(part => part.id === receiverId);
          if (receiver) {
            p.secretFriendId = receiver.id;
            p.secretFriendName = receiver.name;
          }
        }
      });
    }

    // 4. Fetch Posts (with Likes and Comments)
    // Supabase recursive query or separate queries?
    // Let's try deep select: posts(*, amigo_comments(*), amigo_likes(*))
    // Note: table names are amigo_posts, amigo_comments, amigo_likes.
    // FKs: amigo_comments.post_id -> amigo_posts.id
    // FKs: amigo_likes.post_id -> amigo_posts.id

    const { data: postsData } = await supabase
      .from('amigo_posts')
      .select(`
        *,
        amigo_comments (*),
        amigo_likes (*)
      `)
      .eq('group_id', id)
      .order('created_at', { ascending: false });

    const posts: Post[] = (postsData || []).map(post => ({
      id: post.id,
      authorId: post.author_id,
      content: post.content,
      timestamp: new Date(post.created_at).getTime(),
      likes: post.amigo_likes.map((l: any) => l.user_id),
      comments: post.amigo_comments.map((c: any) => ({
        id: c.id,
        authorId: c.author_id,
        content: c.content,
        timestamp: new Date(c.created_at).getTime()
      })).sort((a: any, b: any) => a.timestamp - b.timestamp)
    }));

    return {
      id: group.id,
      name: group.name,
      adminId: group.admin_id,
      participants,
      posts,
      isDrawn: group.is_drawn,
      createdAt: new Date(group.created_at).getTime()
    };
  },

  addParticipant: async (groupId: string, participant: Omit<Participant, 'id'>): Promise<Participant | null> => {
    const { data, error } = await supabase
      .from('amigo_participants')
      .insert({
        group_id: groupId,
        name: participant.name,
        phone: participant.phone,
        avatar_color: participant.avatarColor
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding participant", error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      avatarColor: data.avatar_color
    };
  },

  removeParticipant: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('amigo_participants')
      .delete()
      .eq('id', id);
    return !error;
  },

  saveDrawResults: async (groupId: string, participants: Participant[]): Promise<boolean> => {
    const inserts = participants
      .filter(p => p.secretFriendId) // only those who have a match (everyone ideally)
      .map(p => {
        // Need to find receiver's ID.
        // participants array has secretFriendId (the receiver's ID).
        // We now store IDs directly in amigo_draw_results.

        return {
          group_id: groupId,
          giver_id: p.id,
          receiver_id: p.secretFriendId
        };
      })
      .filter(i => i.receiver_id !== undefined); // Ensure valid receiver ID

    if (inserts.length === 0) return false;

    // Transaction? Supabase doesn't support transactions via Client directly easily, but we can do sequential.
    // 1. Insert results
    const { error: drawError } = await supabase
      .from('amigo_draw_results')
      .insert(inserts as any); // Type assertion if needed

    if (drawError) {
      console.error("Error saving draw", drawError);
      return false;
    }

    // 2. Update group status
    const { error: groupError } = await supabase
      .from('amigo_groups')
      .update({ is_drawn: true })
      .eq('id', groupId);

    return !groupError;
  },

  addPost: async (groupId: string, authorId: string, content: string): Promise<boolean> => {
    const { error } = await supabase
      .from('amigo_posts')
      .insert({
        group_id: groupId,
        author_id: authorId,
        content
      });
    return !error;
  },

  toggleLike: async (postId: string, participantId: string): Promise<boolean> => {
    // Check if exists
    const { data } = await supabase
      .from('amigo_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', participantId)
      .single();

    if (data) {
      // Unlike
      const { error } = await supabase
        .from('amigo_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', participantId);
      return !error;
    } else {
      // Like
      const { error } = await supabase
        .from('amigo_likes')
        .insert({
          post_id: postId,
          user_id: participantId
        });
      return !error;
    }
  },

  addComment: async (postId: string, authorId: string, content: string): Promise<boolean> => {
    const { error } = await supabase
      .from('amigo_comments')
      .insert({
        post_id: postId,
        author_id: authorId,
        content
      });
    return !error;
  }
};