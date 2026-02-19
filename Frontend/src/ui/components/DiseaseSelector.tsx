import { Checkbox } from "@/ui/components/ui/checkbox"
import { Label } from "@/ui/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/components/ui/card"
import { Pill, Droplets, Activity, Heart, Shield, FlaskConical } from "lucide-react"

const drugs = [
    { id: "codeine", name: "Codeine", icon: <Pill className="h-4 w-4" /> },
    { id: "warfarin", name: "Warfarin", icon: <Droplets className="h-4 w-4" /> },
    { id: "clopidogrel", name: "Clopidogrel", icon: <Activity className="h-4 w-4" /> },
    { id: "simvastatin", name: "Simvastatin", icon: <Heart className="h-4 w-4" /> },
    { id: "azathioprine", name: "Azathioprine", icon: <Shield className="h-4 w-4" /> },
    { id: "fluorouracil", name: "Fluorouracil (5-FU)", icon: <FlaskConical className="h-4 w-4" /> },
]

interface DiseaseSelectorProps {
    selectedDiseases: string[]
    onSelectionChange: (selectedIds: string[]) => void
}

export function DiseaseSelector({ selectedDiseases, onSelectionChange }: DiseaseSelectorProps) {
    const toggleDrug = (drugId: string) => {
        const isSelected = selectedDiseases.includes(drugId)
        if (isSelected) {
            onSelectionChange(selectedDiseases.filter((id) => id !== drugId))
        } else {
            onSelectionChange([...selectedDiseases, drugId])
        }
    }

    return (
        <Card className="w-full border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden h-full flex flex-col min-h-[500px] rounded-2xl">
            <CardHeader className="bg-slate-50/50 pb-6 border-b border-slate-100">
                <CardTitle className="text-xl font-bold text-slate-900">Drug Selection</CardTitle>
                <CardDescription className="text-slate-500">
                    Select medications for genetic compatibility analysis.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 flex-1 flex flex-col bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                    {drugs.map((drug) => (
                        <div
                            key={drug.id}
                            onClick={() => toggleDrug(drug.id)}
                            className={`group flex items-center justify-between gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-300 relative ${selectedDiseases.includes(drug.id)
                                ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50 hover:shadow-sm"
                                }`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`flex shrink-0 items-center justify-center p-2 rounded-lg transition-all duration-300 ${selectedDiseases.includes(drug.id)
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-105"
                                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-600"
                                    }`}>
                                    {drug.icon}
                                </div>

                                <Label
                                    htmlFor={drug.id}
                                    className={`font-semibold text-sm cursor-pointer transition-colors duration-200 truncate ${selectedDiseases.includes(drug.id)
                                        ? "text-blue-900"
                                        : "text-slate-700 font-medium"
                                        }`}
                                >
                                    {drug.name}
                                </Label>
                            </div>

                            <Checkbox
                                id={drug.id}
                                checked={selectedDiseases.includes(drug.id)}
                                className={`h-4.5 w-4.5 rounded transition-all duration-300 ${selectedDiseases.includes(drug.id)
                                    ? "bg-blue-600 border-blue-600 data-[state=checked]:bg-blue-600"
                                    : "border-slate-300 group-hover:border-slate-400"
                                    }`}
                            />
                        </div>
                    ))}
                </div>

                <div className="h-10 mt-6 flex items-center justify-center border-t border-slate-50 pt-4">
                    {selectedDiseases.length === 0 ? (
                        <p className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider animate-pulse">
                            Selection Required
                        </p>
                    ) : (
                        <p className="text-[11px] font-semibold text-green-600 uppercase tracking-wider">
                            {selectedDiseases.length} Drug{selectedDiseases.length > 1 ? 's' : ''} Selected
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}


