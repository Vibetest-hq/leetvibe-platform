import React, { useState, useEffect, useRef } from 'react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Badge } from './components/ui/badge'
import { Textarea } from './components/ui/textarea'
import { Play, TestTube, Sparkles, Code, User, Trophy, Send, X } from 'lucide-react'
import Editor from '@monaco-editor/react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

function App() {
  const [code, setCode] = useState(`def solution(nums, target):
    # Your code here
    pass`)
  const [output, setOutput] = useState('')
  const [testResults, setTestResults] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  
  // Inline prompt box state
  const [showPromptBox, setShowPromptBox] = useState(false)
  const [promptText, setPromptText] = useState('')
  const [promptPosition, setPromptPosition] = useState({ top: 0, left: 0 })
  const [selectedText, setSelectedText] = useState('')
  const editorRef = useRef(null)
  const promptBoxRef = useRef(null)

  useEffect(() => {
    fetchQuestions()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        handleShowPromptBox()
      }
      if (e.key === 'Escape') {
        setShowPromptBox(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions`)
      const data = await response.json()
      setQuestions(data)
      if (data.length > 0) {
        setCurrentQuestion(data[0])
        setCode(data[0].starter_code)
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error)
      // No fallback to Two Sum, rely on backend questions
    }
  }

  const handleShowPromptBox = () => {
    if (editorRef.current) {
      const editor = editorRef.current
      const selection = editor.getSelection()
      const selectedText = editor.getModel().getValueInRange(selection)
      
      setSelectedText(selectedText)
      
      // Get cursor position
      const position = editor.getPosition()
      const coords = editor.getScrolledVisiblePosition(position)
      
      if (coords) {
        setPromptPosition({
          top: coords.top + 30,
          left: coords.left
        })
      }
      
      setShowPromptBox(true)
      setPromptText('')
    }
  }

  const handlePromptSubmit = async () => {
    if (!promptText.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/ai-assist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Selected code: "${selectedText}"\n\nUser question: ${promptText}`,
          code: code
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setAiResponse(data.response)
        setShowPromptBox(false)
        setPromptText('')
      } else {
        setAiResponse(`Error: ${data.error}`)
      }
    } catch (error) {
      setAiResponse(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const runCode = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/execute-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          language: 'python'
        })
      })
      
      const data = await response.json()
      setOutput(data.output || data.error || 'No output')
    } catch (error) {
      setOutput(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const runTests = async () => {
    if (!currentQuestion) return
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/run-tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          question_id: currentQuestion.id // Use currentQuestion.id dynamically
        })
      })
      
      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      setTestResults({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'hard': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">LeetVibe</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                <span>Developer</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Problem */}
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg text-slate-900">
                      {currentQuestion?.title || 'Loading...'}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getDifficultyColor(currentQuestion?.difficulty)}>
                        {currentQuestion?.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-slate-600 border-slate-300">
                        {currentQuestion?.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-700 leading-relaxed">
                  {currentQuestion?.description}
                </CardDescription>
              </CardContent>
            </Card>

            {/* Question Selector */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-900">Available Problems</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {questions.map((question) => (
                    <button
                      key={question.id}
                      onClick={() => {
                        setCurrentQuestion(question)
                        setCode(question.starter_code)
                        setTestResults(null)
                        setOutput('')
                        setAiResponse('')
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        currentQuestion?.id === question.id
                          ? 'bg-slate-100 border-slate-300 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-medium text-sm">{question.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{question.category}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Response */}
            {aiResponse && (
              <Card className="border-blue-200 shadow-sm bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-blue-900 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Assistant</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-blue-800 whitespace-pre-wrap">{aiResponse}</div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Code Editor */}
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-slate-900">Code Editor</CardTitle>
                  <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    Press Ctrl+K for AI help
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative">
                  <Editor
                    height="400px"
                    defaultLanguage="python"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    onMount={(editor) => {
                      editorRef.current = editor
                    }}
                    theme="vs-light"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      padding: { top: 16, bottom: 16 }
                    }}
                  />
                  
                  {/* Inline Prompt Box */}
                  {showPromptBox && (
                    <div
                      ref={promptBoxRef}
                      className="absolute z-50 bg-white border border-slate-300 rounded-lg shadow-lg p-4 min-w-80"
                      style={{
                        top: promptPosition.top,
                        left: promptPosition.left,
                        maxWidth: '400px'
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-slate-900">Ask AI</span>
                        </div>
                        <button
                          onClick={() => setShowPromptBox(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {selectedText && (
                        <div className="mb-3 p-2 bg-slate-50 rounded text-xs text-slate-600 border">
                          Selected: "{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}"
                        </div>
                      )}
                      
                      <Textarea
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        placeholder="Ask about your code..."
                        className="mb-3 text-sm border-slate-300"
                        rows={3}
                        autoFocus
                      />
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPromptBox(false)}
                          className="text-slate-600 border-slate-300"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handlePromptSubmit}
                          disabled={loading || !promptText.trim()}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Send className="w-3 h-3 mr-1" />
                              Ask
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button 
                onClick={runCode} 
                disabled={loading}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Code
              </Button>
              <Button 
                onClick={runTests} 
                disabled={loading || !currentQuestion}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Run Tests
              </Button>
            </div>

            {/* Output Tabs */}
            <Card className="border-slate-200 shadow-sm">
              <Tabs defaultValue="output" className="w-full">
                <CardHeader className="pb-3">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-100">
                    <TabsTrigger value="output" className="text-slate-700">Output</TabsTrigger>
                    <TabsTrigger value="tests" className="text-slate-700">Test Results</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent>
                  <TabsContent value="output" className="mt-0">
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm min-h-32">
                      <pre className="whitespace-pre-wrap">{output || 'Run your code to see output...'}</pre>
                    </div>
                  </TabsContent>
                  <TabsContent value="tests" className="mt-0">
                    <div className="space-y-3">
                      {testResults ? (
                        testResults.error ? (
                          <div className="text-red-600 text-sm">{testResults.error}</div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-900">
                                Test Results
                              </span>
                              <Badge className={testResults.summary?.passed === testResults.summary?.total ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
                                {testResults.summary?.success_rate}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              {testResults.results?.map((result, index) => (
                                <div key={index} className={`p-3 rounded-lg border text-sm ${
                                  result.passed 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                    : 'bg-red-50 border-red-200 text-red-800'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">Test {result.test_case}</span>
                                    <span className={result.passed ? 'text-emerald-600' : 'text-red-600'}>
                                      {result.passed ? '✓ PASS' : '✗ FAIL'}
                                    </span>
                                  </div>
                                  <div className="mt-1 text-xs opacity-75">
                                    Expected: {JSON.stringify(result.expected)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )
                      ) : (
                        <div className="text-slate-500 text-sm">Run tests to see results...</div>
                      )}
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

