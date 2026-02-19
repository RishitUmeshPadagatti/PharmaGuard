from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

PERSIST_DIRECTORY = "chroma_db"
COLLECTION_NAME = "cpic_guidelines"


def get_retriever(gene: str, drug: str, k: int = 10):

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    vectorstore = Chroma(
        persist_directory=PERSIST_DIRECTORY,
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings
    )

    retriever = vectorstore.as_retriever(
        search_kwargs={
            "k": k,
            "filter": {
                "$and": [
                    {"gene": gene.upper()},
                    {"drug": drug.upper()}
                ]
            }
        }
    )

    return retriever


if __name__ == "__main__":

    # 🔥 Change these two values to test each PDF
    gene = "DPYD"
    drug = "FLUOROURACIL"

    retriever = get_retriever(gene, drug)

    query = f"""
    CPIC therapeutic recommendation table
    for {drug} based on {gene} phenotype.
    Specifically what to do for poor metabolizers.
    """

    docs = retriever.invoke(query)

    print("\n============================")
    print("Retrieved Results")
    print("============================\n")

    if not docs:
        print("❌ No results found.")
    else:
        for i, doc in enumerate(docs):
            print(f"Result {i+1}")
            print("Gene:", doc.metadata.get("gene"))
            print("Drug:", doc.metadata.get("drug"))
            print("Source:", doc.metadata.get("source"))
            print("\nContent Preview:\n")
            print(doc.page_content[:1000])
            print("\n--------------------------------------\n")
