import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from rag.retrieve_test import get_retriever

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")


def generate_clinical_response(gene, drug, phenotype, retrieved_docs):

    context = "\n\n".join([doc.page_content for doc in retrieved_docs])

    prompt = f"""
You are a clinical pharmacogenomics assistant.

Use ONLY the provided CPIC guideline context.
Do NOT use external knowledge.
Do NOT hallucinate.
If information is missing, return null for that field.

Gene: {gene}
Drug: {drug}
Patient Phenotype: {phenotype}

CPIC Context:
{context}

Return STRICT JSON ONLY.
Do not include explanations outside JSON.
Do not include numbering.
Do not include markdown.

Output format:

{{
  "dosing_requirements": ""
}}

"""

    response = model.generate_content(prompt)

    try:
        # Clean response text in case of markdown blocks
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:-3].strip()
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:-3].strip()
        
        return json.loads(raw_text)
    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        return {"dosing_requirements": "Error generating recommendation"}


def process_patient_analysis(patient_data):
    """
    Processes the complex patient JSON and returns dosing requirements for all drugs.
    """
    profile = patient_data.get("pharmacogenomic_profile", {}).get("genes", [])
    drug_analysis = patient_data.get("drug_analysis", [])
    
    # Create a map of gene to phenotype
    gene_map = {item["gene"]: item["phenotype"] for item in profile}
    
    # Gene to Drug mapping (synchronized with ingest.py)
    drug_to_gene_map = {
        "CODEINE": "CYP2D6",
        "CLOPIDOGREL": "CYP2C19",
        "WARFARIN": "CYP2C9",
        "SIMVASTATIN": "SLCO1B1",
        "AZATHIOPRINE": "TPMT",
        "MERCAPTOPURINE": "TPMT",
        "THIOGUANINE": "TPMT",
        "FLUOROURACIL": "DPYD",
        "CAPECITABINE": "DPYD"
    }

    results = []

    for drug_record in drug_analysis:
        drug_name = drug_record.get("drug", "").upper()
        gene_name = drug_to_gene_map.get(drug_name)
        
        if not gene_name:
            results.append({
                "drug": drug_name,
                "dosing_requirements": "Gene mapping not found for this drug"
            })
            continue
            
        phenotype = gene_map.get(gene_name)
        if not phenotype:
            results.append({
                "drug": drug_name,
                "dosing_requirements": f"Phenotype for {gene_name} not found in patient profile"
            })
            continue

        # 1. Retrieve guidelines
        retriever = get_retriever(gene_name, drug_name, k=8)
        query = f"CPIC therapeutic recommendation for {drug_name} and {gene_name} {phenotype}"
        docs = retriever.invoke(query)

        # 2. Generate clinicial response
        analysis = generate_clinical_response(gene_name, drug_name, phenotype, docs)
        
        results.append({
            "drug": drug_name,
            "dosing_requirements": analysis.get("dosing_requirements")
        })

    return {"dosing_requirements": results}
