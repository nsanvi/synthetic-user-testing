# Synthetic User Testing - Validación IA para Startups

Una herramienta de validación de ideas de startup mediante entrevistas sintéticas con IA.

## 🚀 Despliegue en Vercel (5 minutos)

### Paso 1: Preparar el código en GitHub

1. Ve a https://github.com/nsanvi
2. Click en "New repository" (botón verde)
3. Nombre del repo: `synthetic-user-testing`
4. Marca como **Public**
5. Click "Create repository"

### Paso 2: Subir el código

Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/nsanvi/synthetic-user-testing.git
git push -u origin main
```

### Paso 3: Desplegar en Vercel

1. Ve a https://vercel.com/signup
2. Click "Continue with GitHub"
3. Autoriza Vercel
4. Click "Import Project"
5. Busca `synthetic-user-testing`
6. Click "Import"
7. **Framework Preset**: Vite
8. **Build Command**: `npm run build`
9. **Output Directory**: `dist`
10. Click "Deploy"

**¡LISTO!** En 2 minutos tendrás tu URL tipo: `https://synthetic-user-testing-xyz.vercel.app`

## 🎯 Cómo usar en la entrevista

### Para conseguir API Key de Anthropic (GRATIS):

1. Ve a https://console.anthropic.com
2. Sign up con email
3. Ve a "API Keys"
4. Click "Create Key"
5. Copia la key que empieza con `sk-ant-...`

### Demostración en vivo:

1. Abre tu URL de Vercel
2. Pega tu API key
3. Ejemplo de startup: "Plataforma que conecta estudiantes universitarios con mentores de su industria para sesiones de 30min pagadas"
4. Segmento: "Estudiantes de último año de ingeniería y business"
5. Click "Generar 5 personas"
6. Realiza 1-2 entrevistas cortas (5-7 preguntas cada una)
7. Muestra el reporte con red flags

## 💡 Valor que aporta (para explicar en la entrevista)

### No es "AI humo" porque:

1. **Metodología real**: Implementa Mom Test y Jobs-to-be-done
2. **Detecta sesgos**: Alerta de preguntas leading en tiempo real
3. **Red flags accionables**: No solo "feedback positivo", sino problemas reales
4. **Educativo**: Te enseña a entrevistar mejor para las entrevistas reales

### Cuándo usarlo vs. entrevistas reales:

- ✅ Usar para: Detectar fallas obvias, practicar preguntas, validar hipótesis básicas
- ❌ NO usar para: Validar precio real, encontrar early adopters, descubrir problemas desconocidos

### Casos de uso en venture building:

1. **Pre-inversión**: Filtrar ideas antes de asignar recursos
2. **Formación**: Entrenar associates en validación
3. **Pivots rápidos**: Testear variaciones de propuesta de valor
4. **Due diligence**: Verificar que founders hicieron discovery

## 🛠️ Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## 📊 Estructura del proyecto

```
synthetic-user-testing/
├── src/
│   ├── App.jsx          # Componente principal con toda la lógica
│   ├── main.jsx         # Entry point
│   └── index.css        # Estilos Tailwind
├── index.html           # HTML base
├── package.json         # Dependencias
├── vite.config.js       # Config de Vite
└── tailwind.config.js   # Config de Tailwind
```

## 🎨 Features

- ✅ Generación de 5 personas diversas con diferentes niveles de dolor
- ✅ Entrevistas interactivas con sugerencias de preguntas (Mom Test)
- ✅ Detección de preguntas leading en tiempo real
- ✅ Análisis automático con red flags y green flags
- ✅ Puntuación de calidad de entrevista
- ✅ Recomendaciones accionables
- ✅ UI profesional con Tailwind CSS
- ✅ 100% client-side (no necesita backend)

## 🚨 Troubleshooting

**Error: API key inválida**
- Verifica que copiaste bien la key de console.anthropic.com
- Asegúrate que empieza con `sk-ant-`

**No se generan las personas**
- Revisa la consola del navegador (F12)
- Verifica que completaste todos los campos

**Deploy falla en Vercel**
- Asegúrate que seleccionaste "Vite" como framework
- Verifica que el output directory sea `dist`

## 📝 Próximas mejoras (mencionar en entrevista)

1. Guardar sesiones en localStorage
2. Exportar reportes en PDF
3. Biblioteca de personas pre-definidas por industria
4. Integración con notion/airtable para trackear validaciones
5. Modo "coach": IA que te entrena antes de entrevistas reales
