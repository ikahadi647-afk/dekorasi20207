/**
 * TeamSectionStats
 *
 * Renders the 3 primary stat cards + the collapsible 3 secondary stat cards
 * for a team group (Tim Internal or Vendor Eksternal).
 * Identical markup and behaviour to original.
 */

import React from 'react';
import { ModernStatCard } from '../../../components/modernize/ModernStatCard';
import {
    UsersIcon,
    AlertCircleIcon,
    UserCheckIcon,
    CalendarIcon,
    DollarSignIcon,
    StarIcon,
} from '../../../constants';

interface SectionStats {
    totalMembers: number;
    totalUnpaid: string;
    topRatedName: string;
    topRatedRating: string;
    totalWeddingEvents: number;
    totalPaid: string;
    totalPaidCount: number;
    totalUnpaidCount: number;
    avgRating: string;
    performanceNotesCount: number;
}

type StatGroup = 'team' | 'vendor';
type StatKey = 'total' | 'unpaid' | 'topRated' | 'events' | 'payments' | 'performance';

interface TeamSectionStatsProps {
    group: StatGroup;
    stats: SectionStats;
    showExtended: boolean;
    onToggleExtended: () => void;
    onStatClick: (stat: StatKey) => void;
}

const TeamSectionStats: React.FC<TeamSectionStatsProps> = ({
    group,
    stats,
    showExtended,
    onToggleExtended,
    onStatClick,
}) => {
    const isVendor = group === 'vendor';

    return (
        <>
            {/* Primary stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div
                    onClick={() => onStatClick('total')}
                    className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
                    style={{ animationDelay: '100ms' }}
                >
                    <ModernStatCard
                        icon={<UsersIcon className="w-5 h-5" />}
                        title={isVendor ? 'Total Vendor' : 'Total Tim Internal'}
                        value={stats.totalMembers.toString()}
                        subtitle={isVendor ? 'Vendor terdaftar' : 'Anggota tim aktif'}
                        iconColorVariant="primary"
                    />
                </div>
                <div
                    onClick={() => onStatClick('unpaid')}
                    className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
                    style={{ animationDelay: '200ms' }}
                >
                    <ModernStatCard
                        icon={<AlertCircleIcon className="w-5 h-5" />}
                        title={isVendor ? 'Fee Vendor Belum Lunas' : 'Fee Tim Belum Lunas'}
                        value={stats.totalUnpaid}
                        subtitle="Tagihan menunggu pembayaran"
                        iconColorVariant="error"
                    />
                </div>
                <div
                    onClick={() => onStatClick('topRated')}
                    className="widget-animate cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
                    style={{ animationDelay: '300ms' }}
                >
                    <ModernStatCard
                        icon={<UserCheckIcon className="w-5 h-5" />}
                        title={isVendor ? 'Top Vendor' : 'Top Tim'}
                        value={stats.topRatedName}
                        subtitle={`Rating: ${stats.topRatedRating}`}
                        iconColorVariant="success"
                    />
                </div>
            </div>

            {/* Toggle secondary stats */}
            <div className="flex justify-end">
                <button
                    onClick={onToggleExtended}
                    className="text-xs text-[#5D87FF] hover:text-[#4871e3] font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                    <span>
                        {showExtended
                            ? 'Sembunyikan Metrik Tambahan'
                            : 'Tampilkan Metrik Acara, Pembayaran & Kinerja (3 Metrik)'}
                    </span>
                    <span className="text-[10px]">{showExtended ? '▲' : '▼'}</span>
                </button>
            </div>

            {/* Secondary stats */}
            {showExtended && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-4 rounded-2xl bg-white border border-[#EAEFF4] shadow-xs">
                    <div
                        onClick={() => onStatClick('events')}
                        className="cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
                    >
                        <ModernStatCard
                            icon={<CalendarIcon className="w-5 h-5" />}
                            title="Acara Pernikahan Terkait"
                            value={stats.totalWeddingEvents.toString()}
                            subtitle={isVendor ? 'Event terkait vendor' : 'Event ditangani tim'}
                            iconColorVariant="primary"
                        />
                    </div>
                    <div
                        onClick={() => onStatClick('payments')}
                        className="cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
                    >
                        <ModernStatCard
                            icon={<DollarSignIcon className="w-5 h-5" />}
                            title={isVendor ? 'Pembayaran Vendor' : 'Pembayaran Tim'}
                            value={stats.totalPaid}
                            subtitle={`Lunas: ${stats.totalPaidCount} | Pending: ${stats.totalUnpaidCount}`}
                            iconColorVariant="primary"
                        />
                    </div>
                    <div
                        onClick={() => onStatClick('performance')}
                        className="cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
                    >
                        <ModernStatCard
                            icon={<StarIcon className="w-5 h-5" />}
                            title="Kinerja Rata-rata"
                            value={stats.avgRating}
                            subtitle={`Catatan evaluasi: ${stats.performanceNotesCount}`}
                            iconColorVariant="warning"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default TeamSectionStats;
