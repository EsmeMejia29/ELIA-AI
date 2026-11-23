from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pypdf import PdfReader
from dotenv import load_dotenv
import requests
import time
import io
import os

load_dotenv()

app = FastAPI(title="ELIA - Asistente Jurídico")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("GEMINI_API_KEY", "")
MODELOS_RESPALDO = [
    "gemini-4-hydrogen",
    "gemini-3.5-flash-lite",
    "gemini-4-neon",
    "gemini-4-carbon",
    "gemini-3.8-flash",
    "gemini-flash-latest"
]

PROMPT_SISTEMA_GENERAL = """Eres ELIA, una asistente inteligente, amable y profesional creada para apoyar a una abogada en El Salvador.
Responde de forma natural, clara, directa y útil."""

PROMPT_SISTEMA_ESCRITOS = """Eres ELIA, abogada redactora especialista en derecho salvadoreño (civil, mercantil, notarial y administrativo).
Reglas obligatorias:
1. Redacta el documento completo de principio a fin con técnica jurídica formal de El Salvador:
   - Encabezado al tribunal o autoridad competente en mayúsculas.
   - Comparecencia del profesional o solicitante (usando marcadores como [NOMBRE DEL APODERADO], [GENERALES] donde falten datos).
   - Exposición ordenada de los hechos o subsanación numerada.
   - Fundamento de Derecho citando los artículos pertinentes de la legislación salvadoreña.
   - Petitorio claro (PIDE:).
   - Lugar y fecha en letras en San Salvador y espacio para firma y sello.
2. Nunca dejes el escrito incompleto ni cortado.
3. Si el usuario solo hace una pregunta conceptual en lugar de dar hechos de un caso, explícale qué es ese instrumento y qué datos necesita darte para redactarlo."""

def consultar_gemini(prompt_usuario: str, prompt_sistema: str) -> str:
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": API_KEY
    }
    payload = {
        "system_instruction": {
            "parts": [{"text": prompt_sistema}]
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt_usuario}]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 8192
        }
    }

    ultimo_error = ""
    for intento in range(2):
        for modelo in MODELOS_RESPALDO:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent"
            try:
                res = requests.post(url, headers=headers, json=payload, timeout=45)
                data = res.json()
                if res.status_code == 200:
                    candidatos = data.get("candidates", [])
                    if candidatos and "content" in candidatos[0]:
                        partes = candidatos[0]["content"].get("parts", [])
                        texto_completo = "".join(p.get("text", "") for p in partes)
                        if texto_completo.strip():
                            return texto_completo
                ultimo_error = f"[Error {res.status_code} en {modelo}]: {data.get('error', {}).get('message', str(data))}"
            except Exception as error:
                ultimo_error = f"[Error de conexión]: {str(error)}"
        time.sleep(1.5)

    return f"Los servidores de Google están temporalmente saturados. Haz clic en Regenerar en unos segundos.\nDetalle: {ultimo_error}"

@app.get("/")
def estado_servidor():
    return {
        "estado": "ELIA activa",
        "modelos": MODELOS_RESPALDO
    }

@app.post("/redactar", response_class=PlainTextResponse)
async def redactar_escrito(
    tipo_escrito: str = Form(...),
    hechos: str = Form(...)
):
    if tipo_escrito == "Consulta abierta / Idea libre":
        return consultar_gemini(hechos, PROMPT_SISTEMA_GENERAL)

    prompt = f"""Tipo de documento solicitado: {tipo_escrito}
Solicitud o hechos proporcionados por el usuario:
{hechos}"""
    return consultar_gemini(prompt, PROMPT_SISTEMA_ESCRITOS)

@app.post("/analizar-pdf", response_class=PlainTextResponse)
async def analizar_pdf(
    archivo: UploadFile = File(...),
    instruccion: str = Form("Extrae plazos, riesgos y pasos a seguir")
):
    contenido = await archivo.read()
    lector = PdfReader(io.BytesIO(contenido))
    texto_pdf = "\n".join([p.extract_text() or "" for p in lector.pages])[:30000]
    prompt = f"""Analiza este documento jurídico ({archivo.filename}).
Instrucción: {instruccion}
Organiza la respuesta en: Resumen, Plazos clave, Riesgos/Prevenciones y Recomendación práctica.

Texto del documento:
{texto_pdf}"""
    return consultar_gemini(prompt, PROMPT_SISTEMA_GENERAL)

@app.post("/consultar-leyes", response_class=PlainTextResponse)
async def consultar_leyes(pregunta: str = Form(...)):
    prompt = f"""Responde de forma clara, fundamentada en la legislación vigente de El Salvador y directa a esta consulta jurídica:
{pregunta}"""
    return consultar_gemini(prompt, PROMPT_SISTEMA_GENERAL)