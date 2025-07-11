import React, { useState } from 'react'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { Download, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react'

const TestPDF: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    pdf: boolean | null
    excel: boolean | null
  }>({ pdf: null, excel: null })
  const [isTesting, setIsTesting] = useState(false)

  const testPDF = async () => {
    setIsTesting(true)
    setTestResults(prev => ({ ...prev, pdf: null }))
    
    try {
      const pdf = new jsPDF()
      pdf.text('Test PDF Generation - GUX Cotizador', 20, 20)
      pdf.text('Fecha: ' + new Date().toLocaleDateString('es-ES'), 20, 30)
      pdf.text('Estado: Funcionando correctamente', 20, 40)
      pdf.save('test-gux-cotizador.pdf')
      
      setTestResults(prev => ({ ...prev, pdf: true }))
      console.log('✅ PDF generado exitosamente')
    } catch (error) {
      console.error('❌ Error generando PDF:', error)
      setTestResults(prev => ({ ...prev, pdf: false }))
    } finally {
      setIsTesting(false)
    }
  }

  const testExcel = async () => {
    setIsTesting(true)
    setTestResults(prev => ({ ...prev, excel: null }))
    
    try {
      const wb = XLSX.utils.book_new()
      
      // Hoja de prueba
      const ws = XLSX.utils.aoa_to_sheet([
        ['GUX Cotizador - Test de Excel'],
        [''],
        ['Fecha', new Date().toLocaleDateString('es-ES')],
        ['Estado', 'Funcionando correctamente'],
        [''],
        ['Datos de Prueba'],
        ['Proyecto', 'Horas', 'Costo'],
        ['Test Project', 100, 6000],
        ['Otro Proyecto', 150, 9000]
      ])
      
      XLSX.utils.book_append_sheet(wb, ws, 'Test')
      XLSX.writeFile(wb, 'test-gux-cotizador.xlsx')
      
      setTestResults(prev => ({ ...prev, excel: true }))
      console.log('✅ Excel generado exitosamente')
    } catch (error) {
      console.error('❌ Error generando Excel:', error)
      setTestResults(prev => ({ ...prev, excel: false }))
    } finally {
      setIsTesting(false)
    }
  }

  const testBoth = async () => {
    await testPDF()
    await testExcel()
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        🧪 Test de Generación de Archivos
      </h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Este componente prueba que las librerías de PDF y Excel funcionen correctamente. 
          Si los tests pasan, el generador principal debería funcionar sin problemas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button 
          onClick={testPDF}
          disabled={isTesting}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          <Download size={16} />
          Test PDF
        </button>
        
        <button 
          onClick={testExcel}
          disabled={isTesting}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          <FileSpreadsheet size={16} />
          Test Excel
        </button>
        
        <button 
          onClick={testBoth}
          disabled={isTesting}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          Test Ambos
        </button>
      </div>

      {/* Resultados */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Resultados de las Pruebas:</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Download size={20} className="text-blue-600" />
              <span className="font-medium">Generación de PDF</span>
            </div>
            
            {testResults.pdf === null && (
              <p className="text-gray-500 text-sm">No probado</p>
            )}
            
            {testResults.pdf === true && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={16} />
                <span className="text-sm">✅ Funcionando correctamente</span>
              </div>
            )}
            
            {testResults.pdf === false && (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle size={16} />
                <span className="text-sm">❌ Error en la generación</span>
              </div>
            )}
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet size={20} className="text-green-600" />
              <span className="font-medium">Generación de Excel</span>
            </div>
            
            {testResults.excel === null && (
              <p className="text-gray-500 text-sm">No probado</p>
            )}
            
            {testResults.excel === true && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={16} />
                <span className="text-sm">✅ Funcionando correctamente</span>
              </div>
            )}
            
            {testResults.excel === false && (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle size={16} />
                <span className="text-sm">❌ Error en la generación</span>
              </div>
            )}
          </div>
        </div>

        {/* Instrucciones */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Instrucciones:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Haz clic en "Test PDF" para probar la generación de PDF</li>
            <li>• Haz clic en "Test Excel" para probar la generación de Excel</li>
            <li>• Haz clic en "Test Ambos" para probar ambas funcionalidades</li>
            <li>• Si ambos tests pasan, el generador principal debería funcionar</li>
            <li>• Revisa la carpeta de descargas para ver los archivos generados</li>
          </ul>
        </div>

        {/* Solución de problemas */}
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">Si hay errores:</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Verifica que el navegador permita descargas</li>
            <li>• Revisa la consola del navegador (F12) para errores detallados</li>
            <li>• Asegúrate de que no haya bloqueadores de popups activos</li>
            <li>• Intenta con un navegador diferente</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default TestPDF 