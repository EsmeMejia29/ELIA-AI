"use client";

import React, { useState, useRef, useEffect } from "react";
import { Lora, Plus_Jakarta_Sans } from "next/font/google";
import {
    Scale,
    FilePenLine,
    FileCheck2,
    BookMarked,
    ArrowUp,
    Copy,
    Check,
    UploadCloud,
    Download,
    Plus,
    MessageSquare,
    Trash2,
    RotateCw,
    ChevronDown,
    FileSpreadsheet
} from "lucide-react";

const lora = Lora({
    subsets: ["latin"],
    weight: ["500", "600"]
});

const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
});

type ModoTrabajo = "redactar" | "analizar" | "consultar";

interface CampoDato {
    etiquetaCorta: string;
    prefijoTexto: string;
}

interface ConfigDocumento {
    nombre: string;
    resumen: string;
    campos: CampoDato[];
    placeholder: string;
}

const CATALOGO_DOCUMENTOS: ConfigDocumento[] = [
    {
        nombre: "Subsanación de prevenciones",
        resumen: "Respuesta puntual a observaciones de un juzgado o institución",
        campos: [
            { etiquetaCorta: "Juzgado", prefijoTexto: "Juzgado / Tribunal: " },
            { etiquetaCorta: "Referencia", prefijoTexto: "Referencia del expediente: " },
            { etiquetaCorta: "Apoderado y cliente", prefijoTexto: "Apoderado y representado: " },
            { etiquetaCorta: "Prevenciones", prefijoTexto: "Detalle de prevenciones y subsanación: " },
            { etiquetaCorta: "Anexos", prefijoTexto: "Documentos que se adjuntan: " }
        ],
        placeholder: "Ej. Juzgado Cuarto de lo Civil y Mercantil, Ref. 26-DV-83. Prevención 1: acreditar último domicilio con partida de defunción..."
    },
    {
        nombre: "Demanda civil o mercantil",
        resumen: "Escrito inicial de pretensión conforme al CPCM",
        campos: [
            { etiquetaCorta: "Juzgado", prefijoTexto: "Juzgado competente: " },
            { etiquetaCorta: "Demandante", prefijoTexto: "Demandante y apoderado: " },
            { etiquetaCorta: "Demandado", prefijoTexto: "Demandado y dirección de emplazamiento: " },
            { etiquetaCorta: "Hechos", prefijoTexto: "Hechos cronológicos: " },
            { etiquetaCorta: "Pretensión y cuantía", prefijoTexto: "Monto o pretensión exacta: " },
            { etiquetaCorta: "Pruebas", prefijoTexto: "Documentos probatorios: " }
        ],
        placeholder: "Ej. Demanda ejecutiva mercantil por pagaré vencido de $5,000 contra Juan Pérez, domicilio San Salvador..."
    },
    {
        nombre: "Contestación de demanda",
        resumen: "Oposición, excepciones y defensa técnica frente a demanda",
        campos: [
            { etiquetaCorta: "Juzgado y Ref.", prefijoTexto: "Juzgado y Referencia: " },
            { etiquetaCorta: "Demandado", prefijoTexto: "Demandado y apoderado: " },
            { etiquetaCorta: "Sobre los hechos", prefijoTexto: "Pronunciamiento sobre los hechos: " },
            { etiquetaCorta: "Excepciones", prefijoTexto: "Excepciones o defensa legal: " },
            { etiquetaCorta: "Pruebas", prefijoTexto: "Pruebas que se ofrecen: " }
        ],
        placeholder: "Ej. Contestación en sentido negativo dentro del plazo de 20 días hábiles, alegando excepción de pago parcial..."
    },
    {
        nombre: "Solicitud administrativa",
        resumen: "Peticiones y recursos ante ministerios, alcaldías o registros",
        campos: [
            { etiquetaCorta: "Institución", prefijoTexto: "Institución / Funcionario: " },
            { etiquetaCorta: "Solicitante", prefijoTexto: "Solicitante (y calidad en que actúa): " },
            { etiquetaCorta: "Antecedentes", prefijoTexto: "Antecedentes del trámite: " },
            { etiquetaCorta: "Petición", prefijoTexto: "Petición concreta: " },
            { etiquetaCorta: "Notificaciones", prefijoTexto: "Medio para notificaciones: " }
        ],
        placeholder: "Ej. Solicitud al Ministerio de Agricultura para certificación de cartas de venta emitidas en 2019..."
    },
    {
        nombre: "Contrato privado / compraventa",
        resumen: "Acuerdos bilaterales, mutuos, arrendamientos o compraventas",
        campos: [
            { etiquetaCorta: "Parte A (Vendedor)", prefijoTexto: "Parte A (Nombre, edad, profesión, domicilio, DUI): " },
            { etiquetaCorta: "Parte B (Comprador)", prefijoTexto: "Parte B (Nombre, edad, profesión, domicilio, DUI): " },
            { etiquetaCorta: "Bien u objeto", prefijoTexto: "Bien u objeto del contrato: " },
            { etiquetaCorta: "Precio y pago", prefijoTexto: "Precio y forma de pago: " },
            { etiquetaCorta: "Cláusulas", prefijoTexto: "Cláusulas especiales: " }
        ],
        placeholder: "Ej. Compraventa de vehículo placas P-123456, año 2020, por $8,500 pagados de contado en Santa Tecla..."
    },
    {
        nombre: "Acta o escritura notarial",
        resumen: "Instrumentos protocolares, declaraciones juradas o auténticas",
        campos: [
            { etiquetaCorta: "Notario", prefijoTexto: "Notario autorizante y domicilio: " },
            { etiquetaCorta: "Lugar y fecha", prefijoTexto: "Lugar, hora y fecha: " },
            { etiquetaCorta: "Comparecientes", prefijoTexto: "Compareciente(s) con generales completas: " },
            { etiquetaCorta: "Acto o declaración", prefijoTexto: "Objeto del acto o declaración: " },
            { etiquetaCorta: "Documentos a la vista", prefijoTexto: "Documentos que el notario da fe de tener a la vista: " }
        ],
        placeholder: "Ej. Declaración jurada ante los oficios del notario Ernesto Ramírez en San Salvador sobre posesión material..."
    },
    {
        nombre: "Consulta abierta / Idea libre",
        resumen: "Preguntas libres, análisis rápido o lluvias de ideas sin molde judicial",
        campos: [],
        placeholder: "Escribe cualquier consulta, idea de contenido o duda rápida..."
    }
];

interface Mensaje {
    id: string;
    rol: "usuario" | "elia";
    contenido: string;
    titulo?: string;
    hora: string;
    promptOrigen?: string;
    modoOrigen?: ModoTrabajo;
    tipoEscritoOrigen?: string;
}

interface SesionChat {
    id: string;
    titulo: string;
    fecha: string;
    mensajes: Mensaje[];
}

export default function EliaStudio() {
    const [modo, setModo] = useState<ModoTrabajo>("redactar");
    const [cargando, setCargando] = useState(false);
    const [regenerandoId, setRegenerandoId] = useState<string | null>(null);
    const [sesiones, setSesiones] = useState<SesionChat[]>([]);
    const [sesionActivaId, setSesionActivaId] = useState<string | null>(null);
    const [copiadoId, setCopiadoId] = useState<string | null>(null);

    const [tipoEscrito, setTipoEscrito] = useState("Subsanación de prevenciones");
    const [menuDocAbierto, setMenuDocAbierto] = useState(false);
    const [textoInput, setTextoInput] = useState("");
    const [archivoPdf, setArchivoPdf] = useState<File | null>(null);

    const finalRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const docSeleccionado =
        CATALOGO_DOCUMENTOS.find((d) => d.nombre === tipoEscrito) || CATALOGO_DOCUMENTOS[0];

    useEffect(() => {
        const cerrarAlClickFuera = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setMenuDocAbierto(false);
            }
        };
        document.addEventListener("mousedown", cerrarAlClickFuera);
        return () => document.removeEventListener("mousedown", cerrarAlClickFuera);
    }, []);

    useEffect(() => {
        const guardadas = localStorage.getItem("elia_historial_chats");
        if (guardadas) {
            try {
                const parsed: SesionChat[] = JSON.parse(guardadas);
                setSesiones(parsed);
            } catch {
                localStorage.removeItem("elia_historial_chats");
            }
        }
    }, []);

    useEffect(() => {
        if (sesiones.length > 0) {
            localStorage.setItem("elia_historial_chats", JSON.stringify(sesiones));
        } else {
            localStorage.removeItem("elia_historial_chats");
        }
    }, [sesiones]);

    const sesionActual = sesiones.find((s) => s.id === sesionActivaId);
    const mensajes = sesionActual ? sesionActual.mensajes : [];

    useEffect(() => {
        finalRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensajes.length, cargando]);

    const horaActual = () => {
        return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const insertarCampo = (prefijo: string) => {
        setTextoInput((prev) => {
            const limpio = prev.trimEnd();
            return limpio ? `${limpio}\n${prefijo}` : prefijo;
        });
        textareaRef.current?.focus();
    };

    const insertarTodosLosCampos = () => {
        const ficha = docSeleccionado.campos.map((c) => c.prefijoTexto).join("\n");
        setTextoInput(ficha);
        textareaRef.current?.focus();
    };

    const crearNuevoChat = () => {
        setSesionActivaId(null);
        setTextoInput("");
        setArchivoPdf(null);
        setCargando(false);
        setRegenerandoId(null);
    };

    const eliminarChat = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSesiones((prev) => prev.filter((s) => s.id !== id));
        if (sesionActivaId === id) {
            setSesionActivaId(null);
        }
    };

    const ejecutarPeticion = async (
        idObjetivo: string,
        respuestaId: string,
        modoExec: ModoTrabajo,
        textoExec: string,
        tipoEscritoExec: string,
        pdfExec: File | null
    ) => {
        try {
            let ruta = "/redactar";
            const formData = new FormData();

            if (modoExec === "redactar") {
                ruta = "/redactar";
                formData.append("tipo_escrito", tipoEscritoExec);
                formData.append("hechos", textoExec);
            } else if (modoExec === "analizar" && pdfExec) {
                ruta = "/analizar-pdf";
                formData.append("archivo", pdfExec);
                formData.append(
                    "instruccion",
                    textoExec || "Extrae plazos procesales, riesgos jurídicos, puntos clave y sugiere cómo proceder."
                );
            } else {
                ruta = "/consultar-leyes";
                formData.append("pregunta", textoExec);
            }

            const res = await fetch(`${API_URL}${ruta}`, {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                throw new Error("Error en la respuesta del servidor");
            }

            const textoRespuesta = await res.text();

            setSesiones((prev) =>
                prev.map((s) =>
                    s.id === idObjetivo
                        ? {
                              ...s,
                              mensajes: s.mensajes.map((m) =>
                                  m.id === respuestaId
                                      ? { ...m, contenido: textoRespuesta, hora: horaActual() }
                                      : m
                              )
                          }
                        : s
                )
            );
        } catch {
            setSesiones((prev) =>
                prev.map((s) =>
                    s.id === idObjetivo
                        ? {
                              ...s,
                              mensajes: s.mensajes.map((m) =>
                                  m.id === respuestaId
                                      ? {
                                            ...m,
                                            contenido:
                                                "Hubo un error al conectar con ELIA. Verifica que el backend esté encendido en el puerto 8000."
                                        }
                                      : m
                              )
                          }
                        : s
                )
            );
        } finally {
            setCargando(false);
            setRegenerandoId(null);
        }
    };

    const enviar = async (textoPredefinido?: string) => {
        const texto = (textoPredefinido ?? textoInput).trim();
        if (modo !== "analizar" && !texto) return;
        if (modo === "analizar" && !archivoPdf) return;

        let tituloUsuario = "Redacción de escrito";
        let cuerpoUsuario = texto;

        if (modo === "redactar") {
            tituloUsuario = tipoEscrito;
        } else if (modo === "analizar") {
            tituloUsuario = `PDF: ${archivoPdf?.name}`;
            cuerpoUsuario = texto || "Revisar plazos, prevenciones y riesgos del documento.";
        } else {
            tituloUsuario = "Consulta de leyes";
        }

        const nuevoMsgUsuario: Mensaje = {
            id: Date.now().toString(),
            rol: "usuario",
            contenido: cuerpoUsuario,
            titulo: tituloUsuario,
            hora: horaActual()
        };

        const respuestaId = (Date.now() + 1).toString();
        const respuestaInicial: Mensaje = {
            id: respuestaId,
            rol: "elia",
            contenido: "",
            titulo: modo === "redactar" ? `Borrador · ${tipoEscrito}` : "Respuesta de ELIA",
            hora: horaActual(),
            promptOrigen: texto,
            modoOrigen: modo,
            tipoEscritoOrigen: tipoEscrito
        };

        let idObjetivo = sesionActivaId;

        if (!idObjetivo) {
            idObjetivo = Date.now().toString();
            const tituloChat =
                modo === "analizar" && archivoPdf
                    ? archivoPdf.name.replace(/\.pdf$/i, "")
                    : texto.slice(0, 42) + (texto.length > 42 ? "..." : "");

            const nuevaSesion: SesionChat = {
                id: idObjetivo,
                titulo: tituloChat,
                fecha: new Date().toLocaleDateString([], { day: "2-digit", month: "short" }),
                mensajes: [nuevoMsgUsuario, respuestaInicial]
            };

            setSesiones((prev) => [nuevaSesion, ...prev]);
            setSesionActivaId(idObjetivo);
        } else {
            setSesiones((prev) =>
                prev.map((s) =>
                    s.id === idObjetivo
                        ? { ...s, mensajes: [...s.mensajes, nuevoMsgUsuario, respuestaInicial] }
                        : s
                )
            );
        }

        const pdfActual = archivoPdf;
        setTextoInput("");
        setCargando(true);

        await ejecutarPeticion(
            idObjetivo,
            respuestaId,
            modo,
            texto,
            tipoEscrito,
            pdfActual
        );

        if (modo === "analizar") {
            setArchivoPdf(null);
        }
    };

    const regenerarRespuesta = async (msgElia: Mensaje) => {
        if (cargando || regenerandoId || !sesionActivaId || !msgElia.promptOrigen) return;

        const modoRegen = msgElia.modoOrigen || modo;
        const tipoRegen = msgElia.tipoEscritoOrigen || tipoEscrito;

        if (modoRegen === "analizar") {
            setTextoInput(msgElia.promptOrigen);
            setModo("analizar");
            return;
        }

        setRegenerandoId(msgElia.id);
        setSesiones((prev) =>
            prev.map((s) =>
                s.id === sesionActivaId
                    ? {
                          ...s,
                          mensajes: s.mensajes.map((m) =>
                              m.id === msgElia.id
                                  ? { ...m, contenido: "", hora: horaActual() }
                                  : m
                          )
                      }
                    : s
            )
        );

        await ejecutarPeticion(
            sesionActivaId,
            msgElia.id,
            modoRegen,
            msgElia.promptOrigen,
            tipoRegen,
            null
        );
    };

    const copiar = (id: string, texto: string) => {
        navigator.clipboard.writeText(texto);
        setCopiadoId(id);
        setTimeout(() => setCopiadoId(null), 2000);
    };

    const descargar = (texto: string) => {
        const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ELIA_${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const ejemplosRapidos: Record<ModoTrabajo, { etiqueta: string; descripcion: string }[]> = {
        redactar: [
            {
                etiqueta: "Subsanar prevención",
                descripcion: "Subsanación de prevención acreditando el último domicilio del causante en San Salvador."
            },
            {
                etiqueta: "Contrato de compraventa",
                descripcion: "Contrato privado de compraventa de vehículo automotor con cláusula de saneamiento."
            },
            {
                etiqueta: "Solicitud administrativa",
                descripcion: "Solicitud dirigida al Ministerio de Agricultura para certificación de cartas de venta."
            }
        ],
        analizar: [
            {
                etiqueta: "Buscar plazos y riesgos",
                descripcion: "Indícame qué plazos vencen, qué prevenciones hacen y cómo debo responder este PDF."
            },
            {
                etiqueta: "Resumir resolución",
                descripcion: "Hazme un resumen claro de los hechos y lo que ordena el juez en este documento."
            }
        ],
        consultar: [
            {
                etiqueta: "Plazo de apelación",
                descripcion: "¿Cuál es el plazo y fundamento legal para apelar en materia civil en El Salvador?"
            },
            {
                etiqueta: "Requisitos de escritura",
                descripcion: "¿Qué requisitos exige la Ley de Notariado para la validez de una escritura pública?"
            }
        ]
    };

    const puedeEnviar = !cargando && !regenerandoId && (modo === "analizar" ? Boolean(archivoPdf) : textoInput.trim().length > 0);

    return (
        <div className={`${jakarta.className} flex h-screen bg-[#0F131C] text-[#EAECEF] overflow-hidden selection:bg-[#C5A059]/30 selection:text-white`}>
            <aside className="w-68 bg-[#0A0D14] border-r border-white/[0.06] flex flex-col justify-between p-4 shrink-0">
                <div className="flex flex-col flex-1 min-h-0 space-y-5">
                    <div className="flex items-center gap-3 px-2 pt-1">
                        <div className="h-9 w-9 rounded-lg bg-[#151D2E] flex items-center justify-center">
                            <Scale className="h-4 w-4 text-[#D4B475]" />
                        </div>
                        <div>
                            <span className={`${lora.className} text-lg font-semibold tracking-wide text-white block leading-none`}>
                                ELIA
                            </span>
                            <span className="text-[11px] text-slate-400 mt-1 block">
                                Asistente Legal
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={crearNuevoChat}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#161D2C] hover:bg-[#1E273B] text-sm font-medium text-white transition cursor-pointer"
                    >
                        <Plus className="h-4 w-4 text-[#D4B475]" />
                        <span>Nuevo chat</span>
                    </button>

                    <div className="flex-1 flex flex-col min-h-0">
                        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Historial de chats
                        </p>

                        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                            {sesiones.length === 0 ? (
                                <p className="px-2 py-4 text-xs text-slate-500 leading-relaxed">
                                    Tus escritos y consultas aparecerán guardados aquí automáticamente.
                                </p>
                            ) : (
                                sesiones.map((sesion) => {
                                    const activa = sesion.id === sesionActivaId;
                                    return (
                                        <div
                                            key={sesion.id}
                                            onClick={() => setSesionActivaId(sesion.id)}
                                            className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs transition cursor-pointer ${
                                                activa
                                                    ? "bg-[#1A2234] text-white font-medium"
                                                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${activa ? "text-[#D4B475]" : "text-slate-500"}`} />
                                                <span className="truncate">{sesion.titulo}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => eliminarChat(e, sesion.id)}
                                                title="Eliminar chat"
                                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/[0.06] pt-3.5 px-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Gemini 4 · Activo</span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Listo
                    </span>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 bg-[#0F131C]">
                <header className="h-16 border-b border-white/[0.06] px-6 flex items-center justify-between gap-4 shrink-0">
                    <div className="flex bg-[#0A0D14] p-1 rounded-full">
                        <button
                            type="button"
                            onClick={() => setModo("redactar")}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                                modo === "redactar"
                                    ? "bg-[#1E273B] text-white font-semibold"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <FilePenLine className="h-3.5 w-3.5 text-[#D4B475]" />
                            Redactar escrito
                        </button>

                        <button
                            type="button"
                            onClick={() => setModo("analizar")}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                                modo === "analizar"
                                    ? "bg-[#1E273B] text-white font-semibold"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <FileCheck2 className="h-3.5 w-3.5 text-[#D4B475]" />
                            Revisar PDF
                        </button>

                        <button
                            type="button"
                            onClick={() => setModo("consultar")}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                                modo === "consultar"
                                    ? "bg-[#1E273B] text-white font-semibold"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <BookMarked className="h-3.5 w-3.5 text-[#D4B475]" />
                            Consultar leyes
                        </button>
                    </div>

                    <span className="text-xs text-slate-500 hidden md:block">
                        Respuesta instantánea · El Salvador
                    </span>
                </header>

                <main className="flex-1 overflow-y-auto px-6 py-8">
                    <div className="max-w-3xl mx-auto">
                        {mensajes.length === 0 ? (
                            <div className="py-10 space-y-10">
                                <div className="space-y-3 text-center max-w-xl mx-auto">
                                    <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D4B475]">
                                        {modo === "redactar" && "Paso 1: Elige el escrito · Paso 2: Completa los datos clave"}
                                        {modo === "analizar" && "Paso 1: Sube tu PDF · Paso 2: Dime qué revisar"}
                                        {modo === "consultar" && "Consulta artículos, plazos y normativa vigente"}
                                    </span>
                                    <h1 className={`${lora.className} text-3xl sm:text-4xl font-semibold text-white leading-tight`}>
                                        {modo === "redactar" && "¿Qué documento legal necesitas redactar hoy?"}
                                        {modo === "analizar" && "Sube una resolución o contrato para revisarlo"}
                                        {modo === "consultar" && "¿Qué duda tienes sobre la legislación?"}
                                    </h1>
                                    <p className="text-sm text-slate-400">
                                        Escribe directamente abajo o prueba con uno de estos ejemplos rápidos:
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                                    {ejemplosRapidos[modo].map((ejemplo, i) => (
                                        <button
                                            type="button"
                                            key={i}
                                            onClick={() => {
                                                if (modo === "analizar") {
                                                    setTextoInput(ejemplo.descripcion);
                                                } else {
                                                    enviar(ejemplo.descripcion);
                                                }
                                            }}
                                            className="text-left p-5 rounded-2xl bg-[#151A26] hover:bg-[#1B2232] transition flex flex-col justify-between gap-3 cursor-pointer"
                                        >
                                            <span className="text-xs font-semibold text-[#D4B475]">
                                                {ejemplo.etiqueta}
                                            </span>
                                            <p className="text-xs text-slate-300 leading-relaxed">
                                                {ejemplo.descripcion}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 pb-4">
                                {mensajes.map((m) => {
                                    const estaRegenerandoEste = regenerandoId === m.id;
                                    return (
                                        <div key={m.id}>
                                            {m.rol === "usuario" ? (
                                                <div className="ml-auto max-w-2xl rounded-2xl bg-[#1B2436] text-white px-5 py-4 space-y-1">
                                                    <div className="flex items-center justify-between text-[11px] text-[#D4B475]">
                                                        <span className="font-semibold uppercase tracking-wider">{m.titulo}</span>
                                                        <span className="text-slate-400">{m.hora}</span>
                                                    </div>
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-100">
                                                        {m.contenido}
                                                    </p>
                                                </div>
                                            ) : (
                                                <article className="rounded-2xl bg-[#151A26] p-6 sm:p-8 space-y-5">
                                                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <Scale className="h-4 w-4 text-[#D4B475]" />
                                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                                                                {m.titulo}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-slate-500">{m.hora}</span>
                                                    </div>

                                                    <div className={`${lora.className} whitespace-pre-wrap text-[16px] leading-[1.85] text-slate-200`}>
                                                        {m.contenido || "Redactando respuesta completa..."}
                                                    </div>

                                                    {m.contenido && (
                                                        <div className="pt-2 flex flex-wrap items-center gap-2.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => copiar(m.id, m.contenido)}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-medium transition cursor-pointer"
                                                            >
                                                                {copiadoId === m.id ? (
                                                                    <>
                                                                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                                                                        Copiado
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Copy className="h-3.5 w-3.5" />
                                                                        Copiar texto
                                                                    </>
                                                                )}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => descargar(m.contenido)}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-medium transition cursor-pointer"
                                                            >
                                                                <Download className="h-3.5 w-3.5" />
                                                                Descargar .txt
                                                            </button>

                                                            {m.promptOrigen && (
                                                                <button
                                                                    type="button"
                                                                    disabled={cargando || Boolean(regenerandoId)}
                                                                    onClick={() => regenerarRespuesta(m)}
                                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-40 text-slate-200 text-xs font-medium transition cursor-pointer"
                                                                >
                                                                    <RotateCw className={`h-3.5 w-3.5 ${estaRegenerandoEste ? "animate-spin" : ""}`} />
                                                                    {estaRegenerandoEste ? "Regenerando..." : "Regenerar"}
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </article>
                                            )}
                                        </div>
                                    );
                                })}
                                <div ref={finalRef} />
                            </div>
                        )}
                    </div>
                </main>

                <footer className="pb-6 pt-2 px-6 bg-[#0F131C]">
                    <div className="max-w-3xl mx-auto rounded-2xl bg-[#161C29] p-4 shadow-lg space-y-3">
                        {modo === "redactar" && (
                            <div className="space-y-2.5 border-b border-white/[0.06] pb-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setMenuDocAbierto((prev) => !prev)}
                                            className="inline-flex items-center gap-2.5 rounded-xl bg-[#0F131C] hover:bg-[#131824] px-3.5 py-2 text-xs font-semibold text-white transition cursor-pointer"
                                        >
                                            <span className="h-2 w-2 rounded-full bg-[#D4B475]" />
                                            <span>{docSeleccionado.nombre}</span>
                                            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${menuDocAbierto ? "rotate-180" : ""}`} />
                                        </button>

                                        {menuDocAbierto && (
                                            <div className="absolute bottom-full left-0 mb-2 w-80 sm:w-96 rounded-2xl bg-[#0D111A] border border-white/10 shadow-2xl p-2 z-30 space-y-1">
                                                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                                    Selecciona el tipo de escrito
                                                </p>
                                                {CATALOGO_DOCUMENTOS.map((item) => {
                                                    const activo = item.nombre === tipoEscrito;
                                                    return (
                                                        <button
                                                            key={item.nombre}
                                                            type="button"
                                                            onClick={() => {
                                                                setTipoEscrito(item.nombre);
                                                                setMenuDocAbierto(false);
                                                            }}
                                                            className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-start justify-between gap-2 cursor-pointer ${
                                                                activo
                                                                    ? "bg-[#1B2436] text-white"
                                                                    : "text-slate-300 hover:bg-white/[0.04]"
                                                            }`}
                                                        >
                                                            <div>
                                                                <span className={`text-xs font-semibold block ${activo ? "text-[#D4B475]" : "text-slate-200"}`}>
                                                                    {item.nombre}
                                                                </span>
                                                                <span className="text-[11px] text-slate-400 block mt-0.5">
                                                                    {item.resumen}
                                                                </span>
                                                            </div>
                                                            {activo && <Check className="h-4 w-4 text-[#D4B475] shrink-0 mt-0.5" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {docSeleccionado.campos.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={insertarTodosLosCampos}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#D4B475] hover:bg-white/[0.05] transition cursor-pointer"
                                        >
                                            <FileSpreadsheet className="h-3.5 w-3.5" />
                                            Insertar ficha completa
                                        </button>
                                    )}
                                </div>

                                {docSeleccionado.campos.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                        <span className="text-[11px] text-slate-500 mr-1">
                                            Agregar campo:
                                        </span>
                                        {docSeleccionado.campos.map((campo, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => insertarCampo(campo.prefijoTexto)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0F131C] hover:bg-[#1E273B] text-[11px] text-slate-300 hover:text-white transition cursor-pointer"
                                            >
                                                <span className="text-[#D4B475] font-bold">+</span>
                                                <span>{campo.etiquetaCorta}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {modo === "analizar" && (
                            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#0F131C]">
                                <label
                                    htmlFor="subir-pdf"
                                    className="flex items-center gap-2.5 text-xs font-medium text-slate-200 cursor-pointer hover:text-white"
                                >
                                    <UploadCloud className="h-4 w-4 text-[#D4B475]" />
                                    <span>
                                        {archivoPdf ? archivoPdf.name : "Haz clic aquí para elegir un archivo PDF de tu computadora"}
                                    </span>
                                </label>
                                <input
                                    id="subir-pdf"
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setArchivoPdf(e.target.files?.[0] || null)}
                                    className="hidden"
                                />
                                {archivoPdf && (
                                    <button
                                        type="button"
                                        onClick={() => setArchivoPdf(null)}
                                        className="text-xs text-rose-400 hover:underline cursor-pointer"
                                    >
                                        Quitar
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="flex items-end gap-3">
                            <textarea
                                ref={textareaRef}
                                rows={3}
                                value={textoInput}
                                onChange={(e) => setTextoInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        enviar();
                                    }
                                }}
                                placeholder={
                                    modo === "redactar"
                                        ? docSeleccionado.placeholder
                                        : modo === "analizar"
                                        ? "Opcional: escribe qué quieres que ELIA revise en ese PDF (ej. plazos, prevenciones)..."
                                        : "Escribe tu pregunta sobre leyes, artículos o plazos..."
                                }
                                className="flex-1 bg-transparent resize-none text-sm text-white placeholder-slate-500 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => enviar()}
                                disabled={!puedeEnviar}
                                style={{
                                    backgroundColor: puedeEnviar ? "#D4B475" : "rgba(255,255,255,0.06)",
                                    color: puedeEnviar ? "#0A0D14" : "#475569"
                                }}
                                className="h-10 w-10 rounded-full flex items-center justify-center transition shrink-0 cursor-pointer"
                            >
                                <ArrowUp className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}