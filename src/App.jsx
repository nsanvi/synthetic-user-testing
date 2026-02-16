import React, { useState } from 'react';
import { Lightbulb, Users, MessageSquare, FileText, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

function App() {
  const [step, setStep] = useState('setup'); // setup, interview, analysis
  const [startupIdea, setStartupIdea] = useState('');
  const [targetSegment, setTargetSegment] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [currentPersona, setCurrentPersona] = useState(0);
  const [personas, setPersonas] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [warnings, setWarnings] = useState([]);

  const generatePersonas = async () => {
    if (!startupIdea.trim() || !targetSegment.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: `Genera exactamente 5 personas diversas para validar esta startup idea:

IDEA: ${startupIdea}
SEGMENTO OBJETIVO: ${targetSegment}

Para cada persona, devuelve un JSON con esta estructura:
{
  "personas": [
    {
      "nombre": "nombre ficticio",
      "edad": número,
      "profesion": "profesión",
      "contexto": "breve descripción de su situación vital y profesional",
      "job_to_be_done": "qué trabajo/problema necesita resolver (no mencionar la startup)",
      "objeciones_probables": ["objeción 1", "objeción 2"],
      "nivel_dolor": "alto/medio/bajo",
      "personalidad": "breve descripción de cómo se comportaría en una entrevista"
    }
  ]
}

IMPORTANTE: 
- Haz las personas REALISTAS y DIVERSAS (diferentes niveles de dolor, contextos, objeciones)
- Al menos 1 persona debe ser escéptica o tener bajo nivel de dolor
- NO inventes que conocen o necesitan la solución, describe sus problemas reales
- Responde SOLO con el JSON, sin texto adicional`
          }]
        })
      });

      const data = await response.json();
      const content = data.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setPersonas(parsed.personas);
        setStep('interview');
        startInterview(0, parsed.personas);
      }
    } catch (error) {
      alert('Error generando personas: ' + error.message);
    }
    setIsLoading(false);
  };

  const startInterview = async (personaIndex, personasData) => {
    const persona = personasData[personaIndex];
    const initialMessages = [
      {
        role: 'system',
        content: `Estás siendo entrevistado sobre tus necesidades y problemas. NO conoces la startup "${startupIdea}".

TU PERFIL:
- Nombre: ${persona.nombre}
- Edad: ${persona.edad}
- Profesión: ${persona.profesion}
- Contexto: ${persona.contexto}
- Job-to-be-done: ${persona.job_to_be_done}
- Nivel de dolor: ${persona.nivel_dolor}
- Personalidad: ${persona.personalidad}

COMPORTAMIENTO EN LA ENTREVISTA:
1. Responde basándote SOLO en tu contexto y problemas reales
2. Si te preguntan si usarías una solución, sé honesto sobre tus reservas
3. NO finjas entusiasmo si no lo sentirías realmente
4. Menciona objeciones naturalmente cuando sean relevantes: ${persona.objeciones_probables.join(', ')}
5. Si nivel_dolor es bajo, muestra poco interés
6. Responde de forma natural y conversacional, como en una entrevista real
7. NO menciones que eres una IA o simulación

El entrevistador te va a hacer preguntas. Responde como esta persona respondería.`
      },
      {
        role: 'assistant',
        content: `Hola, gracias por tu tiempo. Estoy investigando sobre [el entrevistador explicará]. ¿Te parece bien si te hago algunas preguntas?`
      }
    ];
    
    setMessages(initialMessages);
    generateSuggestions(personaIndex);
  };

  const generateSuggestions = (personaIndex) => {
    const baseSuggestions = [
      "¿Puedes contarme sobre la última vez que tuviste [problema relacionado]?",
      "¿Cómo resuelves actualmente [situación]?",
      "¿Qué es lo más frustrante de tu proceso actual?",
      "¿Has probado otras soluciones? ¿Qué pasó?"
    ];
    
    setSuggestions(baseSuggestions);
  };

  const sendMessage = async (messageText) => {
    const textToSend = messageText || userInput;
    if (!textToSend.trim()) return;

    // Detectar preguntas leading
    const leadingPhrases = ['¿no crees que', '¿verdad que', 'imagina que', 'si tuvieras'];
    const isLeading = leadingPhrases.some(phrase => textToSend.toLowerCase().includes(phrase));
    
    if (isLeading) {
      setWarnings(prev => [...prev, {
        type: 'leading',
        text: '⚠️ Pregunta leading detectada - reformula sin sugerir la respuesta',
        question: textToSend
      }]);
    }

    const newMessages = [...messages, {
      role: 'user',
      content: textToSend
    }];
    
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: newMessages[0].content,
          messages: newMessages.slice(1).map(m => ({
            role: m.role === 'system' ? 'user' : m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();
      const reply = data.content[0].text;
      
      setMessages([...newMessages, {
        role: 'assistant',
        content: reply
      }]);
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setIsLoading(false);
  };

  const finishInterview = () => {
    const interviewData = {
      persona: personas[currentPersona],
      messages: messages,
      warnings: warnings
    };
    
    const newInterviews = [...interviews, interviewData];
    setInterviews(newInterviews);

    if (currentPersona < personas.length - 1) {
      setCurrentPersona(currentPersona + 1);
      setMessages([]);
      setWarnings([]);
      startInterview(currentPersona + 1, personas);
    } else {
      setStep('analysis');
      generateAnalysis(newInterviews);
    }
  };

  const generateAnalysis = async (interviewsData) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 3000,
          messages: [{
            role: 'user',
            content: `Analiza estas ${interviewsData.length} entrevistas de validación de startup y genera un reporte con red flags.

STARTUP IDEA: ${startupIdea}

ENTREVISTAS:
${JSON.stringify(interviewsData, null, 2)}

Genera un análisis en formato JSON con:
{
  "red_flags": [
    {
      "severidad": "alta/media/baja",
      "titulo": "título breve",
      "descripcion": "explicación del problema",
      "evidencia": "citas de las entrevistas"
    }
  ],
  "green_flags": [similar estructura],
  "calidad_entrevista": {
    "puntuacion": 0-10,
    "problemas": ["problema 1", "problema 2"],
    "aciertos": ["acierto 1", "acierto 2"]
  },
  "recomendaciones": ["recomendación 1", "recomendación 2"],
  "siguiente_paso": "qué hacer ahora"
}

CRITERIOS RED FLAGS:
- Preguntas leading del entrevistador
- Personas que dicen que "es buena idea" pero no articularían pagar
- Ninguna objeción fuerte mencionada
- Problema no articulado espontáneamente
- Soluciones actuales que funcionan bien

Responde SOLO con el JSON.`
          }]
        })
      });

      const data = await response.json();
      const content = data.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        setAnalysisData(analysis);
      }
    } catch (error) {
      console.error('Error generando análisis:', error);
    }
    setIsLoading(false);
  };

  const [analysisData, setAnalysisData] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        <header className="text-center mb-12 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Synthetic User Testing
          </h1>
          <p className="text-gray-600 text-lg">
            Valida tu startup antes de invertir en entrevistas reales
          </p>
        </header>

        {step === 'setup' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="text-yellow-500" size={32} />
              <h2 className="text-2xl font-bold">Configura tu validación</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  API Key de Anthropic
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Consíguela gratis en console.anthropic.com
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Describe tu idea de startup
                </label>
                <textarea
                  value={startupIdea}
                  onChange={(e) => setStartupIdea(e.target.value)}
                  placeholder="Ej: Una plataforma que conecta freelancers con empresas para proyectos cortos, con pagos garantizados en 48h"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Segmento objetivo
                </label>
                <input
                  type="text"
                  value={targetSegment}
                  onChange={(e) => setTargetSegment(e.target.value)}
                  placeholder="Ej: Freelancers de diseño gráfico con 2-5 años de experiencia"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={generatePersonas}
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? 'Generando personas...' : (
                  <>
                    Generar 5 personas <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'interview' && personas.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Entrevista {currentPersona + 1}/5</h2>
                <span className="text-sm text-gray-500">
                  {personas[currentPersona].nombre}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4 h-96 overflow-y-auto">
                {messages.slice(1).map((msg, idx) => (
                  <div key={idx} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white border border-gray-200'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="text-left">
                    <div className="inline-block bg-white border border-gray-200 p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  {warnings.map((w, idx) => (
                    <div key={idx} className="text-sm text-yellow-800 flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{w.text}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Escribe tu pregunta..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={isLoading}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Enviar
                </button>
              </div>

              <button
                onClick={finishInterview}
                className="w-full mt-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Terminar entrevista y {currentPersona < personas.length - 1 ? 'continuar con la siguiente' : 'ver análisis'}
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Users size={20} />
                Persona actual
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold">Nombre:</span> {personas[currentPersona].nombre}
                </div>
                <div>
                  <span className="font-semibold">Profesión:</span> {personas[currentPersona].profesion}
                </div>
                <div>
                  <span className="font-semibold">Contexto:</span> {personas[currentPersona].contexto}
                </div>
                <div>
                  <span className="font-semibold">Nivel de dolor:</span>{' '}
                  <span className={`px-2 py-1 rounded ${
                    personas[currentPersona].nivel_dolor === 'alto' ? 'bg-red-100 text-red-700' :
                    personas[currentPersona].nivel_dolor === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {personas[currentPersona].nivel_dolor}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3 text-sm">💡 Preguntas sugeridas (Mom Test)</h4>
                <div className="space-y-2">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(sug)}
                      className="w-full text-left text-xs bg-indigo-50 hover:bg-indigo-100 p-2 rounded border border-indigo-200 transition"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'analysis' && analysisData && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <FileText className="text-indigo-600" />
              Reporte de Validación
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-4 text-red-900 flex items-center gap-2">
                  <AlertCircle />
                  Red Flags ({analysisData.red_flags.length})
                </h3>
                {analysisData.red_flags.map((flag, idx) => (
                  <div key={idx} className="mb-4 pb-4 border-b border-red-200 last:border-0">
                    <div className="font-semibold text-red-900">{flag.titulo}</div>
                    <div className="text-sm text-red-700 mt-1">{flag.descripcion}</div>
                    {flag.evidencia && (
                      <div className="text-xs text-red-600 mt-2 italic">"{flag.evidencia}"</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-4 text-green-900 flex items-center gap-2">
                  <CheckCircle />
                  Green Flags ({analysisData.green_flags.length})
                </h3>
                {analysisData.green_flags.map((flag, idx) => (
                  <div key={idx} className="mb-4 pb-4 border-b border-green-200 last:border-0">
                    <div className="font-semibold text-green-900">{flag.titulo}</div>
                    <div className="text-sm text-green-700 mt-1">{flag.descripcion}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-lg mb-3">Calidad de tu entrevista: {analysisData.calidad_entrevista.puntuacion}/10</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-red-700">Problemas detectados:</h4>
                  <ul className="text-sm space-y-1">
                    {analysisData.calidad_entrevista.problemas.map((p, idx) => (
                      <li key={idx}>• {p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-green-700">Aciertos:</h4>
                  <ul className="text-sm space-y-1">
                    {analysisData.calidad_entrevista.aciertos.map((a, idx) => (
                      <li key={idx}>• {a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-lg mb-3">Recomendaciones</h3>
              <ul className="space-y-2">
                {analysisData.recomendaciones.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ArrowRight className="text-indigo-600 flex-shrink-0 mt-1" size={16} />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-indigo-600 text-white rounded-lg p-6 text-center">
              <h3 className="font-bold text-xl mb-2">Siguiente paso</h3>
              <p className="text-lg">{analysisData.siguiente_paso}</p>
            </div>

            <button
              onClick={() => {
                setStep('setup');
                setInterviews([]);
                setPersonas([]);
                setAnalysisData(null);
              }}
              className="w-full mt-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Hacer otra validación
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
