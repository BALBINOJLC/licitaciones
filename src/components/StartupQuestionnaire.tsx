import React, { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle, Circle, Info } from 'lucide-react'
import { startupQuestions, calculateStartupHours, StartupQuestion } from '../data/startupQuestions'

interface StartupQuestionnaireProps {
  onComplete: (answers: Record<string, any>, calculations: any) => void
}

const StartupQuestionnaire: React.FC<StartupQuestionnaireProps> = ({ onComplete }) => {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Información Básica']))
  const [currentStep, setCurrentStep] = useState(1)
  const [calculations, setCalculations] = useState<any>(null)

  // Agrupar preguntas por categoría
  const questionsByCategory = startupQuestions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = []
    }
    acc[question.category].push(question)
    return acc
  }, {} as Record<string, StartupQuestion[]>)

  const categories = Object.keys(questionsByCategory)

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || []
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentAnswers, option]
        }
      } else {
        return {
          ...prev,
          [questionId]: currentAnswers.filter((ans: string) => ans !== option)
        }
      }
    })
  }

  const isQuestionAnswered = (question: StartupQuestion): boolean => {
    const answer = answers[question.id]
    if (!answer) return false
    
    if (Array.isArray(answer)) {
      return answer.length > 0
    }
    
    return answer !== ''
  }

  const getAnsweredCount = (category: string): number => {
    return questionsByCategory[category].filter(isQuestionAnswered).length
  }

  const getTotalQuestions = (category: string): number => {
    return questionsByCategory[category].length
  }

  const calculateProgress = () => {
    const totalQuestions = startupQuestions.length
    const answeredQuestions = startupQuestions.filter(isQuestionAnswered).length
    return Math.round((answeredQuestions / totalQuestions) * 100)
  }

  const handleCalculate = () => {
    const results = calculateStartupHours(answers)
    setCalculations(results)
  }

  const handleComplete = () => {
    if (calculations) {
      onComplete(answers, calculations)
    }
  }

  const renderQuestion = (question: StartupQuestion) => {
    const answer = answers[question.id] || (question.type === 'checkbox' ? [] : '')

    switch (question.type) {
      case 'select':
        return (
          <select
            className="input-field"
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          >
            <option value="">Selecciona una opción</option>
            {question.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map(option => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={answer.includes(option)}
                  onChange={(e) => handleCheckboxChange(question.id, option, e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map(option => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'number':
        return (
          <input
            type="number"
            className="input-field"
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value) || 0)}
            min="0"
          />
        )

      case 'text':
        return (
          <textarea
            className="input-field"
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={3}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Progreso del Cuestionario
          </h3>
          <span className="text-sm font-medium text-gray-600">
            {calculateProgress()}% completado
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Responde todas las preguntas para obtener una estimación precisa
        </p>
      </div>

      {/* Questions by Category */}
      <div className="space-y-4">
        {categories.map(category => {
          const isExpanded = expandedCategories.has(category)
          const answeredCount = getAnsweredCount(category)
          const totalCount = getTotalQuestions(category)

          return (
            <div key={category} className="bg-white rounded-lg border border-gray-200">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                  <span className="text-sm text-gray-500">
                    ({answeredCount}/{totalCount})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {answeredCount === totalCount ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <Circle className="text-gray-400" size={20} />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 space-y-6">
                  {questionsByCategory[category].map(question => (
                    <div key={question.id} className="space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-900 mb-1">
                            {question.question}
                          </label>
                          {question.description && (
                            <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                              <Info size={14} />
                              {question.description}
                            </p>
                          )}
                        </div>
                        {isQuestionAnswered(question) && (
                          <CheckCircle className="text-green-600 mt-1" size={16} />
                        )}
                      </div>
                      {renderQuestion(question)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center bg-white rounded-lg p-6 border border-gray-200">
        <div className="text-sm text-gray-600">
          {calculateProgress()}% completado • {startupQuestions.filter(isQuestionAnswered).length} de {startupQuestions.length} preguntas
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCalculate}
            disabled={calculateProgress() < 50}
            className="btn-secondary"
          >
            Calcular Estimación
          </button>
          <button
            onClick={handleComplete}
            disabled={!calculations}
            className="btn-primary"
          >
            Generar Propuesta
          </button>
        </div>
      </div>

      {/* Results Preview */}
      {calculations && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Estimación Calculada
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Horas Totales</div>
              <div className="text-2xl font-bold text-blue-600">{calculations.totalHours}h</div>
            </div>
            <div className="bg-white rounded p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Costo Estimado</div>
              <div className="text-2xl font-bold text-green-600">${calculations.estimatedCost.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Timeline</div>
              <div className="text-2xl font-bold text-purple-600">{calculations.timeline} semanas</div>
            </div>
            <div className="bg-white rounded p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Tarifa Promedio</div>
              <div className="text-2xl font-bold text-orange-600">$60/h</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StartupQuestionnaire 