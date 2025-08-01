import React, { useState, useRef } from "react";
import {
  FileText,
  Download,
  Eye,
  Upload,
  Plus,
  Trash2,
  File,
  X,
} from "lucide-react";


import * as pdfjsLib from "pdfjs-dist";
import PDFViewer from "./PDFViewer";
import PDFRedactor from "./PDFRedactor";
import PDFIframeViewer from "./PDFIframeViewer";
import PDFEditor from "./PDFEditor";
import { PDFDocument, rgb } from "pdf-lib";

// Configurar el worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

interface Section {
  id: string;
  title: string;
  type: "text" | "table" | "list" | "image" | "chart";
  content: any;
  pageBreak?: boolean;
}

interface ProposalData {
  projectInfo: {
    name: string;
    client: string;
    date: string;
    totalCost: number;
    timeline: string;
  };
  sections: Section[];
  styling?: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

const ProposalGenerator: React.FC = () => {
  const [proposalData, setProposalData] = useState<ProposalData>({
    projectInfo: {
      name: "",
      client: "",
      date: new Date().toLocaleDateString("es-ES"),
      totalCost: 0,
      timeline: "",
    },
    sections: [],
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  // const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  // const [documentsError, setDocumentsError] = useState("");
  // const [documents, setDocuments] = useState<any[]>([]);

  // Nuevos estados para carga de archivos
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const proposalRef = useRef<HTMLDivElement>(null);

  // Estados para edición de PDF
  const [loadedPDF, setLoadedPDF] = useState<ArrayBuffer | null>(null);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [editablePDFContent, setEditablePDFContent] = useState<any[]>([]);
  const [showPDFEditor, setShowPDFEditor] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);



  // const [jsonResponse, setJsonResponse] = useState<any>([]);

  // Función para manejar drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  // Función para agregar archivos
  const addFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      // Validar tipos de archivo permitidos
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "image/jpeg",
        "image/png",
        "image/gif",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(`Tipo de archivo no permitido: ${file.name}`);
        return false;
      }

      // Removida la validación de tamaño - ahora acepta archivos de cualquier peso

      return true;
    });

    setUploadedFiles((prev) => [...prev, ...validFiles]);
  };

  // Función para eliminar archivo
  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Función para abrir selector de archivos
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Función para manejar selección de archivos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    // Limpiar el input para permitir seleccionar el mismo archivo
    e.target.value = "";
  };

  // Función para subir archivos a la API
  const uploadFiles = async () => {
    if (uploadedFiles.length === 0) {
      alert("No hay archivos para subir");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      uploadedFiles.forEach((file) => {
        formData.append("licitacion_files", file);
      });

      const response = await fetch(
        "https://981af84414fa.ngrok-free.app/generar-oferta-multiple",
        {
          method: "POST",
          body: formData,
        }
      );
     
      const data = await response.json();
   
      setJsonInput(JSON.stringify(data.oferta_json, null, 2));
      if (data.oferta_json) {
        loadFromJSON(data.oferta_json);
      }
      setUploadedFiles([]);
    } catch (error) {
      alert(
        `Error al subir archivos: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Función para obtener el ícono según el tipo de archivo
  const getFileIcon = (file: File) => {
    if (file.type.includes("pdf")) return "📄";
    if (file.type.includes("word") || file.type.includes("document"))
      return "📝";
    if (file.type.includes("excel") || file.type.includes("spreadsheet"))
      return "📊";
    if (file.type.includes("image")) return "🖼️";
    return "📎";
  };

  // Función para formatear el tamaño del archivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Función para cargar PDF para edición
  const loadPDFForEditing = async (file: File) => {
    setIsLoadingPDF(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      setLoadedPDF(arrayBuffer);
      
      // Extraer texto del PDF usando PDF.js
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      const extractedContent: any[] = [];
      const pageImages: string[] = [];
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        
        // Extraer texto
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map((item: any) => item.str).join(' ');
        
        // Renderizar página como imagen para visualización
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (context) {
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          await page.render(renderContext).promise;
          pageImages.push(canvas.toDataURL());
        }
        
        extractedContent.push({
          pageNumber: pageNum,
          text: textItems,
          editable: true
        });
      }
      
      setPdfPages(pageImages);
      setEditablePDFContent(extractedContent);
      setShowPDFEditor(true);
      
      // Intentar convertir el contenido a formato de propuesta
      convertPDFToProposalFormat(extractedContent);
      
    } catch (error) {
      console.error('Error cargando PDF:', error);
      alert('Error al cargar el PDF. Asegúrate de que sea un archivo PDF válido.');
    } finally {
      setIsLoadingPDF(false);
    }
  };

  // Función para convertir contenido PDF a formato de propuesta
  const convertPDFToProposalFormat = (content: any[]) => {
    try {
      const allText = content.map(page => page.text).join('\n');
      
      // Intentar extraer información básica del proyecto
      const lines = allText.split('\n').filter(line => line.trim());
      
      const sections: Section[] = [];
      let currentSection: Section | null = null;
      let sectionCounter = 1;
      
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        
        // Detectar si es un título (líneas cortas, palabras capitalizadas, etc.)
        if (trimmedLine.length > 0 && trimmedLine.length < 100 && 
            (trimmedLine.match(/^[A-Z]/) || trimmedLine.includes(':'))) {
          
          // Guardar sección anterior si existe
          if (currentSection) {
            sections.push(currentSection);
          }
          
          // Crear nueva sección
          currentSection = {
            id: sectionCounter.toString(),
            title: trimmedLine.replace(':', ''),
            type: "text",
            content: "",
          };
          sectionCounter++;
        } else if (currentSection && trimmedLine.length > 0) {
          // Agregar contenido a la sección actual
          currentSection.content += (currentSection.content ? '\n' : '') + trimmedLine;
        }
      });
      
      // Agregar última sección
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Actualizar datos de propuesta con contenido extraído
      if (sections.length > 0) {
        setProposalData(prev => ({
          ...prev,
          projectInfo: {
            ...prev.projectInfo,
            name: sections[0]?.title || "Documento PDF Cargado",
            client: "Cliente extraído del PDF",
            date: new Date().toLocaleDateString("es-ES"),
            totalCost: 0,
            timeline: "Por definir",
          },
          sections: sections
        }));
        
        setJsonInput(JSON.stringify({
          projectInfo: {
            name: sections[0]?.title || "Documento PDF Cargado",
            client: "Cliente extraído del PDF",
            date: new Date().toLocaleDateString("es-ES"),
            totalCost: 0,
            timeline: "Por definir",
          },
          sections: sections
        }, null, 2));
      }
      
    } catch (error) {
      console.error('Error convirtiendo PDF a formato de propuesta:', error);
    }
  };

  // Función para abrir selector de PDF
  const openPDFSelector = () => {
    pdfInputRef.current?.click();
  };

  // Función para manejar selección de PDF
  const handlePDFSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      loadPDFForEditing(file);
    } else {
      alert('Por favor selecciona un archivo PDF válido.');
    }
    // Limpiar el input
    e.target.value = "";
  };

  // ---------------------- PLANTILLA EDITABLE ---------------------------
  // Crear PDF vacío editable
  const createEmptyEditablePDF = async () => {
    const { createEditableTemplate } = await import("../utils/createEditableTemplate");
    const bytes = await createEditableTemplate();
    const blob = new Blob([bytes], { type: "application/pdf" });
    window.open(URL.createObjectURL(blob));
  };

  // Llenar plantilla seleccionada con el JSON actual
  const fillTemplateWithJSON = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const { fillTemplate } = await import("../utils/fillTemplate");
      const filled = await fillTemplate(new Uint8Array(arrayBuffer), proposalData as any);
      const blob = new Blob([filled], { type: "application/pdf" });
      window.open(URL.createObjectURL(blob));
    } catch (err) {
      alert("No se pudo llenar la plantilla: " + (err as Error).message);
    }
  };

  // -------------------------------------------------------------------

  // Función para actualizar contenido editable del PDF
  const updatePDFContent = (pageIndex: number, newText: string) => {
    setEditablePDFContent(prev => 
      prev.map((page, index) => 
        index === pageIndex ? { ...page, text: newText } : page
      )
    );
  };

  // Función para guardar PDF editado
  const savePDFEdited = async () => {
    try {
      setIsGeneratingPDF(true);
      
      if (!loadedPDF) {
        alert('No hay PDF cargado para editar');
        return;
      }

      // Crear nuevo PDF con el contenido editado
      const pdfDoc = await PDFDocument.create();
      
      editablePDFContent.forEach(async (pageContent) => {
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        
        // Agregar texto editado
        page.drawText(pageContent.text, {
          x: 50,
          y: height - 100,
          size: 12,
          color: rgb(0, 0, 0),
          maxWidth: width - 100,
        });
      });

      const pdfBytes = await pdfDoc.save();
      
      // Descargar PDF editado
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `pdf_editado_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error guardando PDF editado:', error);
      alert('Error al guardar el PDF editado');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Funciones comentadas por ahora - no se usan en la interfaz actual
  /*
  const loadDocumentsFromAPI = async () => {
    setIsLoadingDocuments(true);
    setDocumentsError("");

    try {
      // Aquí puedes cambiar la URL por tu servicio real
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts?_limit=5"
      );

      if (!response.ok) {
        throw new Error(
          `Error HTTP: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setDocuments(data);
      console.log("Documentos cargados:", data);
    } catch (error) {
      console.error("Error cargando documentos:", error);
      setDocumentsError(
        `Error al cargar documentos: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const loadDocumentById = async (id: number) => {
    setIsLoadingDocuments(true);
    setDocumentsError("");

    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${id}`
      );

      if (!response.ok) {
        throw new Error(
          `Error HTTP: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Documento cargado:", data);

      // Aquí puedes convertir el documento a formato de propuesta si es necesario
      // Por ahora solo lo mostramos en consola
    } catch (error) {
      console.error("Error cargando documento:", error);
      setDocumentsError(
        `Error al cargar documento: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setIsLoadingDocuments(false);
    }
  };
  */

  // Función para cargar datos desde JSON
  const loadFromJSON = (externalData?: any) => {
    setJsonError("");

    let data;
    try {
      if (externalData) {
        data = externalData;
      } else {
        if (!jsonInput.trim()) {
          setJsonError("Por favor, ingresa un JSON válido en el campo de texto.");
          return;
        }
        data = JSON.parse(jsonInput);
      }

      // Validar estructura básica del JSON
      if (!data.projectInfo && !data.sections) {
        // Si no tiene la estructura esperada, intentar convertir el JSON actual
        if (data.id && data.title) {
          // Es un JSON de sección individual, convertirlo al formato esperado
          const convertedData = {
            projectInfo: {
              name: data.title || "Proyecto",
              client: "Cliente",
              date: new Date().toLocaleDateString("es-ES"),
              totalCost: 0,
              timeline: "Por definir"
            },
            sections: [data]
          };
          setProposalData(convertedData);
          setJsonError("");
          
          // Generar PDF automáticamente
          if (convertedData.sections && convertedData.sections.length > 0) {
            generatePDFFromData(convertedData);
          }
          return;
        }
        
        setJsonError(
          'El JSON debe contener "projectInfo" y "sections" o ser una sección individual con "id" y "title". Verifica el formato.'
        );
        return;
      }

      // Validar projectInfo
      if (!data.projectInfo.name || !data.projectInfo.client) {
        setJsonError(
          "El JSON debe contener información del proyecto (name, client). Verifica el formato."
        );
        return;
      }

      // Validar sections
      if (!Array.isArray(data.sections) || data.sections.length === 0) {
        setJsonError(
          'El JSON debe contener al menos una sección en el array "sections". Verifica el formato.'
        );
        return;
      }

      // Validar cada sección
      for (let i = 0; i < data.sections.length; i++) {
        const section = data.sections[i];
        if (
          !section.id ||
          !section.title ||
          !section.type ||
          !section.content
        ) {
          setJsonError(
            `La sección ${
              i + 1
            } debe contener id, title, type y content. Verifica el formato.`
          );
          return;
        }
      }

      setProposalData(data);
      setJsonError("");
      
      // Generar PDF automáticamente cuando se carga JSON válido
      if (data.sections && data.sections.length > 0) {
        generatePDFFromData(data);
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
      setJsonError(
        `Error al parsear el JSON: ${
          error instanceof Error ? error.message : "Formato inválido"
        }`
      );
    }
  };

  // Función para generar JSON de ejemplo
  const generateExampleJSON = () => {
    const exampleData: ProposalData = {
      projectInfo: {
        name: "Sistema de Gestión de Inventarios",
        client: "Empresa ABC",
        date: new Date().toLocaleDateString("es-ES"),
        totalCost: 25000,
        timeline: "8 semanas",
      },
      sections: [
        {
          id: "1",
          title: "Resumen Ejecutivo",
          type: "text",
          content:
            "Esta propuesta presenta nuestra solución integral para el desarrollo de un sistema de gestión de inventarios que optimizará los procesos de la empresa y mejorará la eficiencia operativa.",
          pageBreak: true,
        },
        {
          id: "2",
          title: "Servicios Incluidos",
          type: "list",
          content: [
            "Desarrollo de aplicación web responsive",
            "Sistema de autenticación y autorización",
            "Módulo de gestión de productos",
            "Módulo de control de inventarios",
            "Reportes y dashboards",
            "Integración con sistemas existentes",
          ],
        },
        {
          id: "3",
          title: "Equipo y Horas",
          type: "table",
          content: {
            headers: ["Rol", "Horas", "Tarifa", "Subtotal"],
            rows: [
              ["Project Manager", 40, "$80/h", "$3,200"],
              ["UX/UI Designer", 60, "$70/h", "$4,200"],
              ["Frontend Developer", 120, "$75/h", "$9,000"],
              ["Backend Developer", 140, "$80/h", "$11,200"],
              ["QA Tester", 40, "$60/h", "$2,400"],
            ],
          },
        },
        {
          id: "4",
          title: "Cronograma del Proyecto",
          type: "text",
          content:
            "El proyecto se desarrollará en 4 fases principales:\n\nFase 1 (Semanas 1-2): Análisis y diseño\nFase 2 (Semanas 3-4): Desarrollo frontend\nFase 3 (Semanas 5-6): Desarrollo backend\nFase 4 (Semanas 7-8): Testing y entrega",
          pageBreak: true,
        },
        {
          id: "5",
          title: "Entregables",
          type: "list",
          content: [
            "Código fuente completo y documentado",
            "Documentación técnica detallada",
            "Manual de usuario",
            "Manual de administración",
            "Capacitación del equipo (8 horas)",
            "Soporte post-lanzamiento (3 meses)",
          ],
        },
        {
          id: "6",
          title: "Términos y Condiciones",
          type: "text",
          content:
            "Pago del 40% al inicio del proyecto\nPago del 30% al completar la Fase 2\nPago del 30% restante al entregar el proyecto\nGarantía de 6 meses incluida\nSoporte técnico por 3 meses",
        },
      ],
      styling: {
        primaryColor: "#2563eb",
        secondaryColor: "#1e40af",
        fontFamily: "Arial, sans-serif",
      },
    };

    setJsonInput(JSON.stringify(exampleData, null, 2));
    setProposalData(exampleData);
  };

  // Función para cargar JSON específico del Sistema UTFSM
  const loadUTFSMJSON = () => {
    const utfsmData: ProposalData = {
      projectInfo: {
        name: "Sistema de Medición de Competencias Transversales Sello",
        client: "Universidad Técnica Federico Santa María",
        date: "Mayo 2025",
        totalCost: 45000000,
        timeline: "5 meses",
      },
      sections: [
        {
          id: "1",
          title: "Resumen Ejecutivo",
          type: "text",
          content:
            "La presente propuesta responde a la necesidad de la Universidad Técnica Federico Santa María (UTFSM) de contar con un servicio especializado para el desarrollo e implementación de un Sistema de Medición, Control y Reporte de Competencias Transversales, que permita evaluar el progreso formativo de sus estudiantes de manera sistemática, integrada y basada en datos.\n\nEsta solución tiene por objetivo fortalecer los procesos institucionales de evaluación y seguimiento, entregando herramientas tecnológicas que contribuyan a la mejora continua de la calidad educativa.",
          pageBreak: true,
        },
        {
          id: "2",
          title: "Alcance del Servicio",
          type: "list",
          content: [
            "Desarrollar una plataforma web alojada en la nube, moderna, segura e inclusiva",
            "Diseñar e implementar mecanismos de medición y reporte de competencias transversales",
            "Incorporar un sistema flexible de creación, gestión y aplicación de rúbricas de evaluación",
            "Proporcionar funcionalidades de acceso personalizado para distintos perfiles de usuarios",
            "Facilitar la autoevaluación estudiantil mediante una interfaz intuitiva",
            "Generar reportes analíticos y visualizaciones de indicadores clave de desempeño",
          ],
        },
        {
          id: "3",
          title: "Funcionalidades Clave del Sistema",
          type: "text",
          content:
            "El sistema considera los siguientes módulos principales:\n\n• Gestor de Competencias: Módulo en el cual el usuario Administrador podrá crear, editar, organizar y actualizar competencias transversales que se evalúan en la institución.\n\n• Gestor de Rúbricas de Evaluación: Módulo en el cual el usuario Administrador podrá crear, agregar, modificar y/o eliminar las distintas rúbricas de evaluación para cada competencia transversal.\n\n• Módulo de Evaluación y Seguimiento: Módulo en el cual tanto los estudiantes como los jefes de carrera podrán realizar procesos de evaluación y autoevaluación.\n\n• Panel de Control y Reportería Avanzada: Módulo central de gestión estratégica donde el Administrador podrá monitorear el uso del sistema y generar reportes personalizados.",
          pageBreak: true,
        },
        {
          id: "4",
          title: "Tipos de Usuarios y Permisos",
          type: "table",
          content: {
            headers: [
              "Perfil de Usuario",
              "Descripción",
              "Permisos Principales",
            ],
            rows: [
              [
                "Administrador",
                "Equipo de gestión institucional",
                "Crear/editar competencias, gestionar rúbricas, supervisar uso del sistema",
              ],
              [
                "Jefe de Carrera",
                "Docente con responsabilidad sobre coordinación",
                "Visualizar resultados por carrera, participar en evaluaciones",
              ],
              [
                "Estudiante",
                "Alumnado regular de la UTFSM",
                "Acceder a competencias, realizar autoevaluaciones, visualizar historial",
              ],
            ],
          },
        },
        {
          id: "5",
          title: "Infraestructura Tecnológica",
          type: "text",
          content:
            "La solución propuesta contempla una infraestructura tecnológica moderna, escalable y segura:\n\n• Backend: Framework Django sobre Python, permitiendo una arquitectura robusta y modular.\n\n• Frontend: Desarrollo basado en React, utilizado para la construcción de interfaces de usuario dinámicas e interactivas.\n\n• Base de Datos: Uso combinado de PostgreSQL (para datos estructurados) y MongoDB (para datos semiestructurados).\n\n• Infraestructura: Implementación sobre servidores Linux utilizando contenedores con Docker y orquestación a través de Kubernetes.\n\n• Integraciones: API RESTful para integración bidireccional con SIGA y Moodle, autenticación unificada con Microsoft EntraID.",
          pageBreak: true,
        },
        {
          id: "6",
          title: "Equipo de Trabajo Asignado",
          type: "table",
          content: {
            headers: [
              "Rol",
              "Responsabilidades Principales",
              "Experiencia Requerida",
            ],
            rows: [
              [
                "Project Manager",
                "Planificación, coordinación y control del proyecto",
                "Más de 10 años en gestión de proyectos tecnológicos",
              ],
              [
                "Tech Lead / Arquitecto",
                "Define la arquitectura del sistema y estándares técnicos",
                "Experiencia en arquitecturas de sistemas educativos",
              ],
              [
                "Front-End Developer",
                "Desarrolla la interfaz de usuario según principios de usabilidad",
                "React, TypeScript, diseño responsive",
              ],
              [
                "Back-End Developer",
                "Desarrolla la lógica de negocio y APIs RESTful",
                "Django, Python, APIs RESTful",
              ],
              [
                "UX/UI Designer",
                "Diseña la experiencia y la interfaz de usuario",
                "Diseño centrado en usuario, accesibilidad",
              ],
              [
                "QA / Tester Funcional",
                "Diseña y ejecuta pruebas automatizadas y manuales",
                "Testing automatizado, casos de uso educativos",
              ],
            ],
          },
        },
        {
          id: "7",
          title: "Metodología de Implementación",
          type: "text",
          content:
            'La implementación se realizará bajo la modalidad "llave en mano", utilizando un enfoque metodológico basado en Disciplined Agile del PMI:\n\nFase 1 - Inception (1 mes):\n• Refinamiento del alcance y visión del producto\n• Consolidación del equipo multidisciplinario\n• Consolidación de la arquitectura técnica\n• Confirmación del backlog inicial y priorización de requisitos\n\nFase 2 - Construction (3 meses):\n• Desarrollo incremental de los módulos\n• Iteraciones cortas (1-2 semanas) con demostraciones frecuentes\n• Implementación progresiva de las integraciones\n• Pruebas técnicas continuas\n\nFase 3 - Transition (1 mes):\n• Pruebas finales y transferencia tecnológica\n• Capacitación de personal técnico\n• Despliegue en producción\n• Activación de plan de soporte',
          pageBreak: true,
        },
        {
          id: "8",
          title: "Garantías y Soporte Post-implementación",
          type: "text",
          content:
            "GUX ofrece una política de garantía y soporte post-implementación que asegura la continuidad operativa del sistema:\n\nGarantía Técnica (6 meses):\n• Corrección sin costo de errores funcionales, bugs o defectos atribuibles al código fuente\n• Corrección de errores de configuración en los entornos implementados\n• Revisión y ajuste de integraciones con sistemas institucionales\n• Actualización de la documentación técnica cuando se aplique alguna corrección\n\nSoporte Acompañado:\n• Resolución de consultas operativas y funcionales para usuarios autorizados\n• Acompañamiento en el monitoreo de integraciones y flujos críticos\n• Aplicación de ajustes menores de configuración\n• Participación en reuniones técnicas mensuales",
        },
        {
          id: "9",
          title: "Plan de Capacitación",
          type: "list",
          content: [
            "Capacitación funcional: 6 horas distribuidas en 2 a 3 sesiones según perfil",
            "Capacitación técnica (TI): 6 a 8 horas distribuidas en sesiones especializadas",
            "Acompañamiento supervisado: 4 semanas posteriores a la puesta en marcha",
            "Acceso permanente a materiales asincrónicos",
            "Manuales de usuario diferenciados por perfil",
            "Cápsulas de video por funcionalidad clave (2 a 5 minutos)",
            "Documentación técnica estructurada",
            "Entorno de prueba (sandbox) disponible por 30 días",
          ],
        },
        {
          id: "10",
          title: "Experiencia y Referencias",
          type: "text",
          content:
            "GUX cuenta con más de 20 años de experiencia en desarrollo de productos digitales, con presencia en Latinoamérica y Europa. Experiencia relevante en el sector educativo:\n\n• Pontificia Universidad Católica de Chile: Plataforma de Evaluación de Madurez en Gestión TI\n• Universidad Santo Tomás: Plataforma administrativa con hiperautomatización\n• Universidad Alberto Hurtado: Plataforma administrativa con hiperautomatización\n• Universidad de Las Américas: Plataforma para apoyo a personas con discapacidad cognitiva\n• Bomberos de Chile: Apoyo integral a la Academia Nacional de Bomberos\n\nEl equipo cuenta con especialistas en tecnologías educativas (EdTech), desarrolladores full-stack, arquitectos de software, y especialistas en experiencia de usuario.",
          pageBreak: true,
        },
        {
          id: "11",
          title: "Factores Clave para el Éxito",
          type: "list",
          content: [
            "Coordinación y ejecución de entrevistas y focus groups con participación activa de la UTFSM",
            "Disponibilidad de APIs de SIGA y Moodle dentro de los plazos definidos",
            "Documentación clara de APIs, ambientes de prueba y autenticación segura",
            "Ambientes estables para QA y producción desde etapas tempranas",
            "Dedicación de colaboradores clave de la UTFSM para validación y ejecución",
            "Gestión de licencias de software, hardware especializado o insumos específicos por parte de la UTFSM",
            "Cumplimiento normativo y alineación con regulaciones vigentes en Chile",
          ],
        },
        {
          id: "12",
          title: "Cronograma Detallado del Proyecto",
          type: "table",
          content: {
            headers: [
              "Etapa",
              "Duración",
              "Actividades Principales",
              "Entregables",
            ],
            rows: [
              [
                "Inception",
                "1 mes",
                "Definición de requerimientos, análisis preliminar",
                "Documento de especificación detallado y roadmap del proyecto",
              ],
              [
                "Construction",
                "3 meses",
                "Desarrollo iterativo-incremental de módulos",
                "Versiones funcionales incrementales de la plataforma",
              ],
              [
                "Transition",
                "1 mes",
                "Pruebas finales, transferencia tecnológica",
                "Solución operativa en ambiente de la UTFSM",
              ],
            ],
          },
        },
        {
          id: "13",
          title: "Inversión y Condiciones de Pago",
          type: "text",
          content:
            "Costo Total del Proyecto: $45.000.000 (pesos chilenos)\n\nDesglose de Costos:\n• Desarrollo de plataforma web: $32.000.000\n• Integraciones con sistemas institucionales: $8.000.000\n• Capacitación y transferencia tecnológica: $3.000.000\n• Documentación y soporte inicial: $2.000.000\n\nCondiciones de Pago:\n• 30% al inicio del proyecto (firma de contrato)\n• 40% al completar la Fase de Construction\n• 30% al completar la Fase de Transition y aceptación del sistema\n\nGarantías Incluidas:\n• Garantía técnica por 6 meses\n• Soporte post-implementación por 6 meses\n• Actualizaciones de seguridad gratuitas\n• Capacitación completa del equipo técnico",
        },
      ],
      styling: {
        primaryColor: "#2563eb",
        secondaryColor: "#1e40af",
        fontFamily: "Arial, sans-serif",
      },
    };

    setJsonInput(JSON.stringify(utfsmData, null, 2));
    setProposalData(utfsmData);
  };

  // Función para cargar JSON de ejemplo para PDF
  const loadExamplePDFJSON = async () => {
    try {
      const response = await fetch('/src/data/ejemplo-pdf.json');
      const examplePDFData = await response.json();
      
      setJsonInput(JSON.stringify(examplePDFData, null, 2));
      setProposalData(examplePDFData);
    } catch (error) {
      console.error('Error cargando JSON de ejemplo para PDF:', error);
      // Fallback - usar datos directos si no se puede cargar el archivo
      const fallbackData: ProposalData = {
        projectInfo: {
          name: "Sistema de Gestión Empresarial Integral",
          client: "Empresa Tecnológica ABC S.A.",
          date: "Diciembre 2024",
          totalCost: 45000000,
          timeline: "6 meses",
        },
        sections: [
          {
            id: "1",
            title: "Resumen Ejecutivo",
            type: "text",
            content: "Esta propuesta presenta una solución integral para el desarrollo de un sistema de gestión empresarial que revolucionará los procesos administrativos de ABC S.A.\n\nNuestro enfoque se basa en tecnologías de vanguardia, metodologías ágiles y una experiencia de usuario excepcional que garantiza la adopción exitosa del sistema por parte de todos los usuarios.",
            pageBreak: true,
          },
          {
            id: "2",
            title: "Objetivos y Beneficios del Proyecto",
            type: "list",
            content: [
              "Automatizar completamente los procesos administrativos manuales existentes",
              "Implementar un sistema centralizado de gestión de datos empresariales",
              "Desarrollar dashboards ejecutivos con analytics en tiempo real",
              "Integrar módulos de facturación, inventario, RRHH y CRM",
              "Garantizar la seguridad de datos con protocolos de encriptación avanzados",
              "Reducir costos operativos en un 30% mediante la automatización"
            ],
          },
          {
            id: "3",
            title: "Equipo de Desarrollo y Distribución de Costos",
            type: "table",
            content: {
              headers: ["Rol", "Horas Estimadas", "Tarifa por Hora", "Subtotal"],
              rows: [
                ["Project Manager Senior", "120", "$65.000", "$7.800.000"],
                ["Arquitecto de Software", "150", "$85.000", "$12.750.000"],
                ["Tech Lead Full-Stack", "180", "$80.000", "$14.400.000"],
                ["Desarrollador Senior Frontend", "220", "$70.000", "$15.400.000"],
                ["Desarrollador Senior Backend", "200", "$75.000", "$15.000.000"]
              ],
            },
            pageBreak: true,
          }
        ],
        styling: {
          primaryColor: "#2563eb",
          secondaryColor: "#1e40af",
          fontFamily: "Arial, sans-serif",
        },
      };
      
      setJsonInput(JSON.stringify(fallbackData, null, 2));
      setProposalData(fallbackData);
    }
  };

  // Función para agregar nueva sección
  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: "Nueva Sección",
      type: "text",
      content: "Contenido de la nueva sección...",
    };

    setProposalData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  // Función para eliminar sección
  const removeSection = (sectionId: string) => {
    setProposalData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
    }));
  };

  // Función para actualizar sección
  const updateSection = (
    sectionId: string,
    field: keyof Section,
    value: any
  ) => {
    setProposalData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, [field]: value } : s
      ),
    }));
  };

  // Función para renderizar contenido según el tipo
  const renderSectionContent = (section: Section) => {
    switch (section.type) {
      case "text":
        return (
          <div className="whitespace-pre-line text-gray-700 leading-relaxed">
            {section.content}
          </div>
        );

      case "list":
        return (
          <ul style={{ color: "#222", fontSize: "16px", marginLeft: "24px", marginBottom: "16px" }}>
            {Array.isArray(section.content) &&
              section.content.map((item: string, index: number) => (
                <li key={index} style={{ marginBottom: "6px" }}>
                  {item}
                </li>
              ))}
          </ul>
        );

      case "table":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  {section.content.headers.map(
                    (header: string, index: number) => (
                      <th
                        key={index}
                        className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {section.content.rows.map((row: string[], rowIndex: number) => (
                  <tr
                    key={rowIndex}
                    className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {row.map((cell: string, cellIndex: number) => (
                      <td
                        key={cellIndex}
                        className="border border-gray-300 px-4 py-2 text-gray-700"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return (
          <div className="text-gray-500">Tipo de contenido no soportado</div>
        );
    }
  };
const ProposalPage = React.forwardRef(
  (
    { projectInfo, sections, renderSectionContent, isFirstPage }: { projectInfo: any, sections: any, renderSectionContent: any, isFirstPage: boolean },
    ref: any
  ) => (
    <div
      ref={ref}
      style={{
        width: "794px", // A4 px
        minHeight: "1123px",
        background: "#fff",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
      className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b-2 border-blue-600">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">GUX</h1>
        <p className="text-lg text-gray-600">Propuesta de Desarrollo</p>
      </div>
      {/* Project Info SOLO en la primera página */}
    {/*   {isFirstPage && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {projectInfo.name || "Nombre del Proyecto"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Cliente:</span>
              <p className="text-gray-900">{projectInfo.client || "Nombre del Cliente"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Fecha:</span>
              <p className="text-gray-900">{projectInfo.date}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Costo Total:</span>
              <p className="text-gray-900 font-bold">
                ${projectInfo.totalCost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )} */}
      {/* Sections */}
      <div className="space-y-8">
        {sections.map((section: Section) => (
          <div key={section.id} className={section.pageBreak ? "page-break" : ""}>
            <h3 className="text-xl font-bold text-blue-600 mb-4">{section.title}</h3>
            {renderSectionContent(section)}
          </div>
        ))}
      </div>
      {/* Footer */}
      <div className="mt-12 pt-6 border-t-2 border-gray-300 text-center text-gray-600">
        <p>Equipo GUX - Especialistas en Desarrollo de Software</p>
        <p>Email: contacto@gux.com | Tel: +1 (555) 123-4567</p>
      </div>
    </div>
  )
);
  // Función para generar PDF (nuevo enfoque usando pdf-lib)
  const [generatedPDF, setGeneratedPDF] = useState<Uint8Array | null>(null);
  const [iframeURL, setIframeURL] = useState<string | null>(null);
  const [isEditingPDF, setIsEditingPDF] = useState(false);

  
  // Función para generar PDF desde datos específicos
  const generatePDFFromData = async (data: ProposalData) => {
    setIsGeneratingPDF(true);
    try {
      const { buildProposalPDF } = await import("../utils/ProposalPDFBuilder");
      const pdfBytes = await buildProposalPDF(data);

      setGeneratedPDF(pdfBytes);
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setIframeURL(url);
      
      // Crear URL separada para descarga
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const fileName = `${data.projectInfo.name || "propuesta"}_${new Date()
        .toISOString()
        .split("T")[0]}.pdf`;
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF. Intenta de nuevo.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Función para generar PDF y mostrarlo
  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const { buildProposalPDF } = await import("../utils/ProposalPDFBuilder");
      const pdfBytes = await buildProposalPDF(proposalData as any);

      setGeneratedPDF(pdfBytes);
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setIframeURL(url);
      
      // Crear URL separada para descarga
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const fileName = `${proposalData.projectInfo.name || "propuesta"}_${new Date()
        .toISOString()
        .split("T")[0]}.pdf`;
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF. Intenta de nuevo.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-4 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-600">GUX Hackathon - Cotizador v0</span>
            <span className="text-xs text-gray-400">Herramienta Interna</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Generador de Propuestas
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Crea propuestas profesionales con nuestro editor de PDF inteligente
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel izquierdo - Formularios y controles */}
          <div className="space-y-6">
            {/* Documentos */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">
                  Cargar Documentos
                </h3>
              </div>
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={openFileSelector}
                  style={{
                    minHeight: "150px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <input
                    type="file"
                    multiple
                    accept=".pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,image/jpeg,image/png,image/gif"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {isDragOver ? (
                    <X size={40} className="text-blue-500" />
                  ) : (
                    <>
                      <File size={40} className="text-blue-500" />
                      <p className="text-sm text-gray-600">
                        Arrastra y suelta tus documentos aquí o haz clic para
                        seleccionar
                      </p>
                    </>
                  )}
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Archivos Subidos:
                    </h4>
                    <ul className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between bg-gray-100 p-2 rounded-md text-sm text-gray-800"
                        >
                          <span>
                            {getFileIcon(file)} {file.name} (
                            {formatFileSize(file.size)})
                          </span>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800"
                            title="Eliminar archivo"
                          >
                            <X size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={uploadFiles}
                      disabled={isUploading || uploadedFiles.length === 0}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Subir Archivos
                        </>
                      )}
                    </button>
                    {isUploading && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-700 text-sm">
                          Subiendo archivos... Progreso: {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

      

     

            {/* JSON Input Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cargar Datos desde JSON
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                 
                  <button
                    onClick={loadUTFSMJSON}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FileText size={16} />
                    Cargar JSON UTFSM
                  </button>
   
                  <button
                    onClick={loadFromJSON}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Upload size={16} />
                    Cargar JSON Personalizado
                  </button>
                </div>
                <textarea
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setJsonError("");
                  }}
                  placeholder="Pega aquí tu JSON con los datos de la propuesta..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                />
                {jsonError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{jsonError}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Project Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información del Proyecto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Proyecto
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={proposalData.projectInfo.name}
                    onChange={(e) =>
                      setProposalData((prev) => ({
                        ...prev,
                        projectInfo: {
                          ...prev.projectInfo,
                          name: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cliente
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={proposalData.projectInfo.client}
                    onChange={(e) =>
                      setProposalData((prev) => ({
                        ...prev,
                        projectInfo: {
                          ...prev.projectInfo,
                          client: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                 
                </div>
              </div>
            </div>

            {/* Sections Management */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Secciones de la Propuesta
                </h3>
                <button
                  onClick={addSection}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Plus size={16} />
                  Agregar Sección
                </button>
              </div>
              <div className="space-y-4">
                {proposalData.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="border border-gray-300 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Título
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            value={section.title}
                            onChange={(e) =>
                              updateSection(section.id, "title", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo
                          </label>
                          <select
                            className="input-field"
                            value={section.type}
                            onChange={(e) =>
                              updateSection(section.id, "type", e.target.value)
                            }
                          >
                            <option value="text">Texto</option>
                            <option value="list">Lista</option>
                            <option value="table">Tabla</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`pageBreak-${section.id}`}
                            checked={section.pageBreak}
                            onChange={(e) =>
                              updateSection(
                                section.id,
                                "pageBreak",
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300"
                          />
                          <label
                            htmlFor={`pageBreak-${section.id}`}
                            className="text-sm text-gray-700"
                          >
                            Salto de página
                          </label>
                        </div>
                      </div>
                      <button
                        onClick={() => removeSection(section.id)}
                        className="ml-4 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contenido
                      </label>
                      {section.type === "text" && (
                        <textarea
                          className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          value={section.content}
                          onChange={(e) =>
                            updateSection(section.id, "content", e.target.value)
                          }
                          placeholder="Escribe el contenido de esta sección..."
                        />
                      )}
                      {section.type === "list" && (
                        <textarea
                          className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          value={
                            Array.isArray(section.content)
                              ? section.content.join("\n")
                              : ""
                          }
                          onChange={(e) =>
                            updateSection(
                              section.id,
                              "content",
                              e.target.value
                                .split("\n")
                                .filter((item) => item.trim())
                            )
                          }
                          placeholder="Escribe cada elemento en una línea separada..."
                        />
                      )}
                      {section.type === "table" && (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Encabezados (separados por comas)
                            </label>
                            <input
                              type="text"
                              className="input-field"
                              value={section.content?.headers?.join(", ") || ""}
                              onChange={(e) =>
                                updateSection(section.id, "content", {
                                  ...section.content,
                                  headers: e.target.value
                                    .split(",")
                                    .map((h) => h.trim()),
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Filas (una fila por línea, valores separados por
                              comas)
                            </label>
                            <textarea
                              className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                              value={
                                section.content?.rows
                                  ?.map((row: string[]) => row.join(", "))
                                  .join("\n") || ""
                              }
                              onChange={(e) =>
                                updateSection(section.id, "content", {
                                  ...section.content,
                                  rows: e.target.value
                                    .split("\n")
                                    .filter((row) => row.trim())
                                    .map((row) =>
                                      row.split(",").map((cell) => cell.trim())
                                    ),
                                })
                              }
                              placeholder="Fila 1, Fila 2, Fila 3&#10;Valor 1, Valor 2, Valor 3"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PDF Preview - COMENTADO TEMPORALMENTE */}
            {/*
            {proposalData.sections.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vista Previa de la Propuesta
                </h3>
                <div
                  ref={proposalRef}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-4xl mx-auto"
                  style={{ minHeight: "1000px" }}
                >
                  <div className="text-center mb-8 pb-6 border-b-2 border-blue-600">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      GUX
                    </h1>
                    <p className="text-lg text-gray-600">
                      Propuesta de Desarrollo
                    </p>
                  </div>

                  <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {proposalData.projectInfo.name || "Nombre del Proyecto"}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">
                          Cliente:
                        </span>
                        <p className="text-gray-900">
                          {proposalData.projectInfo.client ||
                            "Nombre del Cliente"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Fecha:
                        </span>
                        <p className="text-gray-900">
                          {proposalData.projectInfo.date}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Costo Total:
                        </span>
                        <p className="text-gray-900 font-bold">
                          ${proposalData.projectInfo.totalCost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {proposalData.sections.map((section, index) => (
                      <div
                        key={section.id}
                        className={section.pageBreak ? "page-break" : ""}
                      >
                        <h3 className="text-xl font-bold text-blue-600 mb-4">
                          {section.title}
                        </h3>
                        {renderSectionContent(section)}
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 pt-6 border-t-2 border-gray-300 text-center text-gray-600">
                    <p>Equipo GUX - Especialistas en Desarrollo de Software</p>
                    <p>Email: contacto@gux.com | Tel: +1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
            )}
            */}
          </div>

          {/* Panel derecho - PDF y editor */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-screen">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Vista Previa del PDF
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={generatePDF}
                  disabled={
                    proposalData.sections.length === 0 || isGeneratingPDF
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Download size={16} />
                                    {isGeneratingPDF ? "Generando..." : "Generar PDF"}
                </button>
                {iframeURL && (
                  <button
                    onClick={() => setIsEditingPDF(!isEditingPDF)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isEditingPDF ? "Ver PDF" : "Constructor PDF"}
                  </button>
                )}
                </div>
            </div>
            
            {/* Área del PDF - Pantalla completa */}
            <div className="h-full">
              {isGeneratingPDF ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Generando PDF...</p>
                  </div>
                </div>
              ) : iframeURL ? (
                <div className="h-full">
                  {isEditingPDF ? (
                    <PDFEditor 
                      blobUrl={iframeURL} 
                      onSave={(pdfBytes) => {
                        const newUrl = URL.createObjectURL(new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" }));
                        setIframeURL(newUrl);
                        setIsEditingPDF(false);
                      }} 
                    />
                  ) : (
                    <PDFIframeViewer blobUrl={iframeURL} height="100%" />
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <File size={64} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Carga un JSON para generar el PDF</p>
                    <p className="text-gray-400 text-sm mt-2">El PDF aparecerá aquí automáticamente</p>
                  </div>
                </div>
              )}
            </div>
          </div>

            {/* Observaciones y Correcciones (opcional) */}
            {/*   <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="text-orange-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Observaciones y Correcciones</h3>
              </div>
              <div className="space-y-4">
                <textarea
                  placeholder="Escriba aquí sus observaciones, comentarios o correcciones para la propuesta..."
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                />
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Eye size={16} />
                  Aplicar Correcciones
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Las correcciones se aplicarán automáticamente a la propuesta
                </p>
              </div>
            </div> */}
        </div>
      </div>
    </div>
  );
};

export default ProposalGenerator;
