import React, { createContext, useState, useContext, ReactNode, type FC } from "react";
import { Report } from "@prisma/client";
import { FlagIcon } from "@/icons";

interface ReportContextType {
    showReportModal: boolean;
    setShowReportModal: (show: boolean) => void;

    ReportButton: (size: number, showModal: (show: boolean) => void) => JSX.Element;
}

export const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider = ({ children }: { children: ReactNode }) => {
    const [showReportModal, setShowReportModal] = useState(false);

    const ReportButton = (size: number, showModal: (show: boolean) => void): JSX.Element => {
        return (
            <button
                onClick={() => showModal(true)}
                className="blog-bubble-info"
            >
                <FlagIcon className={`vote-icon w-${size} h-${size}`} />
            </button>
        );
    };

    return (
        <ReportContext.Provider value={{ showReportModal, setShowReportModal, ReportButton }}>
            {children}
        </ReportContext.Provider>
    );
};

export const useReportContext = () => {
    const context = useContext(ReportContext);
    if (!context) {
        throw new Error("useBlogContext must be used within a BlogProvider");
    }
    return context;
};
