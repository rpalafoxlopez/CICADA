import { supabase } from '../supabase.js';

export const PhotoService = {
  async uploadPhoto(eventId, blob) {
    const filename = `events/${eventId}/${crypto.randomUUID()}.jpg`;

    const { data, error } = await supabase.storage
      .from('photos')
      .upload(filename, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });

    if (error) throw error;
    return { path: data.path, filename };
  },

  async savePhotoRecord({ eventId, storagePath, takenBy }) {
    const { data, error } = await supabase
      .from('photos')
      .insert({
        event_id: eventId,
        storage_path: storagePath,
        taken_by: takenBy,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPhotosByEvent(eventId) {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('event_id', eventId)
      .order('taken_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  getPhotoUrl(storagePath) {
    const { data } = supabase.storage
      .from('photos')
      .getPublicUrl(storagePath);
    return data.publicUrl;
  },

  async uploadMusic(file) {
    const filename = `music/${crypto.randomUUID()}.mp3`;

    const { data, error } = await supabase.storage
      .from('event-assets')
      .upload(filename, file, {
        contentType: 'audio/mpeg',
      });

    if (error) throw error;
    return data.path;
  },

  getMusicUrl(storagePath) {
    const { data } = supabase.storage
      .from('event-assets')
      .getPublicUrl(storagePath);
    return data.publicUrl;
  },
};
