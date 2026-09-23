import React from 'react';
import { ModernStatCard } from '../../../components/modernize/ModernStatCard';
import { CreditCardIcon, ClipboardListIcon, ArrowUpIcon, ArrowDownIcon } from '../../../constants';
import { formatCurrency } from '../../../utils/currency';
import { Scale } from 'lucide-react';

interface FinanceHeaderStatsProps {
    summary: {
        totalAssets: number;
        pocketsTotal: number;
        totalIncomeThisMonth: number;
        totalExpenseThisMonth: number;
    };
    /** All-time totals computed from full transactions list */
    allTimeTotals: {
        income: number;
        expense: number;
    };
    setActiveStatModal: (type: 'assets' | 'pockets' | 'income' | 'expense' | null) => void;
}

export const FinanceHeaderStats: React.FC<FinanceHeaderStatsProps> = ({
    summary,
    allTimeTotals,
    setActiveStatModal,
}) => {
    const netAllTime = allTimeTotals.income - allTimeTotals.expense;
    const isProfit = netAllTime >= 0;

    const [isCollapsed, setIsCollapsed] = React.useState(false);

    return (
        <div className="space-y-2 non-printable">
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full sm:hidden text-xs font-bold text-[#5D87FF] bg-[#ECF2FF] py-2 rounded-lg"
            >
                {isCollapsed ? 'Tampilkan Ringkasan Keuangan' : 'Sembunyikan Ringkasan'}
            </button>
            <div className={`grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 transition-all duration-300 ${isCollapsed ? 'hidden sm:grid' : 'grid'}`}>
                {/* 1. Total Aset */}
                <div className="cursor-pointer" onClick={() => setActiveStatModal('assets')}>
                    <ModernStatCard
                        icon={<CreditCardIcon className="w-5 h-5" />}
                        title="Total Aset"
                        value={formatCurrency(summary.totalAssets)}
                        subtitle="Saldo kartu & tunai"
                        iconColorVariant="primary"
                    />
                </div>

                {/* 2. Dana di Kantong */}
                <div className="cursor-pointer" onClick={() => setActiveStatModal('pockets')}>
                    <ModernStatCard
                        icon={<ClipboardListIcon className="w-5 h-5" />}
                        title="Dana di Kantong"
                        value={formatCurrency(summary.pocketsTotal)}
                        subtitle="Total alokasi kantong"
                        iconColorVariant="warning"
                    />
                </div>

                {/* 3. Total Pemasukan (all-time) */}
                <div className="cursor-pointer" onClick={() => setActiveStatModal('income')}>
                    <ModernStatCard
                        icon={<ArrowUpIcon className="w-5 h-5" />}
                        title="Total Pemasukan"
                        value={formatCurrency(allTimeTotals.income)}
                        subtitle="Semua pemasukan"
                        iconColorVariant="success"
                        badge={{ text: 'All-time', variant: 'success' }}
                    />
                </div>

                {/* 4. Total Pengeluaran (all-time) */}
                <div className="cursor-pointer" onClick={() => setActiveStatModal('expense')}>
                    <ModernStatCard
                        icon={<ArrowDownIcon className="w-5 h-5" />}
                        title="Total Pengeluaran"
                        value={formatCurrency(allTimeTotals.expense)}
                        subtitle="Semua pengeluaran"
                        iconColorVariant="error"
                        badge={{ text: 'All-time', variant: 'error' }}
                    />
                </div>

                {/* 5. Laba / Rugi Bersih (all-time) — full width on 2-col mobile */}
                <div className="col-span-2 lg:col-span-1">
                    <ModernStatCard
                        icon={<Scale className="w-5 h-5" />}
                        title="Laba / Rugi Bersih"
                        value={formatCurrency(netAllTime)}
                        subtitle={isProfit ? 'Surplus keseluruhan' : 'Defisit keseluruhan'}
                        iconColorVariant={isProfit ? 'success' : 'error'}
                        badge={{
                            text: isProfit ? '+ Surplus' : '- Defisit',
                            variant: isProfit ? 'success' : 'error'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
