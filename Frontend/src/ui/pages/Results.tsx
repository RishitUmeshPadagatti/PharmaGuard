import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/ui/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/components/ui/card"
import { ArrowLeft, CheckCircle2, AlertTriangle, FileBarChart, Download, Share2, Pill } from "lucide-react"

export default function Results() {
    const location = useLocation()
    const navigate = useNavigate()
    const { fileName, drugs } = location.state || { fileName: "Sample.vcf", drugs: [] }

    const mockRiskProfiles = drugs.map((id: string) => {
        const compatibility = Math.floor(Math.random() * 100)
        return {
            id,
            name: id.charAt(0).toUpperCase() + id.slice(1).toLowerCase(),
            score: compatibility,
            level: compatibility > 70 ? "High" : compatibility > 30 ? "Moderate" : "Low",
            color: compatibility > 70 ? "text-green-600 bg-green-50 border-green-100" : compatibility > 30 ? "text-amber-600 bg-amber-50 border-amber-100" : "text-red-600 bg-red-50 border-red-100"
        }
    })

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/")}
                        className="mb-2 -ml-2 text-slate-500 hover:text-slate-900"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Upload
                    </Button>
                    <h1 className="text-3xl font-bold text-slate-900">Compatibility Results</h1>
                    <p className="text-slate-500 flex items-center gap-2 mt-1">
                        <FileBarChart className="h-4 w-4" /> Based on genomic file: <span className="font-semibold text-slate-700">{fileName}</span>
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-full">
                        <Share2 className="mr-2 h-4 w-4" /> Share Report
                    </Button>
                    <Button className="rounded-full bg-slate-900 hover:bg-slate-800">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-slate-200">
                    <CardHeader>
                        <CardTitle>Drug Compatibility Analysis</CardTitle>
                        <CardDescription>Genetic variations analyzed for efficacy and safety profiles.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {mockRiskProfiles.length > 0 ? (
                            mockRiskProfiles.map((p: any) => (
                                <div key={p.id} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Pill className="h-4 w-4 text-blue-500" />
                                            <span className="font-medium text-slate-700">{p.name}</span>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${p.color}`}>
                                            {p.level} Compatibility
                                        </span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${p.level === "High" ? "bg-green-500" : p.level === "Moderate" ? "bg-amber-500" : "bg-red-500"
                                                }`}
                                            style={{ width: `${p.score}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                                        <span>Poor Efficacy</span>
                                        <span>{p.score}% Compatibility Score</span>
                                        <span>Optimal Match</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-12 text-slate-400 italic">No drugs selected for analysis.</p>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-blue-600 text-white border-none overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <CheckCircle2 className="h-32 w-32" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-white">Analysis Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-white opacity-50" />
                                    <p className="text-sm opacity-90">{drugs.length} Medications screened</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-white opacity-50" />
                                    <p className="text-sm opacity-90">Protocol: PGx-Standard v2.4</p>
                                </div>
                            </div>
                            <Button className="w-full mt-8 bg-white text-blue-600 hover:bg-blue-50 border-none font-bold rounded-xl h-12">
                                Review with Physician
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-100 bg-amber-50/30">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 text-amber-600">
                                <AlertTriangle className="h-4 w-4" />
                                <CardTitle className="text-sm">Disclaimer</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-amber-700 leading-relaxed italic">
                                This report is for informational purposes only. Do not change medications or dosages without consulting a licensed healthcare professional.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

