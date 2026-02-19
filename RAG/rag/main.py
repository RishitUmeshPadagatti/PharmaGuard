from retrieve_test import get_retriever
from llm_layer import generate_clinical_response

if __name__ == "__main__":

    gene = "CYP2D6"
    drug = "CODEINE"
    phenotype = "Poor Metabolizer"

    retriever = get_retriever(gene, drug, k=8)

    query = f"""
    CPIC therapeutic recommendation table for {drug}
    based on {gene} phenotype.
    """

    docs = retriever.invoke(query)

    result = generate_clinical_response(gene, drug, phenotype, docs)

    print("\n============================")
    print("Final Clinical Output")
    print("============================\n")
    print(result)
