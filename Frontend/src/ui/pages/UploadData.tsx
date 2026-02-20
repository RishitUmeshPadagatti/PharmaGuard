import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileUploader } from "@/ui/components/FileUploader"
import { DiseaseSelector } from "@/ui/components/DiseaseSelector"
import { Button } from "@/ui/components/ui/button"
import { Progress } from "@/ui/components/ui/progress"
import { ArrowRight, Eye, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useFile } from "@/ui/context/FileContext"
import { BACKEND_URL } from "../lib/values"

export default function UploadData() {
    const { file, setFile, selectedDrugs, setSelectedDrugs } = useFile()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
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
        setUploadProgress(0)

        const formData = new FormData()
        formData.append("vcf", file)
        formData.append("drug", selectedDrugs.join(","))

        let interval: any = null;

        try {
            const xhr = new XMLHttpRequest()

            // Track upload progress
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 50 // Upload is first 50%
                    setUploadProgress(percentComplete)
                }
            }

            xhr.onload = () => {
                if (interval) clearInterval(interval)
                if (xhr.status >= 200 && xhr.status < 300) {
                    const response = JSON.parse(xhr.responseText)
                    setUploadProgress(100)
                    setTimeout(() => {
                        setIsSubmitting(false)
                        toast.success("Analysis complete!", {
                            description: "Your genetic reports are ready.",
                        })
                        navigate("/results", { state: { results: response, fileName: file.name } })
                    }, 500)
                } else {
                    handleError()
                }
            }

            xhr.onerror = () => {
                if (interval) clearInterval(interval)
                handleError()
            }

            xhr.open("POST", `${BACKEND_URL}/api/analyze`)
            xhr.send(formData)

            // Simulate the analysis part of the progress (from 50% upwards)
            interval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 95) {
                        if (interval) clearInterval(interval)
                        return 95
                    }
                    if (prev < 49) return prev // Wait for upload to nearly finish
                    return prev + (95 - prev) * 0.1 // Asymptotic approach to 95%
                })
            }, 800)

        } catch (error) {
            if (interval) clearInterval(interval)
            handleError()
        }
    }

    const handleError = () => {
        setIsSubmitting(false)
        setUploadProgress(0)
        toast.error("Analysis failed", {
            description: "There was an error processing your data. Please try again.",
        })
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

            <div className="space-y-6">
                {isSubmitting && (
                    <div className="max-w-md ml-auto space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                                {uploadProgress < 50 ? "Uploading Data..." : "Analyzing Genomes..."}
                            </span>
                            <span>{Math.round(uploadProgress)}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2 shadow-inner" />
                    </div>
                )}

                <div className="flex justify-end items-center gap-4">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleViewVCF}
                        disabled={isSubmitting || !file}
                        className="px-8 h-14 rounded-full text-lg font-semibold border-2 border-slate-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center gap-2 disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300 disabled:shadow-none"
                    >
                        <Eye className="h-5 w-5" />
                        View VCF File
                    </Button>
                    <Button
                        size="lg"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !file || selectedDrugs.length === 0}
                        className="px-10 h-14 rounded-full text-lg font-bold shadow-xl shadow-blue-200 bg-blue-600 hover:bg-blue-700 transition-all group disabled:shadow-none disabled:bg-slate-200 disabled:text-slate-400 min-w-[200px]"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Processing...
                            </div>
                        ) : (
                            <>
                                Analyze Data
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
