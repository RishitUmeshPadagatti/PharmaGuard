from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from pydantic import BaseModel
import json
import httpx
from typing import Dict, Any, List, Optional
from rag.llm_layer import generate_clinical_response, process_patient_analysis
from rag.retrieve_test import get_retriever

app = FastAPI(title="PharmaGuard RAG API")

BACKEND_ANALYZE_URL = "http://localhost:8000/api/analyze"


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/")
def health():
    return {"status": "PharmaGuard RAG is running"}


# ---------------------------------------------------------------------------
# Single-gene endpoint (unchanged)
# ---------------------------------------------------------------------------

class ClinicalRequest(BaseModel):
    gene: str
    drug: str
    phenotype: str

@app.post("/analyze")
def analyze(request: ClinicalRequest):
    """Single gene/drug clinical recommendation from CPIC guidelines."""
    retriever = get_retriever(request.gene, request.drug, k=8)
    query = f"CPIC therapeutic recommendation for {request.drug} and {request.gene} phenotype"
    docs = retriever.invoke(query)
    result = generate_clinical_response(
        gene=request.gene,
        drug=request.drug,
        phenotype=request.phenotype,
        retrieved_docs=docs,
    )
    return {"result": result}


# ---------------------------------------------------------------------------
# POST /batch_analyze
# Accepts the full JSON response from Backend POST /api/analyze.
# Returns the same JSON enriched with CPIC clinical_recommendation per drug.
# ---------------------------------------------------------------------------

@app.post("/batch_analyze")
def batch_analyze(request: Dict[str, Any]):
    """
    INPUT  — Raw JSON body: the response from Backend POST /api/analyze.
    OUTPUT — Same JSON with clinical_recommendation injected into each drug.

    Example clinical_recommendation per drug:
    {
      "recommendation": "Avoid codeine; use non-opioid alternatives",
      "alternative_drugs": ["morphine", "oxycodone"],
      "dosing_guidance": "...",
      "monitoring": "...",
      "cpic_classification": "Strong"
    }
    """
    data = request

    # Fallback: profile may be nested inside a string or sub-dict
    if "pharmacogenomic_profile" not in data:
        for val in request.values():
            if isinstance(val, str) and "pharmacogenomic_profile" in val:
                try:
                    data = json.loads(val)
                    break
                except json.JSONDecodeError:
                    continue
            elif isinstance(val, dict) and "pharmacogenomic_profile" in val:
                data = val
                break

    if "pharmacogenomic_profile" not in data:
        raise HTTPException(
            status_code=422,
            detail="No pharmacogenomic_profile found. "
                   "Body must be the JSON response from POST /api/analyze.",
        )

    return process_patient_analysis(data)


# ---------------------------------------------------------------------------
# POST /full_analyze
# Accepts a VCF file + drug list — exactly like Backend POST /api/analyze —
# then internally calls the Backend to parse + score, and enriches the result
# with CPIC clinical_recommendation from the RAG system.
# ---------------------------------------------------------------------------

@app.post("/full_analyze")
async def full_analyze(
    vcf: UploadFile = File(..., description="Patient VCF file (.vcf)"),
    drug: str = Form(..., description="Comma-separated drug names, e.g. CODEINE,WARFARIN"),
):
    """
    INPUT  — multipart/form-data:
               vcf  : .vcf file (same as Backend)
               drug : comma-separated drug names (same as Backend)

    OUTPUT — Full analysis JSON with CPIC clinical_recommendation per drug.

    This endpoint:
    1. Forwards the VCF + drugs to Backend POST /api/analyze.
    2. Takes the pharmacogenomic profile + drug analysis response.
    3. Runs every drug through the RAG CPIC guideline retrieval + LLM.
    4. Returns the enriched response.
    """
    vcf_bytes = await vcf.read()

    # Step 1 — Forward to Backend
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                BACKEND_ANALYZE_URL,
                files={"vcf": (vcf.filename, vcf_bytes, "text/plain")},
                data={"drug": drug},
            )
            response.raise_for_status()
            backend_data = response.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Backend error {e.response.status_code}: {e.response.text}",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Could not reach Backend at {BACKEND_ANALYZE_URL}: {e}",
        )

    # Step 2 — Enrich with CPIC clinical_recommendation
    enriched = process_patient_analysis(backend_data)

    # Step 3 — Return ONLY clinical_recommendation per drug (no monitoring)
    return {
        drug_record["drug"]: {
            k: v
            for k, v in drug_record.get("clinical_recommendation", {}).items()
            if k != "monitoring"
        }
        for drug_record in enriched.get("drug_analysis", [])
    }


