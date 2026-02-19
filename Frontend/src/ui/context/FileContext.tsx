import { createContext, useContext, useState, type ReactNode } from 'react';

interface FileContextType {
    file: File | null;
    setFile: (file: File | null) => void;
    selectedDrugs: string[];
    setSelectedDrugs: (drugs: string[]) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: ReactNode }) {
    const [file, setFile] = useState<File | null>(null);
    const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);

    return (
        <FileContext.Provider value={{ file, setFile, selectedDrugs, setSelectedDrugs }}>
            {children}
        </FileContext.Provider>
    );
}

export function useFile() {
    const context = useContext(FileContext);
    if (context === undefined) {
        throw new Error('useFile must be used within a FileProvider');
    }
    return context;
}
