from dotenv import load_dotenv
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma

# Load environment variables
load_dotenv()

PERSIST_DIRECTORY = "chroma_db"
COLLECTION_NAME = "cpic_guidelines"

embeddings = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-001"
)

vectorstore = Chroma(
    persist_directory=PERSIST_DIRECTORY,
    collection_name="cpic_guidelines",
    embedding_function=embeddings
)

collection = vectorstore._collection

count = collection.count()

print(f"Total embeddings stored in ChromaDB: {count}")
