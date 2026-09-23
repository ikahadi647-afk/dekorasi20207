import React, { useState, useEffect } from 'react';
import { ViewType, Client, Project, Package, AddOn, Transaction, Profile, NavigationAction, Card, FinancialPocket, ClientFeedback, PromoCode, Notification, Contract } from '../../types';
import Clients from '../clients/ClientsPage';
import { Projects } from '../projects/ProjectsPage';
import Contracts from '../contracts/ContractsPage';
import ClientReports from '../../features/clients/components/ClientKPI';
import { ArrowLeftIcon } from 'lucide-react';
import { ClientInfoView } from '../../features/clients/components/ClientInfoView';

interface DataPengantinHubProps {
    // Props passed from AuthenticatedRoutes
    activeView: ViewType;
    handleNavigation: (view: ViewType, action?: NavigationAction, notificationId?: string) => void;
    clients: Client[];
    setClients: React.Dispatch<React.SetStateAction<Client[]>>;
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    teamMembers: any[];
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    packages: Package[];
    setPackages: React.Dispatch<React.SetStateAction<Package[]>>;
    addOns: AddOn[];
    setAddOns: React.Dispatch<React.SetStateAction<AddOn[]>>;
    clientFeedback: ClientFeedback[];
    setClientFeedback: React.Dispatch<React.SetStateAction<ClientFeedback[]>>;
    profile: Profile;
    showNotification: (message: string, duration?: number) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => Promise<void>;
    cards: Card[];
    setCards: React.Dispatch<React.SetStateAction<Card[]>>;
    pockets: FinancialPocket[];
    setPockets: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
    promoCodes: PromoCode[];
    setPromoCodes: React.Dispatch<React.SetStateAction<PromoCode[]>>;
    contracts: Contract[];
    setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
    appData: any;
    initialAction: NavigationAction | null;
    setInitialAction: React.Dispatch<React.SetStateAction<NavigationAction | null>>;
    onSignInvoice: (projectId: string, sig: string) => void;
    onSignTransaction: (transactionId: string, sig: string) => void;
    onRecordPayment: (projectId: string, amount: number, destinationCardId: string) => Promise<void>;
}

export const DataPengantinHub: React.FC<DataPengantinHubProps> = (props) => {
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [activeTab, setActiveTab] = useState<'pengantin' | 'acara' | 'kontrak' | 'laporan'>('pengantin');

    // Reset tab when client changes
    useEffect(() => {
        setActiveTab('pengantin');
    }, [selectedClient]);

    const tabs = [
        { id: 'pengantin', label: 'Pengantin' },
        { id: 'acara', label: 'Acara Pernikahan' },
        { id: 'kontrak', label: 'Kontrak Kerja' },
        { id: 'laporan', label: 'Laporan Klien & KPI' },
    ] as const;

    if (!selectedClient) {
        return (
            <Clients
                {...props}
                userProfile={props.profile}
                totals={props.appData?.totals || {
                    projects: 0,
                    activeProjects: 0,
                    clients: 0,
                    activeClients: 0,
                    leads: 0,
                    discussionLeads: 0,
                    followUpLeads: 0,
                    teamMembers: 0,
                    transactions: 0,
                    revenue: 0,
                    expense: 0,
                }}
                handleNavigation={(view, action) => {
                    if (action.type === 'view' && action.id) {
                        const client = props.clients.find(c => c.id === action.id);
                        if (client) setSelectedClient(client);
                    } else {
                        props.handleNavigation(view, action);
                    }
                }}
            />
        );
    }

    // Filter projects for selected client
    const clientProjects = props.projects.filter(p => p.clientId === selectedClient.id);
    const clientContracts = props.contracts.filter(c => c.clientId === selectedClient.id);
    const clientFeedback = props.clientFeedback.filter(f => f.clientName === selectedClient.name);

    const safeTotals = props.appData?.totals || {
        projects: 0,
        activeProjects: 0,
        clients: 0,
        activeClients: 0,
        leads: 0,
        discussionLeads: 0,
        followUpLeads: 0,
        teamMembers: 0,
        transactions: 0,
        revenue: 0,
        expense: 0,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col">
                <button 
                    onClick={() => setSelectedClient(null)}
                    className="flex items-center text-sm text-[#5A6A85] hover:text-[#5D87FF] mb-2"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-1" /> Kembali ke Daftar
                </button>
                <h2 className="text-2xl font-bold text-[#2A3547]">{selectedClient.name}</h2>
                
                {/* Internal Nav */}
                <div className="flex items-center gap-2 border-b border-[#EAEFF4] mt-4 overflow-x-auto pb-1 scrollbar-hide">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-2 text-xs md:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'border-[#5D87FF] text-[#5D87FF]'
                                    : 'border-transparent text-[#5A6A85] hover:text-[#2A3547]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-4">
                {activeTab === 'pengantin' && (
                    <ClientInfoView 
                        client={selectedClient} 
                        projects={props.projects} 
                        transactions={props.transactions}
                    />
                )}
                {activeTab === 'acara' && (
                    <Projects
                        {...props}
                        projects={clientProjects}
                        totals={safeTotals}
                    />
                )}
                {activeTab === 'kontrak' && (
                    <Contracts
                        {...props}
                        contracts={clientContracts}
                    />
                )}
                {activeTab === 'laporan' && (
                    <ClientReports
                        {...props}
                        clients={[selectedClient]}
                        projects={clientProjects}
                        feedback={clientFeedback}
                    />
                )}
            </div>
        </div>
    );
};
