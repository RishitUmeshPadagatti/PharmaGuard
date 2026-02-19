from fastapi import FastAPI
from pydantic import BaseModel
import json
from typing import Dict, Any, List
from rag.llm_layer import generate_clinical_response, process_patient_analysis
from rag.retrieve_test import get_retriever

app = FastAPI(title="PharmaGuard RAG API")

class ClinicalRequest(BaseModel):
    gene: str
    drug: str
    phenotype: str

@app.get("/")
def health():
    return {"status": "PharmaGuard RAG is running"}

@app.post("/analyze")
def analyze(request: ClinicalRequest):
    # 1. Get retriever for specific gene/drug
    retriever = get_retriever(request.gene, request.drug, k=8)
    
    # 2. Build clinical query
    query = f"CPIC therapeutic recommendation for {request.drug} and {request.gene} phenotype"
    
    # 3. Retrieve docs
    docs = retriever.invoke(query)
    
    # 4. Generate response
    result = generate_clinical_response(
        gene=request.gene,
        drug=request.drug,
        phenotype=request.phenotype,
        retrieved_docs=docs
    )
    return {"result": result}

@app.post("/batch_analyze")
def batch_analyze(request: Dict[str, Any]):
    """
    Handles complex patient JSON input for multi-drug analysis.
    Supports:
    1. Direct JSON body.
    2. JSON string nested in 'additional_prompt' or any other field.
    3. Direct JSON object nested in any field.
    """
    data = request
    
    # If the top level doesn't have the key we need, look deeper
    if "pharmacogenomic_profile" not in data:
        for val in request.values():
            # Case 1: Value is a string that might be JSON
            if isinstance(val, str) and "pharmacogenomic_profile" in val:
                try:
                    data = json.loads(val)
                    break
                except json.JSONDecodeError:
                    continue
            # Case 2: Value is a dict that contains the profile
            elif isinstance(val, dict) and "pharmacogenomic_profile" in val:
                data = val
                break
                
    return process_patient_analysis(data)
