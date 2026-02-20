# 🧬 PharmaGuard  
## Pharmacogenomic Risk Prediction System  
### RIFT 2026 – Pharmacogenomics / Explainable AI Track  

🚀 PharmaGuard is an AI-powered precision medicine platform that analyzes patient genetic data (VCF files) and generates CPIC-aligned pharmacogenomic risk predictions with explainable clinical recommendations.

---

## 🌍 Live Demo

- 🔗 **Live Application URL:** [Add Deployment Link Here]
- 🎥 **LinkedIn Demo Video:** [Add LinkedIn Video Link Here]
- 📂 **GitHub Repository:** [Add Repo Link Here]

---

## 📌 Problem Overview

Adverse Drug Reactions (ADRs) cause over 100,000 preventable deaths annually. Many of these are linked to genetic variations affecting drug metabolism.

PharmaGuard enables genotype-guided prescribing by:
- Parsing authentic VCF genomic data
- Identifying pharmacogenomic variants
- Predicting drug-specific risks
- Providing CPIC-aligned dosing recommendations
- Generating explainable AI-powered clinical insights

---

# 🎯 Core Features

✅ VCF (v4.2) file parsing  
✅ Detection of 6 critical pharmacogenes  
✅ Diplotype & phenotype inference (PM, IM, NM, RM, URM)  
✅ Drug-specific risk prediction  
✅ CPIC-aligned dosing recommendations  
✅ Retrieval-Augmented Generation (RAG)  
✅ Structured JSON output (schema compliant)  
✅ Secure Raspberry Pi edge deployment  

---

# 🧬 Supported Pharmacogenes

- CYP2D6  
- CYP2C19  
- CYP2C9  
- SLCO1B1  
- TPMT  
- DPYD  

---

# 💊 Supported Drugs

- CODEINE  
- WARFARIN  
- CLOPIDOGREL  
- SIMVASTATIN  
- AZATHIOPRINE  
- FLUOROURACIL  

(Multi-drug input supported)

---

# 🏗️ System Architecture

VCF Upload
↓
Variant Parser
↓
Gene Mapping & Diplotype Detection
↓
Phenotype Inference
↓
Risk Classification Engine
↓
RAG (CPIC Knowledge Retrieval)
↓
LLM Clinical Explanation
↓
Structured JSON Output


---

# 📚 RAG-Based CPIC Recommendation Engine

PharmaGuard integrates Retrieval-Augmented Generation (RAG) to ensure medically reliable outputs:

1. CPIC guidelines are embedded into a vector database.
2. Relevant sections are retrieved per gene–drug–phenotype query.
3. The LLM generates recommendations strictly from retrieved context.
4. If data is unavailable →  
   `"Not specified in CPIC context."`

This ensures:
- Evidence-grounded outputs
- Reduced hallucination risk
- Clinical alignment

---

# 📦 JSON Output Schema

The application produces structured JSON output:

```json
{
  "patient_id": "PATIENT_XXX",
  "drug": "DRUG_NAME",
  "timestamp": "ISO8601_timestamp",
  "risk_assessment": {
    "risk_label": "Safe | Adjust Dosage | Toxic | Ineffective | Unknown",
    "confidence_score": 0.0,
    "severity": "none | low | moderate | high | critical"
  },
  "pharmacogenomic_profile": {
    "primary_gene": "GENE_SYMBOL",
    "diplotype": "*X/*Y",
    "phenotype": "PM | IM | NM | RM | URM | Unknown",
    "detected_variants": []
  },
  "clinical_recommendation": {},
  "llm_generated_explanation": {},
  "quality_metrics": {}
}
🌐 Web Application Features
🔹 File Upload
Drag & drop VCF upload

File size validation (≤5MB)

Format validation

🔹 Drug Input
Single or comma-separated drugs

Input validation

🔹 Results Display
🟢 Safe

🟡 Adjust Dosage

🔴 Toxic / Ineffective

Expandable explanation sections

Downloadable JSON

Copy-to-clipboard

🔹 Error Handling
Invalid VCF detection

Missing annotations handling

Clear user feedback

🔐 Secure Edge Deployment (Raspberry Pi)
PharmaGuard is deployed on a Raspberry Pi device to ensure:

Local processing of sensitive genomic data

Reduced cloud exposure risk

Suitability for hospital/lab environments

Portable precision medicine solution

This demonstrates real-world healthcare feasibility beyond a prototype.

🛠️ Tech Stack
Backend
Python

FastAPI

LangChain

Vector Database (Chroma / FAISS)

Frontend
HTML / CSS / JavaScript

AI Components
Retrieval-Augmented Generation (RAG)

CPIC guideline embeddings

Structured prompt engineering

Deployment
Raspberry Pi (Edge)

Cloud Hosting (Render / Vercel / etc.)

🚀 Installation Guide
1️⃣ Clone Repository
git clone https://github.com/your-username/pharmaguard.git
cd pharmaguard
2️⃣ Create Virtual Environment
python -m venv venv
source venv/bin/activate      # Mac/Linux
venv\Scripts\activate         # Windows
3️⃣ Install Dependencies
pip install -r requirements.txt
4️⃣ Setup Environment Variables
Create a .env file:

LLM_API_KEY=your_api_key_here
5️⃣ Run Application
uvicorn main:app --reload
Open:

http://127.0.0.1:8000
📖 API Documentation
POST /analyze
Input:

VCF file

Drug name(s)

Output:

Structured pharmacogenomic risk JSON

🧠 Innovation Highlights
Strict CPIC-grounded RAG pipeline

Zero-hallucination medical AI strategy

Automated genotype-to-phenotype mapping

Explainable clinical reasoning

Edge deployment for genomic privacy

Fully schema-compliant structured output

🏥 Clinical Impact
PharmaGuard supports:

Genotype-guided prescribing

Reduced adverse drug reactions

AI-assisted clinical decision support

Transparent and explainable pharmacogenomics

👥 Team
Team Name: AI Tronix
Hackathon: RIFT 2026
Track: Pharmacogenomics / Explainable AI
