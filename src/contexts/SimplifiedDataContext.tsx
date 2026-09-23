import React, { createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { normalizeTransaction } from '../services/transactions';
import { normalizeClient } from '../services/clients';
import { normalizeProject } from '../services/projects';
import { normalizeLead } from '../services/leads';
import { normalizePocket } from '../services/pockets';
import { normalizeCard } from '../services/cards';
import { normalizeTeamMember } from '../services/teamMembers';
import { normalizePackage } from '../services/packages';
import { normalizeAddOn } from '../services/addOns';
import { normalizeClientFeedback } from '../services/clientFeedback';
import { normalizeCalendarEvent } from '../services/calendarEvents';
import {
  useClientsQuery,
  useProjectsQuery,
  useTeamMembersQuery,
  useTransactionsQuery,
  useLeadsQuery,
  useCardsQuery,
  usePocketsQuery,
  usePackagesQuery,
  useAddOnsQuery,
  useCalendarEventsQuery,
} from '../hooks/queries';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useClientFeedback } from '../hooks/useClientFeedback';
import {
  Client,
  Project,
  TeamMember,
  Transaction,
  Lead,
  Card,
  FinancialPocket,
  Package,
  AddOn,
  ClientFeedback,
  CalendarEvent,
} from '../types';

interface SimplifiedDataContextType {
  // Domain data — single source of truth: React Query cache (server state from Supabase)
  clients: Client[] | undefined;
  projects: Project[] | undefined;
  teamMembers: TeamMember[] | undefined;
  transactions: Transaction[] | undefined;
  leads: Lead[] | undefined;
  cards: Card[] | undefined;
  pockets: FinancialPocket[] | undefined;
  packages: Package[] | undefined;
  addOns: AddOn[] | undefined;
  clientFeedback: ClientFeedback[] | undefined;
  calendarEvents: CalendarEvent[] | undefined;
  totals: ReturnType<typeof useDashboardStats>['data'];

  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  refetchAll: () => Promise<void>;

  // Cache writers — exposed as React.Dispatch<SetStateAction<T[]>> so the
  // existing 525 call-sites that perform optimistic updates keep working.
  // Internally these write directly to the React Query cache (the only state
  // container). No duplicate local state.
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  setPockets: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
  setPackages: React.Dispatch<React.SetStateAction<Package[]>>;
  setAddOns: React.Dispatch<React.SetStateAction<AddOn[]>>;
  setClientFeedback: React.Dispatch<React.SetStateAction<ClientFeedback[]>>;
}

const SimplifiedDataContext = createContext<SimplifiedDataContextType | undefined>(undefined);

/**
 * Build a setter that applies React.SetStateAction<T[]> directly to the
 * React Query cache for the given key. This is the bridge that lets legacy
 * call-sites (e.g. setClients(prev => [...prev, created])) keep working
 * while making React Query the single source of truth.
 */
function makeCacheSetter<T>(
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: string,
): React.Dispatch<React.SetStateAction<T[]>> {
  return (action: React.SetStateAction<T[]>) => {
    queryClient.setQueryData<T[]>([queryKey], (old) => {
      const prev = old ?? [];
      return typeof action === 'function'
        ? (action as (p: T[]) => T[])(prev)
        : action;
    });
  };
}

export const SimplifiedDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // ─── Domain queries (single source of truth) ────────────────────────────
  const { data: clients, isLoading: loadingClients, error: errorClients } = useClientsQuery();
  const { data: projects, isLoading: loadingProjects, error: errorProjects } = useProjectsQuery();
  const { data: teamMembers, isLoading: loadingTeamMembers, error: errorTeamMembers } = useTeamMembersQuery();
  const { data: transactions, isLoading: loadingTransactions, error: errorTransactions } = useTransactionsQuery();
  const { data: leads, isLoading: loadingLeads, error: errorLeads } = useLeadsQuery();
  const { data: cards, isLoading: loadingCards, error: errorCards } = useCardsQuery();
  const { data: pockets, isLoading: loadingPockets, error: errorPockets } = usePocketsQuery();
  const { data: packages, isLoading: loadingPackages, error: errorPackages } = usePackagesQuery();
  const { data: addOns, isLoading: loadingAddOns, error: errorAddOns } = useAddOnsQuery();
  const { data: calendarEvents, isLoading: loadingCalendarEvents, error: errorCalendarEvents } = useCalendarEventsQuery();
  const { data: clientFeedback, isLoading: loadingClientFeedback, error: errorClientFeedback } = useClientFeedback();
  const { data: totals, isLoading: loadingTotals, error: errorTotals } = useDashboardStats();

  const isLoading =
    loadingClients || loadingProjects || loadingTeamMembers ||
    loadingTransactions || loadingLeads || loadingCards ||
    loadingPockets || loadingPackages || loadingAddOns ||
    loadingCalendarEvents || loadingClientFeedback || loadingTotals;

  const error =
    errorClients || errorProjects || errorTeamMembers ||
    errorTransactions || errorLeads || errorCards ||
    errorPockets || errorPackages || errorAddOns ||
    errorCalendarEvents || errorClientFeedback || errorTotals;

  const isError = !!error;

  // ─── Cache setters (functional; replace previous stub no-ops) ──────────
  const setClients = useCallback(makeCacheSetter<Client>(queryClient, 'clients'), [queryClient]);
  const setProjects = useCallback(makeCacheSetter<Project>(queryClient, 'projects'), [queryClient]);
  const setTeamMembers = useCallback(makeCacheSetter<TeamMember>(queryClient, 'teamMembers'), [queryClient]);
  const setTransactions = useCallback(makeCacheSetter<Transaction>(queryClient, 'transactions'), [queryClient]);
  const setLeads = useCallback(makeCacheSetter<Lead>(queryClient, 'leads'), [queryClient]);
  const setCards = useCallback(makeCacheSetter<Card>(queryClient, 'cards'), [queryClient]);
  const setPockets = useCallback(makeCacheSetter<FinancialPocket>(queryClient, 'pockets'), [queryClient]);
  const setPackages = useCallback(makeCacheSetter<Package>(queryClient, 'packages'), [queryClient]);
  const setAddOns = useCallback(makeCacheSetter<AddOn>(queryClient, 'addOns'), [queryClient]);
  const setClientFeedback = useCallback(makeCacheSetter<ClientFeedback>(queryClient, 'clientFeedback'), [queryClient]);

  const refetchAll = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['clients'] }),
      queryClient.invalidateQueries({ queryKey: ['projects'] }),
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] }),
      queryClient.invalidateQueries({ queryKey: ['transactions'] }),
      queryClient.invalidateQueries({ queryKey: ['leads'] }),
      queryClient.invalidateQueries({ queryKey: ['cards'] }),
      queryClient.invalidateQueries({ queryKey: ['pockets'] }),
      queryClient.invalidateQueries({ queryKey: ['packages'] }),
      queryClient.invalidateQueries({ queryKey: ['addOns'] }),
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] }),
      queryClient.invalidateQueries({ queryKey: ['clientFeedback'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] }),
    ]);
  }, [queryClient]);

  // ─── Realtime: Supabase → React Query cache (no double state) ──────────
  useEffect(() => {
    const channel = supabase.channel('global-realtime-channel');

    const makeHandler = <T extends { id: string }>(
      queryKey: string,
      normalize: (row: any) => T,
      options: { sortByDateDesc?: boolean; tempIdPrefixes?: string[]; amountMatchField?: keyof T } = {},
    ) => (payload: any) => {
      queryClient.setQueryData<T[]>([queryKey], (old) => {
        if (!old) return old;
        const ev = payload.eventType;

        if (ev === 'INSERT' || ev === 'UPDATE') {
          const next = normalize(payload.new);
          const idx = old.findIndex((it) => it.id === next.id);
          if (idx !== -1) {
            const copy = old.slice();
            copy[idx] = { ...copy[idx], ...next };
            return copy;
          }
          if (options.tempIdPrefixes && options.amountMatchField) {
            const tempIdx = old.findIndex((t: any) =>
              options.tempIdPrefixes!.some((p) => String(t.id).startsWith(p)) &&
              t.projectId === (next as any).projectId &&
              Math.abs(Number(t[options.amountMatchField!]) - Number((next as any)[options.amountMatchField!])) < 0.01,
            );
            if (tempIdx !== -1) {
              const copy = old.slice();
              copy[tempIdx] = next;
              return copy;
            }
          }
          const merged = [next, ...old];
          if (options.sortByDateDesc) {
            merged.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          }
          return merged;
        }
        if (ev === 'DELETE') {
          const deletedId = payload.old?.id;
          return old.filter((it) => it.id !== deletedId);
        }
        return old;
      });
    };

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' },
        makeHandler<Transaction>('transactions', normalizeTransaction, {
          sortByDateDesc: true,
          tempIdPrefixes: ['TRN-PAY-', 'TRN-DP-'],
          amountMatchField: 'amount' as keyof Transaction,
        }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' },
        makeHandler<Client>('clients', normalizeClient))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' },
        makeHandler<Project>('projects', normalizeProject))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cards' },
        makeHandler<Card>('cards', normalizeCard))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pockets' },
        makeHandler<FinancialPocket>('pockets', normalizePocket))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' },
        makeHandler<Lead>('leads', normalizeLead))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' },
        makeHandler<TeamMember>('teamMembers', normalizeTeamMember))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'packages' },
        makeHandler<Package>('packages', normalizePackage))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'add_ons' },
        makeHandler<AddOn>('addOns', normalizeAddOn))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_feedback' },
        makeHandler<ClientFeedback>('clientFeedback', normalizeClientFeedback))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_events' },
        makeHandler<CalendarEvent>('calendarEvents', normalizeCalendarEvent))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const value = useMemo<SimplifiedDataContextType>(() => ({
    clients,
    projects,
    teamMembers,
    transactions,
    leads,
    cards,
    pockets,
    packages,
    addOns,
    clientFeedback,
    calendarEvents,
    totals,
    isLoading,
    isError,
    error,
    refetchAll,
    setClients,
    setProjects,
    setTeamMembers,
    setTransactions,
    setLeads,
    setCards,
    setPockets,
    setPackages,
    setAddOns,
    setClientFeedback,
  }), [
    clients, projects, teamMembers, transactions, leads, cards, pockets,
    packages, addOns, clientFeedback, calendarEvents, totals,
    isLoading, isError, error, refetchAll,
    setClients, setProjects, setTeamMembers, setTransactions, setLeads,
    setCards, setPockets, setPackages, setAddOns, setClientFeedback,
  ]);

  return (
    <SimplifiedDataContext.Provider value={value}>
      {children}
    </SimplifiedDataContext.Provider>
  );
};

export const useSimplifiedData = () => {
  const ctx = useContext(SimplifiedDataContext);
  if (ctx === undefined) {
    throw new Error('useSimplifiedData must be used within a SimplifiedDataProvider');
  }
  return ctx;
};
