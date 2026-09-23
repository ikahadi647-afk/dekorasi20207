import React, { useState } from 'react';
import { Project, Client, ProjectStatusConfig } from '../../../types';
import {
    CalendarIcon,
    MapPinIcon,
    CheckCircleIcon,
    WhatsappIcon,
    EyeIcon,
    PencilIcon,
    ClockIcon
} from '../../../constants';

interface ProjectCardProps {
    project: Project;
    client: Client | undefined;
    projectStatusConfig: ProjectStatusConfig[];
    onStatusChange: (projectId: string, newStatus: string) => void;
    onViewDetails: (project: Project) => void;
    onEdit: (project: Project) => void;
    onSendMessage: (project: Project) => void;
}

const getStatusColor = (status: string, config: ProjectStatusConfig[]): string => {
    const statusConfig = config.find(c => c.name === status);
    return statusConfig ? statusConfig.color : '#64748b';
};

const getDaysUntil = (dateString: string): number => {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

const getProgressPercentage = (status: string, config: ProjectStatusConfig[]): number => {
    const statusIndex = config.findIndex(s => s.name === status);
    if (statusIndex === -1) return 0;
    return ((statusIndex + 1) / config.length) * 100;
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
    project,
    client,
    projectStatusConfig,
    onStatusChange,
    onViewDetails,
    onEdit,
    onSendMessage,
}) => {
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    const daysUntil = getDaysUntil(project.date);
    const progressPercentage = getProgressPercentage(project.status, projectStatusConfig);
    const statusColor = getStatusColor(project.status, projectStatusConfig);

    const isVIP = client && (client as any).isVIP; // Assuming VIP flag exists
    const isUrgent = daysUntil >= 0 && daysUntil <= 7;

    const handleStatusChange = (newStatus: string) => {
        onStatusChange(project.id, newStatus);
        setIsStatusDropdownOpen(false);
    };

    return (
        <div className={`bg-white rounded-2xl shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] border border-[#EAEFF4] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] transition-all duration-200 relative ${isStatusDropdownOpen ? 'z-40' : 'z-auto'}`}>
            {/* Header */}
            <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-base sm:text-lg text-[#2A3547] truncate">
                                {project.projectName}
                            </h3>
                            {isVIP && (
                                <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-[#FEF5E5] text-[#FFAE1F] font-bold">
                                    ⭐ VIP
                                </span>
                            )}
                        </div>
                        <p className="text-xs sm:text-sm text-[#5A6A85] truncate font-medium">
                            {client?.name || project.clientName}
                        </p>
                    </div>
                </div>

                {/* Event Info */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#5A6A85] mb-3">
                    <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4 text-[#5D87FF]" />
                        <span>{new Date(project.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    {project.location && (
                        <div className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4 text-[#FA896B]" />
                            <span className="truncate max-w-[150px]">{project.location}</span>
                        </div>
                    )}
                    {isUrgent && daysUntil >= 0 && (
                        <div className="flex items-center gap-1 text-[#FFAE1F] font-bold">
                            <ClockIcon className="w-4 h-4" />
                            <span>{daysUntil === 0 ? 'Hari ini!' : `${daysUntil} hari lagi`}</span>
                        </div>
                    )}
                </div>

                {/* Status & Progress */}
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="relative">
                            <button
                                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all"
                                style={{
                                    backgroundColor: `${statusColor}18`,
                                    color: statusColor
                                }}
                            >
                                <span>Status: {project.status}</span>
                                <svg className={`w-3.5 h-3.5 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Status Dropdown */}
                            {isStatusDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsStatusDropdownOpen(false)}
                                    />
                                    <div className="absolute top-full left-0 mt-1.5 w-48 bg-white border border-[#EAEFF4] rounded-xl shadow-xl z-20 py-1.5">
                                        {projectStatusConfig.map((statusConfig) => (
                                            <button
                                                key={statusConfig.id}
                                                onClick={() => handleStatusChange(statusConfig.name)}
                                                className={`w-full text-left px-3.5 py-2 text-xs font-bold hover:bg-[#F4F6F9] transition-colors flex items-center gap-2 ${project.status === statusConfig.name ? 'text-[#5D87FF]' : 'text-[#2A3547]'}`}
                                                style={{ color: statusConfig.color }}
                                            >
                                                {project.status === statusConfig.name && (
                                                    <CheckCircleIcon className="w-4 h-4" />
                                                )}
                                                <span className={project.status === statusConfig.name ? '' : 'ml-6'}>
                                                    {statusConfig.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <span className="text-xs font-bold text-[#5A6A85]">
                            {Math.round(progressPercentage)}%
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-[#F4F6F9] rounded-full overflow-hidden">
                        <div
                            className="h-full transition-all duration-500 rounded-full"
                            style={{
                                width: `${progressPercentage}%`,
                                backgroundColor: statusColor
                            }}
                        />
                    </div>
                </div>

                {/* Quick Actions - Fokus pekerjaan */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#EAEFF4]">
                    <button
                        onClick={() => onSendMessage(project)}
                        className="bg-[#13DEB9] hover:bg-[#0ebd9c] text-white font-bold rounded-xl flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs shadow-xs transition-all"
                        title="Chat Pengantin via WA"
                    >
                        <WhatsappIcon className="w-4 h-4 flex-shrink-0" />
                        <span>WhatsApp</span>
                    </button>

                    <button
                        onClick={() => onEdit(project)}
                        className="bg-[#FEF5E5] hover:bg-[#FFAE1F] text-[#FFAE1F] hover:text-white font-bold rounded-xl flex items-center justify-center gap-1.5 py-2 px-3 text-xs transition-all"
                        title="Edit Acara Pernikahan"
                    >
                        <PencilIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs">Edit</span>
                    </button>

                    <button
                        onClick={() => onViewDetails(project)}
                        className="bg-[#ECF2FF] hover:bg-[#5D87FF] text-[#5D87FF] hover:text-white font-bold rounded-xl flex items-center justify-center gap-1.5 py-2 px-3 text-xs transition-all"
                        title="Lihat Detail"
                    >
                        <EyeIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs">Detail</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
