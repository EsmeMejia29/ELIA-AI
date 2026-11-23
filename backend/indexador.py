import os
import ollama
import chromadb
from pypdf import PdfReader

cliente_chroma = chromadb.PersistentClient(path="./db_vectorial")
coleccion = cliente_chroma.get_or_create_collection(name="biblioteca_juridica")

def extraer_texto_pdf(ruta_pdf):
    lector = PdfReader(ruta_pdf)
    paginas = []
    for num, pagina in enumerate(lector.pages):
        texto = pagina.extract_text()
        if texto:
            paginas.append((num + 1, texto))
    return paginas

def indexar_documentos():
    carpeta = "./leyes_y_formatos"
    os.makedirs(carpeta, exist_ok=True)
    for archivo in os.listdir(carpeta):
        if archivo.endswith(".pdf"):
            ruta = os.path.join(carpeta, archivo)
            print(f"Indexando {archivo}...")
            paginas = extraer_texto_pdf(ruta)
            for num_pag, texto in paginas:
                fragmentos = [texto[i:i+1000] for i in range(0, len(texto), 850)]
                for idx, frag in enumerate(fragmentos):
                    respuesta = ollama.embeddings(model="nomic-embed-text", prompt=frag)
                    doc_id = f"{archivo}_p{num_pag}_f{idx}"
                    coleccion.upsert(
                        ids=[doc_id],
                        embeddings=[respuesta["embedding"]],
                        documents=[frag],
                        metadatas=[{"fuente": archivo, "pagina": num_pag}]
                    )
    print("Base de conocimiento jurídica actualizada.")

if __name__ == "__main__":
    indexar_documentos()