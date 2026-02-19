import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileUploader } from "@/ui/components/FileUploader"
import { DiseaseSelector } from "@/ui/components/DiseaseSelector"
import { Button } from "@/ui/components/ui/button"
import { ArrowRight, Eye } from "lucide-react"
import { toast } from "sonner"
import { useFile } from "@/ui/context/FileContext"

export default function UploadData() {
    const { file, setFile, selectedDrugs, setSelectedDrugs } = useFile()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async () => {
        if (!file) {
            toast.error("File missing", {
                description: "Please upload a .vcf file to continue.",
            })
            return
        }

        if (selectedDrugs.length === 0) {
            toast.error("No drugs selected", {
                description: "Select at least one drug to analyze.",
            })
            return
        }

        setIsSubmitting(true)

        // Simulate API call
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)),
            {
                loading: 'Processing genetic data...',
                success: () => {
                    setIsSubmitting(false)
                    navigate("/results", { state: { fileName: file.name, drugs: selectedDrugs } })
                    return 'Analysis complete! Redirecting to reports...';
                },
                error: 'Failed to process data.',
            }
        )
    }

    const handleViewVCF = () => {
        if (file) {
            navigate("/vcf-viewer");
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                    Pharmacogenomics <span className="text-blue-600">Screening</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Securely upload your VCF data to analyze genetic variations against supported medications for personalized dosage and safety.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-6">
                {/* Column 1 */}
                <div className="flex flex-col h-full">
                    <section className="flex-1 flex flex-col space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2 shrink-0 h-6">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px]">1</span>
                            Source File
                        </h2>
                        <div className="flex-1 flex flex-col">
                            <FileUploader onFileSelect={setFile} currentFile={file} />
                        </div>
                    </section>
                </div>

                {/* Column 2 */}
                <div className="flex flex-col h-full">
                    <section className="flex-1 flex flex-col space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2 shrink-0 h-6">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px]">2</span>
                            Drug Portfolio
                        </h2>
                        <div className="flex-1 flex flex-col">
                            <DiseaseSelector
                                selectedDiseases={selectedDrugs}
                                onSelectionChange={setSelectedDrugs}
                            />
                        </div>
                    </section>
                </div>
            </div>

            <div className="flex justify-end items-center gap-4 mt-8">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={handleViewVCF}
                    disabled={!file}
                    className="px-8 h-14 rounded-full text-lg font-semibold border-2 border-slate-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center gap-2 disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300 disabled:shadow-none"
                >
                    <Eye className="h-5 w-5" />
                    View VCF File
                </Button>
                <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !file || selectedDrugs.length === 0}
                    className="px-10 h-14 rounded-full text-lg font-bold shadow-xl shadow-blue-200 bg-blue-600 hover:bg-blue-700 transition-all group disabled:shadow-none disabled:bg-slate-200 disabled:text-slate-400"
                >
                    Analyze Data
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </div>
    )
}

