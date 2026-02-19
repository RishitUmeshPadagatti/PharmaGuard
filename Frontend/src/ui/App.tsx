import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import UploadData from './pages/UploadData';
import Results from './pages/Results';
import VCFViewer from './pages/VCFViewer';
import NotFound from './pages/NotFound';
import { Toaster } from "@/ui/components/ui/sonner";
import { Microscope } from 'lucide-react';
import { FileProvider } from './context/FileContext';
import './App.css';

function App() {
  return (
    <FileProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          {/* Top Professional Navigation */}
          <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 shadow-sm backdrop-blur-md bg-white/90">
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                  <Microscope className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Pharma<span className="text-blue-600">Guard</span>
                </span>
              </div>


            </div>

            <div className="flex items-center gap-4">


              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block leading-tight">
                  <p className="text-xs font-bold text-slate-900">Dr. Rohan Goswami</p>
                  <p className="text-[10px] text-slate-500 font-medium">Administrator</p>
                </div>
                <div className="h-9 w-9 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                  RG
                </div>
              </div>
            </div>
          </header>

          {/* Dynamic Content Area */}
          <main className="flex-1 p-6 md:p-12 w-full mx-auto">
            <Routes>
              <Route path="/" element={<UploadData />} />
              <Route path="/upload" element={<UploadData />} />
              <Route path="/vcf-viewer" element={<VCFViewer />} />
              <Route path="/results" element={<Results />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Minimal Footer */}
          <footer className="py-8 border-t border-slate-200 bg-white mt-auto">
            <div className="max-w-7xl mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-medium text-slate-400 uppercase tracking-widest">
              <p>Developed by <span className="text-slate-900 font-bold">AI-TRONICS</span> for <span className="text-blue-600 font-bold">RIFT26 Hackathon</span></p>
              <div className="flex gap-8">
                <span className="text-slate-300 pointer-events-none">PharmaGuard v1.0</span>
              </div>
            </div>
          </footer>
        </div>
        <Toaster position="top-right" richColors closeButton />
      </Router>
    </FileProvider>
  );
}


export default App;


