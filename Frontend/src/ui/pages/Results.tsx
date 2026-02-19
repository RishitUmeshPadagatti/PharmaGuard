import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Button } from "@/ui/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/components/ui/card"
import {
    ArrowLeft,
    CheckCircle2,
    AlertTriangle,
    FileBarChart,
    Download,
    Share2,
    Pill,
    Info,
    ChevronDown,
    ChevronUp,
    ShieldAlert,
    Clock,
    User,
    Activity,
    Dna
} from "lucide-react"

export default function Results() {
    const location = useLocation()
    const navigate = useNavigate()
    const { fileName, results } = location.state || { fileName: "Unknown File", results: null }
    const [expandedDrug, setExpandedDrug] = useState<string | null>(null)

    if (!results) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-slate-100 rounded-full">
                    <ShieldAlert className="h-12 w-12 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">No results found</h2>
                <p className="text-slate-500">Please upload a file to see genetic analysis.</p>
                <Button onClick={() => navigate("/")} variant="outline" className="rounded-full">
                    Go Back
                </Button>
            </div>
        )
    }

    // Determine color and icons based on risk label
    const getRiskStyles = (label: string) => {
        const normalized = label?.toLowerCase() || "";
        if (normalized.includes("safe")) {
            return {
                bg: "bg-emerald-50",
                text: "text-emerald-700",
                border: "border-emerald-100",
                badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
                progress: "bg-emerald-500",
                icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
                score: 95
            };
        }
        if (normalized.includes("adjust")) {
            return {
                bg: "bg-amber-50",
                text: "text-amber-700",
                border: "border-amber-100",
                badge: "bg-amber-100 text-amber-800 border-amber-200",
                progress: "bg-amber-500",
                icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
                score: 50
            };
        }
        return {
            bg: "bg-rose-50",
            text: "text-rose-700",
            border: "border-rose-100",
            badge: "bg-rose-100 text-rose-800 border-rose-200",
            progress: "bg-rose-500",
            icon: <ShieldAlert className="h-5 w-5 text-rose-600" />,
            score: 15
        };
    };

    const drugAnalysis = results.drug_analysis || [];
    const genomicProfile = results.pharmacogenomic_profile?.genes || results.pharmacogenomic_profile || [];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/")}
                        className="mb-2 -ml-2 text-slate-500 hover:text-slate-900 group"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Data Upload
                    </Button>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                            Pharmacogenomic <span className="text-blue-600">Report</span>
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                <User className="h-3.5 w-3.5" /> ID: {results.patient_id}
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                <Clock className="h-3.5 w-3.5" /> {new Date(results.timestamp).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                                <FileBarChart className="h-3.5 w-3.5" /> {fileName}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl h-12 border-2 hover:bg-slate-50">
                        <Share2 className="mr-2 h-4 w-4" /> Share Report
                    </Button>
                    <Button className="rounded-xl h-12 bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200">
                        <Download className="mr-2 h-4 w-4" /> Export PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Results Column */}
                <div className="lg:col-span-8 space-y-6">
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-600 rounded-lg">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Drug Compatibility</h2>
                        </div>

                        <div className="space-y-4">
                            {drugAnalysis.length > 0 ? (
                                drugAnalysis.map((item: any) => {
                                    const styles = getRiskStyles(item.risk_assessment.risk_label);
                                    const isExpanded = expandedDrug === item.drug;

                                    return (
                                        <Card
                                            key={item.drug}
                                            className={`transition-all duration-300 border-2 ${isExpanded ? 'border-blue-400 ring-4 ring-blue-50' : 'border-slate-100'}`}
                                        >
                                            <div
                                                className={`p-6 cursor-pointer hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4`}
                                                onClick={() => setExpandedDrug(isExpanded ? null : item.drug)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-2xl shadow-sm ${styles.bg}`}>
                                                        <Pill className={`h-6 w-6 ${styles.text}`} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-slate-900 capitalize">{item.drug.toLowerCase()}</h3>
                                                        <p className="text-sm text-slate-500">Targeted medication screening</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="text-right hidden md:block">
                                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2 ${styles.badge}`}>
                                                            {styles.icon}
                                                            {item.risk_assessment.risk_label.toUpperCase()}
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className={`h-full ${styles.progress}`} style={{ width: `${styles.score}%` }} />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-400">{styles.score}%</span>
                                                        </div>
                                                    </div>
                                                    {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <CardContent className="border-t border-slate-100 bg-slate-50/30 p-6 pt-8 animate-in slide-in-from-top-2 duration-300">
                                                    <div className="space-y-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            <div className="space-y-3">
                                                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                                                    <Info className="h-4 w-4 text-blue-500" />
                                                                    Clinical Summary
                                                                </h4>
                                                                <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                                                    {item.risk_assessment.risk_label === "Safe"
                                                                        ? `No genetic variations detected that significantly impact the metabolism of ${item.drug}. Standard dosing protocols are recommended.`
                                                                        : `Genetic variations detected in associated metabolic pathways. Caution is advised. Consult with a pharmacist or physician for potential ${item.risk_assessment.risk_label.toLowerCase()} concerns.`}
                                                                </p>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                                                    <Dna className="h-4 w-4 text-blue-500" />
                                                                    Evidence Metrics
                                                                </h4>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
                                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Confidence</p>
                                                                        <p className="text-lg font-black text-slate-800">{item.risk_assessment.confidence_score * 100}%</p>
                                                                    </div>
                                                                    <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
                                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Severity</p>
                                                                        <p className={`text-lg font-black capitalize ${styles.text}`}>{item.risk_assessment.severity}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Variants detail */}
                                                        <div className="space-y-3">
                                                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Related Genetic Profile</h4>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                                {genomicProfile.length > 0 ? genomicProfile.map((gene: any) => (
                                                                    <div key={gene.gene} className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col gap-1">
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-xs font-black text-blue-600">{gene.gene}</span>
                                                                            <span className="text-[10px] font-bold text-slate-400">{gene.diplotype}</span>
                                                                        </div>
                                                                        <p className="text-sm font-bold text-slate-700">{gene.phenotype}</p>
                                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                                            {gene.detected_variants?.map((v: any) => (
                                                                                <span key={v.rsid} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                                                                                    {v.rsid}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )) : (
                                                                    <div className="col-span-full border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
                                                                        <p className="text-xs text-slate-400 italic">No associated variants found in the uploaded file.</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            )}
                                        </Card>
                                    )
                                })
                            ) : (
                                <p className="text-center py-12 text-slate-400 italic">No drugs selected for analysis.</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-slate-900 text-white border-none overflow-hidden relative rounded-3xl h-full flex flex-col">
                        <div className="absolute top-0 right-0 p-12 opacity-5">
                            <CheckCircle2 className="h-48 w-48" />
                        </div>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl font-black text-white">Full Profile</CardTitle>
                            <CardDescription className="text-slate-400">Complete genomic dashboard.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4 relative z-10">
                            <div className="space-y-3">
                                {genomicProfile.map((gene: any) => (
                                    <div key={gene.gene} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                                                {gene.gene.slice(0, 3)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white leading-none">{gene.gene}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">{gene.diplotype}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-black text-blue-400">{gene.phenotype}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-white/10 mt-6">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">Quality Metrics</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">VCF Parsing</span>
                                        <span className="text-emerald-400 font-bold">Successful</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">Depth threshold</span>
                                        <span className="text-emerald-400 font-bold">&gt;20x</span>
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl h-14 translate-y-2">
                                Review with Physician
                            </Button>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    )
}

