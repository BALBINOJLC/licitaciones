import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
}

interface ImageElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PDFEditorProps {
  blobUrl: string;
  onSave: (pdfBytes: Uint8Array) => void;
}

const PDFEditor: React.FC<PDFEditorProps> = ({ blobUrl, onSave }) => {
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [imageElements, setImageElements] = useState<ImageElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isAddingText, setIsAddingText] = useState(false);
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [newText, setNewText] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [activeTab, setActiveTab] = useState<'tools' | 'elements'>('tools');
  const [showSidebar, setShowSidebar] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Renderizar el área de edición
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    // Configurar canvas responsive
    const containerWidth = canvas.parentElement?.clientWidth || 800;
    const containerHeight = canvas.parentElement?.clientHeight || 600;
    const scale = Math.min(containerWidth / 800, containerHeight / 600, 1);
    
    canvas.width = 800 * scale;
    canvas.height = 600 * scale;
    canvas.style.width = `${800 * scale}px`;
    canvas.style.height = `${600 * scale}px`;
    
    // Escalar el contexto
    ctx.scale(scale, scale);
    
    // Fondo blanco con gradiente sutil
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#f8fafc');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);
    
    // Márgenes y líneas de guía
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(50, 50, 700, 500);
    ctx.setLineDash([]);
    
    // Líneas de texto simuladas
    ctx.fillStyle = '#f1f5f9';
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(80, 100 + i * 50, 640, 25);
    }
    
    // Dibujar elementos de texto
    textElements.forEach(element => {
      ctx.font = `${element.fontSize}px ${element.fontFamily}`;
      ctx.fillStyle = element.color;
      ctx.fillText(element.text, element.x, element.y);
      
      // Borde si está seleccionado
      if (selectedElement === element.id) {
        const metrics = ctx.measureText(element.text);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(
          element.x - 3, 
          element.y - element.fontSize - 3,
          metrics.width + 6, 
          element.fontSize + 6
        );
        ctx.setLineDash([]);
      }
    });

    // Dibujar elementos de imagen
    imageElements.forEach(element => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, element.x, element.y, element.width, element.height);
        
        // Borde si está seleccionado
        if (selectedElement === element.id) {
          ctx.strokeStyle = '#8b5cf6';
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(element.x - 3, element.y - 3, element.width + 6, element.height + 6);
          ctx.setLineDash([]);
        }
      };
      img.src = element.src;
    });
  }, [textElements, imageElements, selectedElement]);

  // Manejar clic en canvas
  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;

    if (isAddingText) {
      // Agregar nuevo texto
      const element: TextElement = {
        id: Date.now().toString(),
        text: newText,
        x,
        y,
        fontSize,
        color: textColor,
        fontFamily
      };

      setTextElements([...textElements, element]);
      setNewText('');
      setIsAddingText(false);
    } else if (isAddingImage) {
      // Agregar nueva imagen
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else {
      // Seleccionar elemento existente
      const clickedTextElement = textElements.find(element => {
        const ctx = canvas.getContext('2d')!;
        const textWidth = ctx.measureText(element.text).width;
        return x >= element.x && x <= element.x + textWidth &&
               y >= element.y - element.fontSize && y <= element.y;
      });

      const clickedImageElement = imageElements.find(element => {
        return x >= element.x && x <= element.x + element.width &&
               y >= element.y && y <= element.y + element.height;
      });

      setSelectedElement(clickedTextElement?.id || clickedImageElement?.id || null);
    }
  };

  // Manejar arrastre
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selectedElement) return;
    
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;
    
    const textElement = textElements.find(el => el.id === selectedElement);
    const imageElement = imageElements.find(el => el.id === selectedElement);
    
    if (textElement) {
      setDragOffset({ x: x - textElement.x, y: y - textElement.y });
      setIsDragging(true);
    } else if (imageElement) {
      setDragOffset({ x: x - imageElement.x, y: y - imageElement.y });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return;
    
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const x = (e.clientX - rect.left) * scale - dragOffset.x;
    const y = (e.clientY - rect.top) * scale - dragOffset.y;
    
    setTextElements(elements =>
      elements.map(el => 
        el.id === selectedElement 
          ? { ...el, x, y }
          : el
      )
    );

    setImageElements(elements =>
      elements.map(el => 
        el.id === selectedElement 
          ? { ...el, x, y }
          : el
      )
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Manejar carga de imagen
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const element: ImageElement = {
            id: Date.now().toString(),
            src: event.target?.result as string,
            x: 100,
            y: 100,
            width: img.width,
            height: img.height
          };
          setImageElements([...imageElements, element]);
          setIsAddingImage(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Eliminar elemento
  const deleteElement = (id: string) => {
    setTextElements(elements => elements.filter(el => el.id !== id));
    setImageElements(elements => elements.filter(el => el.id !== id));
    setSelectedElement(null);
  };

  // Guardar PDF
  const savePDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([800, 600]);
      
      // Agregar elementos de texto
      textElements.forEach(element => {
        page.drawText(element.text, {
          x: element.x,
          y: 600 - element.y,
          size: element.fontSize,
          color: rgb(0, 0, 0)
        });
      });
      
      const pdfBytes = await pdfDoc.save();
      onSave(pdfBytes);
    } catch (error) {
      console.error('Error guardando PDF:', error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header responsive */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 lg:p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-xl lg:text-2xl">📄</span>
            </div>
            <div>
              <h1 className="text-lg lg:text-2xl font-bold">Constructor de PDF</h1>
              <p className="text-blue-100 text-xs lg:text-sm">Diseña tu documento profesional</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <button
              onClick={() => setIsAddingText(true)}
              className="group relative overflow-hidden bg-white/20 hover:bg-white/30 px-3 lg:px-6 py-2 lg:py-3 rounded-lg transition-all duration-300 flex items-center gap-1 lg:gap-2 text-sm lg:text-base"
            >
              <span className="text-sm lg:text-lg">✏️</span>
              <span className="font-medium hidden sm:inline">Agregar Texto</span>
            </button>
            
            <button
              onClick={() => setIsAddingImage(true)}
              className="group relative overflow-hidden bg-white/20 hover:bg-white/30 px-3 lg:px-6 py-2 lg:py-3 rounded-lg transition-all duration-300 flex items-center gap-1 lg:gap-2 text-sm lg:text-base"
            >
              <span className="text-sm lg:text-lg">🖼️</span>
              <span className="font-medium hidden sm:inline">Agregar Imagen</span>
            </button>
            
            <button
              onClick={savePDF}
              className="bg-green-500 hover:bg-green-600 px-3 lg:px-6 py-2 lg:py-3 rounded-lg transition-all duration-300 flex items-center gap-1 lg:gap-2 shadow-lg text-sm lg:text-base"
            >
              <span className="text-sm lg:text-lg">💾</span>
              <span className="font-medium hidden sm:inline">Guardar PDF</span>
            </button>

            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-all duration-300"
            >
              <span className="text-lg">⚙️</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controles de texto */}
      {isAddingText && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Escribe el texto que quieres agregar..."
                  className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base lg:text-lg"
                />
              </div>
              <button
                onClick={() => setIsAddingText(false)}
                className="px-4 lg:px-6 py-2 lg:py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-700">Tamaño:</span>
                <input
                  type="range"
                  min="8"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-20 lg:w-24"
                />
                <span className="text-sm text-blue-600 w-8">{fontSize}px</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-700">Color:</span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 lg:w-10 h-8 lg:h-10 border rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-700">Fuente:</span>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="px-2 lg:px-3 py-1 lg:py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </div>
            </div>
            <p className="text-sm text-blue-600 mt-3">
              💡 Haz clic en el área del PDF para colocar el texto
            </p>
          </div>
        </div>
      )}

      {/* Controles de imagen */}
      {isAddingImage && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-purple-600 hover:bg-purple-700 px-4 lg:px-6 py-2 lg:py-3 rounded-lg transition-colors flex items-center gap-2 text-white"
              >
                <span className="text-sm lg:text-lg">📁</span>
                <span className="font-medium">Seleccionar Imagen</span>
              </button>
              <button
                onClick={() => setIsAddingImage(false)}
                className="px-4 lg:px-6 py-2 lg:py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
            <p className="text-sm text-purple-600 mt-3">
              💡 Selecciona una imagen y luego haz clic donde quieras colocarla
            </p>
          </div>
        </div>
      )}

      {/* Área de edición */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Canvas del PDF */}
        <div className="flex-1 p-2 lg:p-6 overflow-auto">
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl lg:shadow-2xl p-2 lg:p-6 h-full min-h-[400px]">
            <div className="flex justify-center items-center h-full">
              <div className="overflow-auto max-w-full max-h-full">
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className={`${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'} border-2 border-dashed border-gray-300 rounded-lg shadow-lg`}
                  style={{ display: 'block' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral responsive */}
        <div className={`${showSidebar ? 'block' : 'hidden'} lg:block w-full lg:w-80 bg-white border-t lg:border-l border-gray-200 shadow-xl`}>
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm font-medium transition-colors ${
                activeTab === 'tools' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🛠️ Herramientas
            </button>
            <button
              onClick={() => setActiveTab('elements')}
              className={`flex-1 px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm font-medium transition-colors ${
                activeTab === 'elements' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 Elementos
            </button>
          </div>

          <div className="p-3 lg:p-6 max-h-[400px] lg:max-h-none overflow-y-auto">
            {activeTab === 'tools' ? (
              <div className="space-y-4 lg:space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 lg:p-4">
                  <h3 className="text-sm lg:text-lg font-semibold text-blue-900 mb-3">Herramientas de Texto</h3>
                  <div className="space-y-3 lg:space-y-4">
                    <div>
                      <label className="text-xs lg:text-sm font-medium text-blue-700 mb-2 block">Tamaño de fuente</label>
                      <input
                        type="range"
                        min="8"
                        max="72"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-blue-600 mt-1">
                        <span>8px</span>
                        <span>{fontSize}px</span>
                        <span>72px</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs lg:text-sm font-medium text-blue-700 mb-2 block">Color del texto</label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-8 lg:h-12 border rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs lg:text-sm font-medium text-blue-700 mb-2 block">Tipo de fuente</label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full px-2 lg:px-3 py-1 lg:py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs lg:text-sm"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 lg:p-4">
                  <h3 className="text-sm lg:text-lg font-semibold text-green-900 mb-3">Acciones Rápidas</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setIsAddingText(true)}
                      className="w-full px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-xs lg:text-sm"
                    >
                      <span>✏️</span>
                      <span>Agregar Texto</span>
                    </button>
                    <button
                      onClick={() => setIsAddingImage(true)}
                      className="w-full px-3 lg:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-xs lg:text-sm"
                    >
                      <span>🖼️</span>
                      <span>Agregar Imagen</span>
                    </button>
                    <button
                      onClick={savePDF}
                      className="w-full px-3 lg:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-xs lg:text-sm"
                    >
                      <span>💾</span>
                      <span>Guardar PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 lg:space-y-4">
                {selectedElement && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 lg:p-4">
                    <h4 className="text-xs lg:text-sm font-medium text-yellow-900 mb-3">Editar elemento seleccionado</h4>
                    {(() => {
                      const textElement = textElements.find(el => el.id === selectedElement);
                      const imageElement = imageElements.find(el => el.id === selectedElement);
                      
                      if (textElement) {
                        return (
                          <div className="space-y-2 lg:space-y-3">
                            <input
                              type="text"
                              value={textElement.text}
                              onChange={(e) => {
                                setTextElements(elements =>
                                  elements.map(el => 
                                    el.id === selectedElement 
                                      ? { ...el, text: e.target.value }
                                      : el
                                  )
                                );
                              }}
                              className="w-full px-2 lg:px-3 py-1 lg:py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-xs lg:text-sm"
                            />
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={textElement.fontSize}
                                onChange={(e) => {
                                  setTextElements(elements =>
                                    elements.map(el => 
                                      el.id === selectedElement 
                                        ? { ...el, fontSize: Number(e.target.value) }
                                        : el
                                    )
                                  );
                                }}
                                min="8"
                                max="72"
                                className="w-16 lg:w-20 px-1 lg:px-2 py-1 border border-yellow-300 rounded text-xs"
                              />
                              <input
                                type="color"
                                value={textElement.color}
                                onChange={(e) => {
                                  setTextElements(elements =>
                                    elements.map(el => 
                                      el.id === selectedElement 
                                        ? { ...el, color: e.target.value }
                                        : el
                                    )
                                  );
                                }}
                                className="w-8 lg:w-10 h-6 lg:h-8 border rounded"
                              />
                              <button
                                onClick={() => deleteElement(selectedElement)}
                                className="px-2 lg:px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        );
                      } else if (imageElement) {
                        return (
                          <div className="space-y-2 lg:space-y-3">
                            <div className="text-xs lg:text-sm text-yellow-700">Imagen seleccionada</div>
                            <button
                              onClick={() => deleteElement(selectedElement)}
                              className="px-2 lg:px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                              Eliminar Imagen
                            </button>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
                
                <div className="space-y-3 lg:space-y-4">
                  <div>
                    <h4 className="text-xs lg:text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span>📝</span>
                      <span>Textos ({textElements.length})</span>
                    </h4>
                    <div className="space-y-2 max-h-32 lg:max-h-48 overflow-y-auto">
                      {textElements.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 text-xs lg:text-sm">
                          No hay textos agregados
                        </div>
                      ) : (
                        textElements.map(element => (
                          <div
                            key={element.id}
                            className={`p-2 lg:p-3 border rounded-lg cursor-pointer transition-all ${
                              selectedElement === element.id 
                                ? 'border-blue-500 bg-blue-50 shadow-md' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedElement(element.id)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs lg:text-sm truncate font-medium">{element.text}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteElement(element.id);
                                }}
                                className="text-red-500 hover:text-red-700 text-xs p-1"
                              >
                                ×
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {element.fontSize}px • {element.fontFamily}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs lg:text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span>🖼️</span>
                      <span>Imágenes ({imageElements.length})</span>
                    </h4>
                    <div className="space-y-2 max-h-32 lg:max-h-48 overflow-y-auto">
                      {imageElements.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 text-xs lg:text-sm">
                          No hay imágenes agregadas
                        </div>
                      ) : (
                        imageElements.map(element => (
                          <div
                            key={element.id}
                            className={`p-2 lg:p-3 border rounded-lg cursor-pointer transition-all ${
                              selectedElement === element.id 
                                ? 'border-purple-500 bg-purple-50 shadow-md' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedElement(element.id)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs lg:text-sm truncate font-medium">Imagen {element.id.slice(-4)}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteElement(element.id);
                                }}
                                className="text-red-500 hover:text-red-700 text-xs p-1"
                              >
                                ×
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {element.width} × {element.height}px
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFEditor; 