import { supabase } from '../supabase.js';

export function subscribeToPhotos(eventId, onNewPhoto) {
  const channel = supabase
    .channel(`event-${eventId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'photos',
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => {
        onNewPhoto(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
