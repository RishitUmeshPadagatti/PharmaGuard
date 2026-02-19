import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

load_dotenv()

DATA_FOLDER = "data"
PERSIST_DIRECTORY = "chroma_db"
COLLECTION_NAME = "cpic_guidelines"

VALID_GENES = [
    "CYP2C9",
    "CYP2C19",
    "CYP2D6",
    "SLCO1B1",
    "TPMT",
    "DPYD"
]

DRUG_KEYWORDS = {
    "CYP2C9": ["WARFARIN"],
    "CYP2C19": ["CLOPIDOGREL"],
    "CYP2D6": ["CODEINE"],
    "SLCO1B1": ["SIMVASTATIN"],
    "TPMT": ["AZATHIOPRINE", "MERCAPTOPURINE", "THIOGUANINE"],
    "DPYD": ["FLUOROURACIL", "CAPECITABINE"]
}


# -------------------------
# Helper Functions
# -------------------------

def detect_drug(gene, text):
    text_upper = text.upper()
    for drug in DRUG_KEYWORDS.get(gene, []):
        if drug in text_upper:
            return drug
    return "GENERAL"


def is_reference_chunk(text):
    text_lower = text.lower()
    reference_indicators = [
        "references",
        "et al.",
        "doi:",
        "pmid",
        "acknowledgments"
    ]
    return any(word in text_lower for word in reference_indicators)


def contains_dosing_signal(text):
    text_lower = text.lower()

    dosing_keywords = [
        "dose",
        "dosing",
        "initiate",
        "recommendation",
        "starting",
        "maintenance",
        "adjust",
        "reduce",
        "avoid",
        "metabolizer"
    ]

    return any(word in text_lower for word in dosing_keywords)


# -------------------------
# Load Documents
# -------------------------

def load_documents():
    documents = []

    for filename in os.listdir(DATA_FOLDER):
        if filename.endswith(".pdf"):

            gene = filename.replace(".pdf", "").upper()

            if gene not in VALID_GENES:
                continue

            loader = PyPDFLoader(os.path.join(DATA_FOLDER, filename))
            pages = loader.load()

            for page in pages:
                page.metadata["gene"] = gene
                page.metadata["source"] = filename

            documents.extend(pages)

    return documents


# -------------------------
# Build Index
# -------------------------

def build_index():

    print("Loading CPIC PDFs...")
    documents = load_documents()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500,
        chunk_overlap=200
    )

    chunks = splitter.split_documents(documents)

    print(f"Total chunks before filtering: {len(chunks)}")

    filtered_chunks = []

    for chunk in chunks:

        content = chunk.page_content

        # Remove references
        if is_reference_chunk(content):
            continue

        gene = chunk.metadata["gene"]
        drug = detect_drug(gene, content)

        # Keep only drug-related content
        if drug == "GENERAL":
            continue

        # Keep only dosing-related sections
        if not contains_dosing_signal(content):
            continue

        chunk.metadata["drug"] = drug
        filtered_chunks.append(chunk)

    print(f"Total chunks after filtering: {len(filtered_chunks)}")

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    vectorstore = Chroma(
        persist_directory=PERSIST_DIRECTORY,
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings
    )

    vectorstore.add_documents(filtered_chunks)

    print("✅ All CPIC dosing embeddings stored successfully.")


if __name__ == "__main__":
    build_index()
