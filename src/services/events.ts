import { supabase } from '../lib/supabaseClient';
import { CalendarEvent } from '../types';

export const getEvents = async (startDate: string, endDate: string): Promise<CalendarEvent[]> => {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw error;
  return data as CalendarEvent[];
};

export const createEvent = async (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> => {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert([event])
    .select()
    .single();

  if (error) throw error;
  return data as CalendarEvent;
};

export const updateEvent = async (id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
  const { data, error } = await supabase
    .from('calendar_events')
    .update(event)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CalendarEvent;
};

export const deleteEvent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
