import { useState, useRef } from "react"
import { toCanvas } from "html-to-image"
import { jsPDF } from "jspdf"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/ui/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/ui/card"
import {
    ArrowLeft,
    CheckCircle2,
    AlertTriangle,
    Download,
    Pill,
    Info,
    ShieldAlert,
    Clock,
    User,
    Activity,
    Dna,
    Code,
    Copy,
    Check,
    FileDown,
    Mail,
    MessageCircle
} from "lucide-react"
import { toast } from "sonner"
import { BACKEND_URL } from "../lib/values"

export default function Results() {
    const location = useLocation()
    const navigate = useNavigate()
    const { results } = location.state || { results: null }
    const [showJson, setShowJson] = useState(false)
    const [copied, setCopied] = useState(false)
    const reportRef = useRef<HTMLDivElement>(null)

    const handleExportPdf = async () => {
        console.log("Export PDF clicked (enhanced multi-page)");
        if (!reportRef.current) {
            console.error("Report reference is null");
            return;
        }

        const loadingToast = toast.loading('Generating multi-page PDF report...');

        try {
            const element = reportRef.current;

            // Force a fixed wide width for capture to ensure the desktop layout (6xl) is fully expanded
            const desktopWidth = 1200;
            console.log(`Rendering content at ${desktopWidth}px...`);

            const canvas = await toCanvas(element, {
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                width: desktopWidth,
                height: element.scrollHeight,
                style: {
                    width: `${desktopWidth}px`,
                    maxWidth: 'none',
                    margin: '0',
                    padding: '20px'
                },
                filter: (node: any) => {
                    return !(node instanceof HTMLElement && node.getAttribute('data-html2canvas-ignore') === 'true');
                }
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);

            const pdf = new jsPDF('p', 'mm', 'letter');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgProps = pdf.getImageProperties(imgData);
            const margin = 5;
            const contentWidth = pdfWidth - (2 * margin);
            const ratio = imgProps.width / imgProps.height;
            const contentHeight = contentWidth / ratio;

            let heightLeft = contentHeight;
            let position = 0;

            // Page 1
            pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
            heightLeft -= pdfHeight;

            // Additional pages
            while (heightLeft > 0) {
                position = heightLeft - contentHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
                heightLeft -= pdfHeight;
            }

            console.log("Saving PDF...");
            pdf.save(`Pharmacogenomic_Report_${results.patient_id}.pdf`);

            console.log("Export successful");
            toast.success('PDF downloaded successfully!', { id: loadingToast });
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error('Failed to generate PDF. Check console for details.', { id: loadingToast });
        }
    }

    const handleConsultEmail = async () => {
        const email = window.prompt("Enter the specialist's email address:", "rishit1275@outlook.com");
        if (!email) return;

        const loadingToast = toast.loading('Sending email to specialist...');
        try {
            const response = await fetch(`${BACKEND_URL}/api/email/review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject: "Pharmacogenomic Report Review Request",
                    message: `A new pharmacogenomic report (Patient ID: ${results.patient_id}) is ready for your clinical review.`,
                    to: email
                })
            });

            if (!response.ok) throw new Error("Failed to send email");

            toast.success('Email sent successfully!', { id: loadingToast });
        } catch (error) {
            console.error("Error sending email:", error);
            toast.error('Failed to send email. Ensure the backend is running.', { id: loadingToast });
        }
    }

    const handleConsultWhatsApp = async () => {
        const loadingToast = toast.loading('Sending WhatsApp notification...');
        try {
            const response = await fetch(`${BACKEND_URL}/api/whatsapp/review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: "Hello Testing"
                })
            });

            if (!response.ok) throw new Error("Failed to send WhatsApp message");

            toast.success('WhatsApp notification sent!', { id: loadingToast });
        } catch (error) {
            console.error("Error sending WhatsApp:", error);
            toast.error('WhatsApp failed. Check your Twilio configuration.', { id: loadingToast });
        }
    }

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

    const handleCopyJson = () => {
        navigator.clipboard.writeText(JSON.stringify(results, null, 4))
        setCopied(true)
        toast.success("JSON copied to clipboard")
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownloadJson = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 4))
        const downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute("href", dataStr)
        downloadAnchorNode.setAttribute("download", `pgx_report_${results.patient_id}.json`)
        document.body.appendChild(downloadAnchorNode)
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
        toast.success("JSON file downloaded")
    }

    // Determine color and icons based on risk label
    const getRiskStyles = (label: string) => {
        const normalized = label?.toLowerCase() || "";
        if (normalized.includes("safe")) {
            return {
                bg: "bg-emerald-50",
                text: "text-emerald-700",
                border: "border-emerald-200",
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
                border: "border-amber-200",
                badge: "bg-amber-100 text-amber-800 border-amber-200",
                progress: "bg-amber-500",
                icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
                score: 50
            };
        }
        if (normalized.includes("toxic") || normalized.includes("ineffective")) {
            return {
                bg: "bg-rose-50",
                text: "text-rose-700",
                border: "border-rose-200",
                badge: "bg-rose-100 text-rose-800 border-rose-200",
                progress: "bg-rose-500",
                icon: <ShieldAlert className="h-5 w-5 text-rose-600" />,
                score: 15
            };
        }
        return {
            bg: "bg-slate-50",
            text: "text-slate-700",
            border: "border-slate-200",
            badge: "bg-slate-100 text-slate-800 border-slate-200",
            progress: "bg-slate-500",
            icon: <Info className="h-5 w-5 text-slate-600" />,
            score: 50
        };
    };

    const drugAnalysis = results.drug_analysis || [];
    const genomicProfile = results.pharmacogenomic_profile?.genes || [];
    const llmSummary = results.llm_generated_explanation?.summary;

    return (
        <div ref={reportRef} className="max-w-6xl mx-auto px-12 pt-12 space-y-10 animate-in fade-in slide-in-from-top-4 duration-700 pb-20 bg-white">
            {/* Header Area Area */}
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
                                <User className="h-3.5 w-3.5" /> Patient ID: {results.patient_id}
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                <Clock className="h-3.5 w-3.5" /> Date: {new Date(results.timestamp).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="outline"
                        className="rounded-xl h-12 border-2 hover:bg-slate-50"
                        onClick={() => setShowJson(!showJson)}
                    >
                        <Code className="mr-2 h-4 w-4" />
                        {showJson ? "Hide JSON" : "View JSON Response"}
                    </Button>
                    <Button
                        onClick={handleExportPdf}
                        className="rounded-xl h-12 bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200"
                    >
                        <Download className="mr-2 h-4 w-4" /> Export PDF
                    </Button>
                </div>
            </div>

            {/* JSON Viewer Area */}
            {showJson && (
                <div data-html2canvas-ignore="true">
                    <Card className="border-2 border-slate-200 overflow-hidden rounded-[2rem] animate-in slide-in-from-top-4 duration-500">
                        <CardHeader className="bg-slate-50 border-b border-slate-200 flex flex-row items-center justify-between p-6">
                            <div>
                                <CardTitle className="text-lg font-black text-slate-900">Raw JSON Response</CardTitle>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="rounded-lg bg-white" onClick={handleCopyJson}>
                                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                    <span className="ml-2">{copied ? "Copied" : "Copy"}</span>
                                </Button>
                                <Button size="sm" variant="outline" className="rounded-lg bg-white" onClick={handleDownloadJson}>
                                    <FileDown className="h-4 w-4" />
                                    <span className="ml-2">Download</span>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="bg-slate-900 p-8 max-h-[600px] overflow-auto">
                                <pre className="text-blue-300 font-mono text-xs leading-relaxed">
                                    {JSON.stringify(results, null, 4)}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* AI Summary Section */}
            {llmSummary && (
                <Card className="border-4 border-slate-100 shadow-2xl bg-white overflow-hidden relative rounded-[2.5rem]">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <Activity className="h-64 w-64 text-blue-600" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-indigo-50" />
                    <CardHeader className="p-10 pb-4 relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200">
                                <Activity className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-slate-900 text-3xl font-black tracking-tighter">Clinical Intelligence</CardTitle>
                                <p className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mt-1">LLM-Generated Executive Insight</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 pt-0 relative z-10">
                        <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 border-2 border-slate-100 shadow-inner">
                            <p className="text-slate-700 text-xl leading-relaxed font-bold">
                                {llmSummary}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Drug Analysis Section */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200">
                            <Pill className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Medication Analysis Breakdown</h2>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-0.5">Pharmacogenomic Drug-Gene Interactions</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {drugAnalysis.length > 0 ? (
                        drugAnalysis.map((item: any) => {
                            const styles = getRiskStyles(item.risk_assessment.risk_label);
                            return (
                                <Card key={item.drug} className={`overflow-hidden border-4 transition-all duration-500 hover:shadow-2xl rounded-[3rem] ${styles.border}`}>
                                    <div className={`p-8 border-b-4 flex flex-col lg:flex-row lg:items-center justify-between gap-8 ${styles.bg} ${styles.border}`}>
                                        <div className="flex items-center gap-6">
                                            <div className="p-5 bg-white rounded-[2rem] shadow-md border border-slate-100">
                                                <Pill className={`h-10 w-10 ${styles.text}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-3xl font-black text-slate-900 capitalize tracking-tighter">{item.drug.toLowerCase()}</h3>
                                                    <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">RX-PGX</span>
                                                </div>
                                                <p className="text-slate-500 font-bold mt-1 flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${styles.progress}`} />
                                                    {item.risk_assessment.severity.toUpperCase()} SEVERITY ESCALATION
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-6">
                                            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border-2 border-slate-100 flex flex-col items-center min-w-[120px]">
                                                <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Confidence</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl font-black text-slate-900">{(item.risk_assessment.confidence_score * 100).toFixed(0)}%</span>
                                                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full ${styles.progress}`} style={{ width: `${item.risk_assessment.confidence_score * 100}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`px-8 py-4 rounded-[2rem] text-sm font-black border-4 flex items-center gap-3 shadow-lg ${styles.badge}`}>
                                                {styles.icon}
                                                {item.risk_assessment.risk_label.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>

                                    <CardContent className="p-10">
                                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                                            {/* Left Column: Recommendations */}
                                            <div className="xl:col-span-7 space-y-8">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-6 rounded-full ${styles.progress}`} />
                                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Clinical Guidance & Notes</h4>
                                                    </div>
                                                    <div className="text-base text-slate-800 font-bold leading-relaxed bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 shadow-inner">
                                                        {item.clinical_recommendation?.summary || (
                                                            item.risk_assessment.risk_label === "Safe"
                                                                ? `Based on high-confidence genomic data, standard dosing of ${item.drug.toLowerCase()} is likely effective. No actionable variants were identified in associated metabolic pathways.`
                                                                : `CRITICAL ALERT: Genetic markers indicate significant metabolic divergence. Current clinical evidence strongly suggests a ${item.risk_assessment.risk_label.toLowerCase()} response for ${item.drug.toLowerCase()}. Adjustments are advised.`
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div className="p-6 bg-blue-50 border-2 border-blue-100 rounded-3xl">
                                                        <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <User className="h-3 w-3" /> Adult Dosing Adjust.
                                                        </h5>
                                                        <p className="text-sm font-bold text-slate-700">
                                                            {item.clinical_recommendation?.adult_dosage || "Refer to CPIC/PharmGKB standard guidelines for this phenotype."}
                                                        </p>
                                                    </div>
                                                    <div className="p-6 bg-indigo-50 border-2 border-indigo-100 rounded-3xl">
                                                        <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <Activity className="h-3 w-3" /> Pediatric Guidance
                                                        </h5>
                                                        <p className="text-sm font-bold text-slate-700">
                                                            {item.clinical_recommendation?.pediatric_dosage || "Consult specialist for pediatric metabolic scaling."}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column: Evidence & Genomics */}
                                            <div className="xl:col-span-5 space-y-8">
                                                <div className="space-y-4">
                                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        <ShieldAlert className="h-4 w-4 text-slate-400" />
                                                        Evidence Framework
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="p-5 bg-white border-2 border-slate-100 rounded-3xl flex flex-col justify-center shadow-sm">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase mb-1 whitespace-nowrap">Evidence Level</span>
                                                            <span className="text-xl font-black text-slate-900">Level 1A (CPIC)</span>
                                                        </div>
                                                        <div className="p-5 bg-white border-2 border-slate-100 rounded-3xl flex flex-col justify-center shadow-sm">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase mb-1 whitespace-nowrap">Actionability</span>
                                                            <span className={`text-xl font-black ${styles.text}`}>Highly Actionable</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-8 bg-slate-50 rounded-[2rem] text-slate-900 overflow-hidden relative border-2 border-slate-100 shadow-inner">
                                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                                        <Dna className="h-20 w-20 text-blue-600" />
                                                    </div>
                                                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6 border-b border-slate-200 pb-4">Associated Genomic Markers</h4>
                                                    <div className="space-y-4">
                                                        {genomicProfile.length > 0 ? genomicProfile.slice(0, 2).map((gene: any) => (
                                                            <div key={gene.gene} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[10px] font-black">
                                                                        {gene.gene.slice(0, 3)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-black text-slate-900">{gene.gene}</p>
                                                                        <p className="text-[9px] text-slate-500 font-bold uppercase">{gene.diplotype}</p>
                                                                    </div>
                                                                </div>
                                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{gene.phenotype}</span>
                                                            </div>
                                                        )) : (
                                                            <p className="text-xs text-slate-500 italic font-bold">Global profile markers apply.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })
                    ) : (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
                            <Pill className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                            <p className="text-slate-400 font-black text-xl">No specific medication data available for this profile.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Detailed Genomic Profile Section */}
            <section className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200">
                        <Dna className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Comprehensive Genomic Profile</h2>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-0.5">High-Precision Variant Detection Summary</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <Card className="rounded-[3rem] overflow-hidden border-4 border-slate-100 shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b-2 border-slate-100">
                                        <th className="px-10 py-8 text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">Gene Symbol</th>
                                        <th className="px-10 py-8 text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">Diplotype Config</th>
                                        <th className="px-10 py-8 text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">Metabolic Phenotype</th>
                                        <th className="px-10 py-8 text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">Detected Pathogenic Variants</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-slate-100 font-medium">
                                    {genomicProfile.length > 0 ? genomicProfile.map((gene: any) => (
                                        <tr key={gene.gene} className="hover:bg-blue-50/50 transition-all duration-300 group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="h-16 w-16 rounded-[1.5rem] bg-blue-600 flex flex-col items-center justify-center text-white shadow-xl group-hover:scale-110 transition-all duration-500">
                                                        <span className="text-xs font-black opacity-60 uppercase">Gene</span>
                                                        <span className="text-lg font-black">{gene.gene}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-widest">{gene.gene} Target</span>
                                                        <p className="text-[10px] text-slate-400 font-bold mt-1">Pharmacogenomic Locus</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-mono font-black text-slate-800 bg-slate-100 px-4 py-2 rounded-xl inline-block w-fit border border-slate-200">
                                                        {gene.diplotype}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-black mt-2 uppercase">Core Alleles Detected</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col gap-2">
                                                    <span className="px-6 py-2 bg-blue-600 text-white rounded-2xl text-xs font-black inline-block w-fit shadow-lg shadow-blue-200 uppercase tracking-widest">
                                                        {gene.phenotype}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-bold ml-1 uppercase">Predicted Metabolism</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-wrap gap-3 max-w-sm">
                                                    {gene.detected_variants?.length > 0 ? gene.detected_variants.map((v: any) => (
                                                        <div key={v.rsid} className="flex flex-col items-center bg-white border-2 border-slate-100 rounded-2xl p-3 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-default">
                                                            <span className="text-[10px] font-black text-slate-900 font-mono">{v.rsid}</span>
                                                            <span className="text-[8px] font-black text-blue-500 uppercase mt-1">Confirmed</span>
                                                        </div>
                                                    )) : (
                                                        <span className="text-sm text-slate-400 font-bold italic">No variants of interest</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="px-10 py-32 text-center text-slate-400 font-black text-xl uppercase tracking-widest bg-slate-50">
                                                Diagnostic Engine: No actionable markers found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </section>
            {/* Report Quality & Integrity Section */}
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">


                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Info className="h-40 w-40" />
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black tracking-tight">Clinical Verification Required</h3>
                            <p className="text-slate-400 font-medium max-w-xl">
                                This report is an automated genomic analysis. All clinical decisions should be reviewed by a qualified pharmacogenomics specialist or attending physician.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <Button
                                onClick={handleConsultEmail}
                                variant="outline"
                                className="h-14 px-6 bg-white/5 text-white font-bold rounded-2xl border-white/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                            >
                                <Mail className="h-4 w-4" />
                                Consult Email
                            </Button>
                            <Button
                                onClick={handleConsultWhatsApp}
                                variant="outline"
                                className="h-14 px-6 bg-white/5 text-white font-bold rounded-2xl border-white/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Consult WhatsApp
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

