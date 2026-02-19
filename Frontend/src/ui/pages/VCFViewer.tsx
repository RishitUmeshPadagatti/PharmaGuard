import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Search, Loader2 } from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { Input } from "@/ui/components/ui/input";
import { useFile } from "../context/FileContext";

export default function VCFViewer() {
    const { file } = useFile();
    const navigate = useNavigate();
    const [headers, setHeaders] = useState<string[]>([]);
    const [data, setData] = useState<string[][]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!file) {
            navigate("/upload");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;

            const lines = text.split("\n");
            const headerLine = lines.find(line => line.startsWith("#CHROM"));
            const dataLines = lines.filter(line => !line.startsWith("#") && line.trim() !== "");

            if (headerLine) {
                // Remove the '#' from #CHROM and split
                setHeaders(headerLine.substring(1).split("\t"));
            } else {
                // Fallback headers if not found
                setHeaders(["Line Content"]);
            }

            setData(dataLines.map(line => line.split("\t")));
            setIsLoading(false);
        };
        reader.readAsText(file);
    }, [file, navigate]);

    const filteredData = data.filter(row =>
        row.some(cell => cell.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (!file) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="p-0 hover:bg-transparent text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2 mb-2"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Analysis
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{file.name}</h1>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Genetic Variant View</p>
                        </div>
                    </div>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search mutations, chromosomes..."
                        className="pl-10 h-11 bg-white border-slate-200 rounded-xl shadow-sm focus:ring-blue-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden rounded-2xl bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                    <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                        Variant Dataset
                        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px]">
                            {filteredData.length} records found
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto max-h-[calc(100vh-350px)] custom-scrollbar">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-white sticky top-0 z-10">
                                <tr>
                                    {headers.map((header, i) => (
                                        <th key={i} className="px-6 py-4 font-bold text-slate-800 border-b border-slate-100 whitespace-nowrap bg-white/95 backdrop-blur-sm first:pl-8">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 bg-white">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={headers.length || 1} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                                                <p className="text-slate-500 font-medium">Parsing genomic data...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredData.length > 0 ? (
                                    filteredData.map((row, i) => (
                                        <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                                            {row.map((cell, j) => (
                                                <td key={j} className="px-6 py-3.5 font-mono text-[13px] text-slate-600 whitespace-nowrap first:pl-8 group-hover:text-slate-900">
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={headers.length || 1} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center">
                                                    <Search className="h-6 w-6 text-slate-300" />
                                                </div>
                                                <p className="text-slate-500 font-medium">No variants found matching "{searchTerm}"</p>
                                                <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>Clear Search</Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
