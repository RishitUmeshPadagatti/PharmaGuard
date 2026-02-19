import { useState, useRef, useEffect } from "react"
import { Upload, X, FileText, CheckCircle2 } from "lucide-react"
import { Button } from "@/ui/components/ui/button"
import { toast } from "sonner"
import { Progress } from "@/ui/components/ui/progress"

interface FileUploaderProps {
    onFileSelect: (file: File | null) => void;
    currentFile: File | null;
}

export function FileUploader({ onFileSelect, currentFile }: FileUploaderProps) {
    const [file, setFile] = useState<File | null>(currentFile)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

    const processFile = (selectedFile: File) => {
        setIsUploading(true)
        setUploadProgress(0)
        setFile(null)

        const reader = new FileReader()

        reader.onprogress = (event) => {
            if (event.lengthComputable) {
                const progress = (event.loaded / event.total) * 100
                setUploadProgress(progress)
            }
        }

        reader.onloadend = () => {
            // Add a small delay for better UX feel of "completing"
            setTimeout(() => {
                setIsUploading(false)
                setFile(selectedFile)
                onFileSelect(selectedFile)
                toast.success("File processed successfully", {
                    description: `${selectedFile.name} is ready for analysis.`,
                })
            }, 600)
            setUploadProgress(100)
        }

        reader.onerror = () => {
            setIsUploading(false)
            toast.error("Process failed", {
                description: "Could not read the genetic data file.",
            })
        }

        // We read it as an array buffer to simulate "real" data handling
        reader.readAsArrayBuffer(selectedFile)
    }

    const validateAndSetFile = (selectedFile: File) => {
        const extension = selectedFile.name.split(".").pop()?.toLowerCase()
        if (extension !== "vcf") {
            toast.error("Invalid file type", {
                description: "Please upload a .vcf file.",
            })
            return false
        }
        if (selectedFile.size > MAX_FILE_SIZE) {
            toast.error("File too large", {
                description: "Maximum file size is 5MB.",
            })
            return false
        }

        processFile(selectedFile)
        return true
    }

    useEffect(() => {
        const handleWindowDragOver = (e: DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(true)
        }

        const handleWindowDragLeave = (e: DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            // Only stop dragging if we leave the window entirely
            if (e.relatedTarget === null) {
                setIsDragging(false)
            }
        }

        const handleWindowDrop = (e: DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(false)

            const droppedFile = e.dataTransfer?.files?.[0]
            if (droppedFile) {
                validateAndSetFile(droppedFile)
            }
        }

        window.addEventListener("dragover", handleWindowDragOver)
        window.addEventListener("dragleave", handleWindowDragLeave)
        window.addEventListener("drop", handleWindowDrop)

        return () => {
            window.removeEventListener("dragover", handleWindowDragOver)
            window.removeEventListener("dragleave", handleWindowDragLeave)
            window.removeEventListener("drop", handleWindowDrop)
        }
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            validateAndSetFile(selectedFile)
        }
    }

    const removeFile = () => {
        setFile(null)
        onFileSelect(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    return (
        <div className="w-full h-full flex flex-col">
            {/* Global Drag Overlay */}
            {isDragging && (
                <div className="fixed inset-0 z-[100] bg-blue-600/10 backdrop-blur-sm border-4 border-dashed border-blue-500 flex items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-white p-12 rounded-3xl shadow-2xl flex flex-col items-center gap-4 scale-110 transition-transform">
                        <div className="p-4 bg-blue-50 rounded-full">
                            <Upload className="h-12 w-12 text-blue-500 animate-bounce" />
                        </div>
                        <p className="text-xl font-bold text-slate-900">Drop VCF file anywhere</p>
                    </div>
                </div>
            )}

            <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center bg-white flex-1 max-h-[500px] ${file
                    ? "border-green-500 bg-green-50/10"
                    : "border-slate-200 hover:border-slate-300"
                    }`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".vcf"
                    className="hidden"
                />

                {isUploading ? (
                    <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-300">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-blue-100 rounded-full animate-pulse">
                                <Upload className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="text-lg font-semibold text-slate-900">Processing file...</h3>
                                <p className="text-sm text-slate-500">Reading your genetic data</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium text-slate-500">
                                <span>{Math.round(uploadProgress)}% complete</span>
                                <span>Reading VCF data...</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                        </div>
                    </div>
                ) : !file ? (
                    <>
                        <div className="p-4 bg-blue-50 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Upload className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Upload VCF File
                        </h3>
                        <p className="text-sm text-slate-500 text-center mb-6">
                            Drag and drop your genetic data file here, <br />
                            or click to browse from your computer.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-full px-6"
                        >
                            Choose File
                        </Button>
                        <div className="mt-6 flex items-center gap-4 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-500" /> .VCF ONLY
                            </span>
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-500" /> MAX 5MB
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 animate-in fade-in zoom-in duration-300">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                    {file.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {file.size < 1024 * 1024
                                        ? `${(file.size / 1024).toFixed(2)} KB`
                                        : `${(file.size / (1024 * 1024)).toFixed(2)} MB`}
                                </p>
                            </div>
                            <button
                                onClick={removeFile}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X className="h-4 w-4 text-slate-500" />
                            </button>
                        </div>
                        <div className="mt-8 text-center flex flex-col justify-center">
                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                            <p className="font-bold text-slate-900">File Selected</p>
                            <p className="text-xs text-slate-500">Ready for analysis</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )

}
