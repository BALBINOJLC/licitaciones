import React from 'react'
import jsPDF from 'jspdf'

const OfertaTecnicaPDF: React.FC = () => {
  const handleDownload = () => {
    const doc = new jsPDF()
    doc.setFontSize(28)
    doc.text('Oferta Técnica', 105, 80, { align: 'center' })
    doc.save('oferta_tecnica.pdf')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <button
        onClick={handleDownload}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition"
      >
        Descargar Oferta Técnica
      </button>
    </div>
  )
}

export default OfertaTecnicaPDF 