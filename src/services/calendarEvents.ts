import supabase from '../lib/supabaseClient';
import { CalendarEvent } from '../types';

const TABLE = 'calendar_events';

export type CalendarEventRow = {
  id: string;
  title: string;
  event_type: string;
  date: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  projectId?: string;
  clientId?: string;
  teamMemberId?: string;
  vendorId?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export function normalizeCalendarEvent(row: any): CalendarEvent {
  return toCalendarEvent(row as CalendarEventRow);
}

function toCalendarEvent(row: CalendarEventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    eventType: row.event_type as any,
    status: 'Confirmed' as any,
    startAt: row.startAt,
    endAt: row.endAt,
    allDay: row.allDay,
    projectId: row.projectId,
    clientId: row.clientId,
    teamMemberId: row.teamMemberId,
    vendorId: row.vendorId,
    location: row.location,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listCalendarEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('date', { ascending: true });
  if (error) throw error;
  return ((data || []) as any[]).map(toCalendarEvent);
}

export async function listCalendarEventsInRange(fromDate: string, toDate: string): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .gte('date', fromDate)
    .lte('date', toDate)
    .order('date', { ascending: true });
  if (error) throw error;
  return ((data || []) as any[]).map(toCalendarEvent);
}

export type CreateCalendarEventInput = {
  title: string;
  eventType: string;
  date: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  projectId?: string;
  clientId?: string;
  teamMemberId?: string;
  vendorId?: string;
  location?: string;
  notes?: string;
};

export async function createCalendarEvent(input: CreateCalendarEventInput): Promise<CalendarEvent> {
  const payload = {
    title: input.title,
    event_type: input.eventType,
    date: input.date,
    startAt: input.startAt,
    endAt: input.endAt,
    allDay: input.allDay,
    projectId: input.projectId,
    clientId: input.clientId,
    teamMemberId: input.teamMemberId,
    vendorId: input.vendorId,
    location: input.location,
    notes: input.notes,
  } as Partial<CalendarEventRow>;

  const { data, error } = await supabase
    .from(TABLE)
    .insert([payload])
    .select('*')
    .single();
  if (error) throw error;
  return toCalendarEvent(data);
}

export type UpdateCalendarEventInput = Partial<CreateCalendarEventInput>;

export async function updateCalendarEvent(id: string, input: UpdateCalendarEventInput): Promise<CalendarEvent> {
  const payload: Partial<CalendarEventRow> = {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.eventType !== undefined ? { event_type: input.eventType } : {}),
    ...(input.date !== undefined ? { date: input.date } : {}),
    ...(input.startAt !== undefined ? { startAt: input.startAt } : {}),
    ...(input.endAt !== undefined ? { endAt: input.endAt } : {}),
    ...(input.allDay !== undefined ? { allDay: input.allDay } : {}),
    ...(input.projectId !== undefined ? { projectId: input.projectId } : {}),
    ...(input.clientId !== undefined ? { clientId: input.clientId } : {}),
    ...(input.teamMemberId !== undefined ? { teamMemberId: input.teamMemberId } : {}),
    ...(input.vendorId !== undefined ? { vendorId: input.vendorId } : {}),
    ...(input.location !== undefined ? { location: input.location } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
  };

  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return toCalendarEvent(data);
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);
  if (error) throw error;
}
