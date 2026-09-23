import React from 'react';
import { Card, CardType, FinancialPocket } from '../../../types';
import { CardWidget } from './CardWidget';
import { CashWidget } from './CashWidget';
import { ModernStatCard } from '../../../components/modernize/ModernStatCard';
import { formatCurrency } from '../../../utils/currency';
import { CreditCardIcon, PlusIcon, DollarSignIcon, TrendingUpIcon, CashIcon } from '../../../constants';

interface CardStats {
    creditDebt: number;
    debitAndCashAssets: number;
    mostUsedCardName: string;
    mostUsedCardTxCount: number;
    cashBalance: number;
}

interface CardsTabProps {
    cards: Card[];
    pockets: FinancialPocket[];
    cardStats: CardStats;
    onOpenModal: (type: 'card' | 'topup-cash', mode: 'add' | 'edit', data?: any) => void;
    onDeleteCard: (id: string) => void;
    onViewHistory: (card: Card) => void;
}

const CardsTab: React.FC<CardsTabProps> = ({
    cards,
    pockets,
    cardStats,
    onOpenModal,
    onDeleteCard,
    onViewHistory
}) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#2A3547] flex items-center gap-2">
                    <CreditCardIcon className="w-5 h-5 text-[#5D87FF]" /> Kartu Saya
                </h3>
                <button
                    onClick={() => onOpenModal('card', 'add')}
                    className="bg-[#5D87FF] hover:bg-[#4871e3] text-white font-bold rounded-xl px-4 py-2 text-xs sm:text-sm shadow-md shadow-[#5D87FF]/25 inline-flex items-center gap-1.5 transition-all"
                >
                    <PlusIcon className="w-4 h-4 flex-shrink-0" /> Tambah Kartu
                </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                <ModernStatCard
                    icon={<CreditCardIcon className="w-5 h-5" />}
                    title="Total Utang Kartu Kredit"
                    value={formatCurrency(Math.abs(cardStats.creditDebt))}
                    subtitle="Saldo negatif kartu kredit"
                    colorVariant="coral"
                />
                <ModernStatCard
                    icon={<DollarSignIcon className="w-5 h-5" />}
                    title="Total Aset (Debit & Tunai)"
                    value={formatCurrency(cardStats.debitAndCashAssets)}
                    subtitle="Saldo kartu debit & kas"
                    colorVariant="teal"
                />
                <ModernStatCard
                    icon={<TrendingUpIcon className="w-5 h-5" />}
                    title="Paling Sering Digunakan"
                    value={cardStats.mostUsedCardName}
                    subtitle={`${cardStats.mostUsedCardTxCount} transaksi`}
                    colorVariant="blue"
                />
                <ModernStatCard
                    icon={<CashIcon className="w-5 h-5" />}
                    title="Total Saldo Tunai"
                    value={formatCurrency(cardStats.cashBalance)}
                    subtitle="Uang kas yang tersedia"
                    colorVariant="amber"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {cards.map(card => {
                    const connectedPockets = pockets.filter(p => p.sourceCardId === card.id);
                    return (
                        <div key={card.id}>
                            {card.cardType === CardType.TUNAI ? (
                                <CashWidget
                                    card={card}
                                    onClick={() => onViewHistory(card)}
                                    onTopUp={() => onOpenModal('topup-cash', 'add')}
                                    onEdit={() => onOpenModal('card', 'edit', card)}
                                    connectedPockets={connectedPockets}
                                />
                            ) : (
                                <CardWidget
                                    card={card}
                                    onEdit={() => onOpenModal('card', 'edit', card)}
                                    onDelete={() => onDeleteCard(card.id)}
                                    onClick={() => onViewHistory(card)}
                                    connectedPockets={connectedPockets}
                                />
                            )}
                        </div>
                    );
                })}
                <button
                    onClick={() => onOpenModal('card', 'add')}
                    className="group aspect-[1.586] border-2 border-dashed border-[#EAEFF4] hover:border-[#5D87FF] bg-[#F4F6F9]/60 hover:bg-[#ECF2FF]/40 rounded-2xl flex flex-col items-center justify-center text-[#5A6A85] hover:text-[#5D87FF] transition-all duration-300 shadow-xs"
                >
                    <div className="w-14 h-14 rounded-2xl bg-white border border-[#EAEFF4] group-hover:border-[#5D87FF]/40 flex items-center justify-center transition-all shadow-xs">
                        <PlusIcon className="w-7 h-7 text-[#5D87FF] transition-transform group-hover:scale-110" />
                    </div>
                    <span className="mt-3 font-bold text-sm text-[#2A3547] group-hover:text-[#5D87FF] transition-colors">Tambah Kartu / Akun</span>
                </button>
            </div>
        </div>
    );
};

export default CardsTab;
