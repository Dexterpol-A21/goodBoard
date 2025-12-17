import { useState, useEffect, useMemo, useRef } from 'react'
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import CourseCharts from './components/CourseCharts'
import DistributionChart from './components/DistributionChart'
import OverallPerformanceChart from './components/OverallPerformanceChart'
import './index.css'

const SyncView = () => {
  const [progress, setProgress] = useState({
    courses: { status: 'waiting', count: 0, lastSync: null },
    grades: { status: 'waiting', count: 0, lastSync: null },
    tasks: { status: 'waiting', count: 0, lastSync: null }
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rawData, setRawData] = useState(null);
  const [rawDataTitle, setRawDataTitle] = useState('');
  const [syncedCourses, setSyncedCourses] = useState([]);
  const [showCourseDetailsList, setShowCourseDetailsList] = useState(false);

  const handleViewData = (key, title) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get([key], (result) => {
              setRawData(result[key]);
              setRawDataTitle(title);
          });
      }
  };

  const fetchData = () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        // Get all data to find dynamic course keys
        chrome.storage.local.get(null, (result) => {
            setProgress({
                courses: { 
                    status: result.goodBoardCourses?.length ? 'success' : 'waiting', 
                    count: result.goodBoardCourses?.length || 0,
                    lastSync: result.lastSyncCourses
                },
                grades: { 
                    status: result.goodBoardGrades?.length ? 'success' : 'waiting', 
                    count: result.goodBoardGrades?.length || 0,
                    lastSync: result.lastSyncGrades
                },
                tasks: { 
                    status: result.goodBoardTasks?.length ? 'success' : 'waiting', 
                    count: result.goodBoardTasks?.length || 0,
                    lastSync: result.lastSyncTasks
                }
            });

            // Find all course details
            const details = Object.keys(result)
                .filter(k => k.startsWith('course_details_'))
                .map(k => result[k])
                .filter(d => d && d.title);
            
            setSyncedCourses(details);
        });
    }
  };

  useEffect(() => {
    fetchData();
    // Listen for changes
    const listener = (changes) => {
        fetchData();
    };
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.onChanged.addListener(listener);
    }
    return () => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.onChanged.removeListener(listener);
        }
    }
  }, []);

  const handleClearData = () => {
      if (showDeleteConfirm) {
          chrome.storage.local.clear(() => {
              fetchData();
              setShowDeleteConfirm(false);
          });
      } else {
          setShowDeleteConfirm(true);
          setTimeout(() => setShowDeleteConfirm(false), 3000);
      }
  };

  const steps = [
    { 
        key: 'courses', 
        label: '1. Lista de Cursos', 
        icon: 'school',
        url: 'https://uvmonline.blackboard.com/ultra/course',
        desc: 'Abre la lista de cursos y espera a que carguen todas tus materias.'
    },
    { 
        key: 'grades', 
        label: '2. Calificaciones Globales', 
        icon: 'grade',
        url: 'https://uvmonline.blackboard.com/ultra/grades',
        desc: 'Entra aquí para que GoodBoard capture tus promedios generales.'
    },
    { 
        key: 'tasks', 
        label: '3. Calendario', 
        icon: 'calendar_month',
        url: 'https://uvmonline.blackboard.com/ultra/calendar',
        desc: 'Abre el calendario para sincronizar fechas de entrega y tareas.'
    }
  ];

  const openLink = (url) => {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
          chrome.tabs.create({ url: url });
      } else {
          window.open(url, '_blank');
      }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background-dark">
        <header className="flex-none px-6 py-6 md:px-10 md:py-8 border-b border-border-dark bg-background-dark/95 backdrop-blur z-10 sticky top-0">
            <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">Sincronización</h1>
                    <p className="text-text-secondary text-base font-normal">Gestiona la conexión con Blackboard y el estado de tus datos.</p>
                </div>
            </div>
        </header>
        <div className="w-full p-8">
            <div className="bg-surface-dark border border-border-dark rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">sync_alt</span>
                    Guía de Sincronización
                </h2>
                
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 text-sm flex items-start gap-3 mb-6">
                    <span className="material-symbols-outlined text-xl mt-0.5">info</span>
                    <div className="flex flex-col gap-1">
                        <p className="font-bold">¿Cómo sincronizar?</p>
                        <p>GoodBoard funciona automáticamente mientras navegas. Para asegurar que tengas todos los datos:</p>
                        <ol className="list-decimal list-inside mt-1 space-y-1 opacity-90">
                            <li>Haz clic en el botón <strong>"Ir a Sincronizar"</strong> de cada sección.</li>
                            <li>Espera a que la página de Blackboard cargue completamente.</li>
                            <li>Regresa aquí y verifica que aparezca el <span className="text-green-400 font-bold">✓</span> verde.</li>
                        </ol>
                    </div>
                </div>

                <div className="space-y-4">
                    {steps.map((step) => {
                    const status = progress[step.key]?.status || 'waiting';
                    const count = progress[step.key]?.count || 0;
                    const lastSync = progress[step.key]?.lastSync;
                    const isSuccess = status === 'success' && count > 0;
                    
                    return (
                        <div key={step.key} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-surface-lighter/20 border border-white/5 hover:border-primary/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${isSuccess ? 'bg-green-500/20 text-green-400' : 'bg-surface-lighter text-text-secondary'}`}>
                                <span className="material-symbols-outlined text-2xl">{step.icon}</span>
                                </div>
                                <div>
                                <p className="font-bold text-white text-lg">{step.label}</p>
                                <p className="text-sm text-text-secondary mb-1">{step.desc}</p>
                                <div className="flex flex-col">
                                    <p className={`text-xs font-bold ${isSuccess ? 'text-green-400' : 'text-yellow-500'}`}>
                                        {isSuccess ? `✓ Sincronizado (${count} elementos)` : '⚠ Pendiente'}
                                    </p>
                                    {lastSync && (
                                        <p className="text-xs text-text-secondary mt-0.5">
                                            Última sinc: {new Date(lastSync).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => openLink(step.url)}
                                className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${isSuccess ? 'bg-surface-lighter text-text-secondary hover:text-white' : 'bg-primary text-black hover:bg-primary/90'}`}
                            >
                                {isSuccess ? 'Visitar de nuevo' : 'Ir a Sincronizar'}
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                            </button>
                        </div>
                    );
                    })}
                </div>
            </div>

            {/* Bento Grid for Data State */}
            <div className="bg-surface-dark border border-border-dark rounded-xl p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">database</span>
                        Estado de Datos
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
                        <span className="material-symbols-outlined text-[14px]">info</span>
                        Para actualizar, visita las páginas correspondientes en Blackboard.
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Cursos Card */}
                    <div 
                        onClick={() => handleViewData('goodBoardCourses', 'Cursos')}
                        className="p-4 bg-background-dark rounded-lg border border-border-dark hover:border-primary/30 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">school</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${progress.courses.status === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                                {progress.courses.status === 'success' ? 'OK' : 'Vacío'}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-white">{progress.courses.count}</span>
                            <span className="text-xs text-text-secondary font-medium">Cursos Detectados</span>
                            <span className="text-[10px] text-text-secondary/60 mt-2 font-mono">
                                {progress.courses.lastSync ? new Date(progress.courses.lastSync).toLocaleString() : 'Sin sincronizar'}
                            </span>
                        </div>
                    </div>

                    {/* Calificaciones Card */}
                    <div 
                        onClick={() => handleViewData('goodBoardGrades', 'Calificaciones')}
                        className="p-4 bg-background-dark rounded-lg border border-border-dark hover:border-primary/30 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">grade</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${progress.grades.status === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                                {progress.grades.status === 'success' ? 'OK' : 'Vacío'}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-white">{progress.grades.count}</span>
                            <span className="text-xs text-text-secondary font-medium">Calificaciones Globales</span>
                            <span className="text-[10px] text-text-secondary/60 mt-2 font-mono">
                                {progress.grades.lastSync ? new Date(progress.grades.lastSync).toLocaleString() : 'Sin sincronizar'}
                            </span>
                        </div>
                    </div>

                    {/* Tareas Card */}
                    <div 
                        onClick={() => handleViewData('goodBoardTasks', 'Tareas')}
                        className="p-4 bg-background-dark rounded-lg border border-border-dark hover:border-primary/30 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">calendar_month</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${progress.tasks.status === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                                {progress.tasks.status === 'success' ? 'OK' : 'Vacío'}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-white">{progress.tasks.count}</span>
                            <span className="text-xs text-text-secondary font-medium">Eventos en Calendario</span>
                            <span className="text-[10px] text-text-secondary/60 mt-2 font-mono">
                                {progress.tasks.lastSync ? new Date(progress.tasks.lastSync).toLocaleString() : 'Sin sincronizar'}
                            </span>
                        </div>
                    </div>

                    {/* Detalles de Materias Card (Summary) */}
                    <div 
                        onClick={() => setShowCourseDetailsList(!showCourseDetailsList)}
                        className="p-4 bg-background-dark rounded-lg border border-border-dark hover:border-primary/30 transition-all group cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">folder_open</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${syncedCourses.length > 0 ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                                {syncedCourses.length > 0 ? 'OK' : 'Vacío'}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-white">{syncedCourses.length}</span>
                            <span className="text-xs text-text-secondary font-medium">Materias con Detalle</span>
                            <span className="text-[10px] text-text-secondary/60 mt-2 font-mono">
                                Datos cacheados localmente
                            </span>
                        </div>
                    </div>
                </div>

                {/* Detailed Courses List (Inside Data State) */}
                {showCourseDetailsList && syncedCourses.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border-dark/50">
                        <h3 className="text-sm font-bold text-white mb-3">Detalle por Materia</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {syncedCourses.map((c, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => handleViewData(`course_details_${c.title.replace(/[^a-zA-Z0-9]/g, '_')}`, c.title)}
                                    className="flex items-center justify-between p-3 bg-surface-lighter/10 rounded border border-border-dark/50 hover:bg-surface-lighter/20 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="size-2 rounded-full bg-primary shrink-0"></div>
                                        <span className="text-xs text-text-secondary font-medium truncate" title={c.title}>{c.title}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-white bg-surface-dark px-1.5 py-0.5 rounded border border-border-dark">
                                        {c.grades?.length || 0} items
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {rawData && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8" onClick={() => setRawData(null)}>
                        <div className="bg-surface-dark border border-border-dark rounded-xl p-6 w-full max-w-4xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white">Datos Raw: {rawDataTitle}</h3>
                                <button onClick={() => setRawData(null)} className="text-text-secondary hover:text-white">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <pre className="flex-1 overflow-auto bg-black/50 p-4 rounded-lg text-xs font-mono text-green-400 whitespace-pre-wrap">
                                {JSON.stringify(rawData, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-surface-dark border border-border-dark rounded-xl p-6 flex flex-col justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-400">delete</span>
                        Zona de Peligro
                    </h2>
                    <p className="text-sm text-text-secondary mb-4">
                        Si experimentas problemas con los datos o quieres reiniciar, puedes borrar toda la información almacenada localmente.
                    </p>
                </div>
                <button 
                    onClick={handleClearData}
                    className={`w-full py-3 px-4 border rounded-lg transition-all font-bold flex items-center justify-center gap-2 ${
                        showDeleteConfirm 
                        ? 'bg-red-600 text-white border-red-700 hover:bg-red-700' 
                        : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                    }`}
                >
                    <span className="material-symbols-outlined">
                        {showDeleteConfirm ? 'warning' : 'delete_forever'}
                    </span>
                    {showDeleteConfirm ? '¿Estás seguro? Click para confirmar' : 'Borrar Datos Locales'}
                </button>
            </div>
        </div>
    </div>
  );
};

function App() {
  const [activeView, setActiveView] = useState('dashboard') // dashboard, kanban, kpis, courses, calendar, files
  const [tasks, setTasks] = useState([])
  const [grades, setGrades] = useState([])
  const [courses, setCourses] = useState([])
  const [columns, setColumns] = useState([
    { id: 'todo', title: 'Por hacer', color: 'red' },
    { id: 'inprogress', title: 'En Progreso', color: 'yellow' },
    { id: 'done', title: 'Entregado', color: 'green' }
  ])
  
  // New State for UI features
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingColumn, setEditingColumn] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  
  // Grade Details State
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null)
  const [isLoadingGrades, setIsLoadingGrades] = useState(false)

  // Edit Task State
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const handleUpdateTask = (updatedTask) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    setIsEditTaskModalOpen(false);
    setEditingTask(null);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setIsEditTaskModalOpen(true);
  };

  const sanitizeHTML = (html) => {
      if (!html) return '';
      try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          doc.querySelectorAll('script').forEach(script => script.remove());
          
          doc.querySelectorAll('*').forEach(el => {
              const attributes = el.attributes;
              for (let i = attributes.length - 1; i >= 0; i--) {
                  const attrName = attributes[i].name;
                  if (attrName.startsWith('on')) {
                      el.removeAttribute(attrName);
                  }
                  if ((attrName === 'href' || attrName === 'src') && 
                      attributes[i].value.toLowerCase().trim().startsWith('javascript:')) {
                      el.removeAttribute(attrName);
                  }
              }
          });
          
          return doc.body.innerHTML;
      } catch (e) {
          console.error("Error sanitizing HTML:", e);
          return html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "").replace(/javascript:/gim, "");
      }
  };

  const handleCourseClick = (courseName) => {
      setActiveView('courseDetail');
      setIsLoadingGrades(true);
      
      // Create a safe key for storage
      const storageKey = `course_details_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}`;

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get([storageKey, 'goodBoardCourseDetails'], (result) => {
              let cachedDetails = result[storageKey];
              
              if (!cachedDetails && result.goodBoardCourseDetails) {
                  cachedDetails = result.goodBoardCourseDetails[courseName];
              }

              if (cachedDetails) {
                  setSelectedCourseDetails(cachedDetails);
                  setIsLoadingGrades(false);
              } else {
                  setSelectedCourseDetails({ title: courseName, grades: [], weights: {} });
              }
          });
      } else {
          setSelectedCourseDetails({ title: courseName, grades: [], weights: {} });
      }

      if (typeof chrome !== 'undefined' && chrome.tabs) {
          chrome.tabs.query({ url: ["*://*.blackboard.com/*", "*://uvmonline.blackboard.com/*"] }, (tabs) => {
              if (tabs && tabs.length > 0) {
                  const targetTab = tabs[0];
                  chrome.tabs.sendMessage(targetTab.id, { action: "SCRAPE_GRADE_DETAILS", courseName: courseName }, (response) => {
                      setIsLoadingGrades(false);
                      if (chrome.runtime.lastError) {
                          console.log("Error sending message:", chrome.runtime.lastError);
                          if (chrome.runtime.lastError.message.includes("Extension context invalidated")) {
                              alert("Por favor recarga la pestaña de Blackboard para activar la extensión.");
                          }
                          return;
                      }
                      if (response && response.status === "success") {
                          const data = response.data;
                          let assignments = [];
                          let weights = {};

                          if (Array.isArray(data)) {
                              assignments = data;
                          } else {
                              assignments = data.assignments || [];
                              weights = data.weights || {};
                          }

                          if (assignments.length === 0) {
                              console.warn("Scraping returned 0 assignments. Skipping update to prevent data loss.");
                              return;
                          }

                          const sanitizedGrades = assignments.map(g => ({
                              ...g,
                              feedback: sanitizeHTML(g.feedback)
                          }));
                          
                          const actualCourseName = data.courseName || courseName;
                          const actualStorageKey = `course_details_${actualCourseName.replace(/[^a-zA-Z0-9]/g, '_')}`;

                          const newDetails = { title: actualCourseName, grades: sanitizedGrades, weights: weights };
                          
                          if (actualCourseName !== courseName) {
                              console.log(`Redirecting save: Requested ${courseName} but found ${actualCourseName}`);
                          } else {
                              setSelectedCourseDetails(newDetails);
                          }

                          const updateObject = {};
                          updateObject[actualStorageKey] = newDetails;
                          
                          chrome.storage.local.set(updateObject, () => {
                              console.log(`Saved details for ${actualCourseName} to ${actualStorageKey}`);
                          });
                          
                          chrome.storage.local.get(['goodBoardCourseDetails'], (result) => {
                              const currentDetails = result.goodBoardCourseDetails || {};
                              currentDetails[courseName] = newDetails;
                              chrome.storage.local.set({ goodBoardCourseDetails: currentDetails });
                          });

                      } else {
                          console.warn("Scraping returned no data or failed.");
                      }
                  });
              } else {
                  setIsLoadingGrades(false);
                  // Don't alert if we have cached data
                  if (!selectedCourseDetails) {
                      alert("No se encontró la pestaña de Blackboard. Por favor abre Blackboard para ver los detalles.");
                  }
              }
          });
      } else {
          // Dev mode mock data
          setTimeout(() => {
              setIsLoadingGrades(false);
              if (!selectedCourseDetails) {
                  setSelectedCourseDetails({
                      title: courseName,
                      grades: [
                          { title: 'Actividad 1', grade: '10', pointsPossible: '10', dueDate: '10-OCT-2023', weight: '10' },
                          { title: 'Actividad 2', grade: '-', pointsPossible: '10', dueDate: '20-OCT-2023', weight: '20' }
                      ],
                      weights: { 'Actividad 1': '10', 'Actividad 2': '20' }
                  });
              }
          }, 1000);
      }
  };


  useEffect(() => {
    // Check if running in extension environment
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      // Initial load
      chrome.storage.local.get(['goodBoardTasks', 'goodBoardGrades', 'goodBoardCourses', 'goodBoardColumns', 'goodBoardAssignments'], (result) => {
        let mergedTasks = result.goodBoardTasks || [];
        
        if (result.goodBoardAssignments && result.goodBoardAssignments.length > 0) {
            const assignmentTasks = result.goodBoardAssignments.map((a, index) => ({
                id: `assignment-${index}-${a.title}`,
                title: a.title,
                course: a.course,
                date: a.dueDate || 'Sin fecha',
                status: a.status === 'graded' ? 'done' : 'todo',
                description: a.grade && a.grade !== 'N/A' ? `Calificación: ${a.grade}` : 'Importado de Calificaciones',
                source: 'Blackboard Grades',
                url: a.url
            }));

            const existingSignatures = new Set(mergedTasks.map(t => `${t.title}-${t.course}`));
            
            assignmentTasks.forEach(at => {
                if (!existingSignatures.has(`${at.title}-${at.course}`)) {
                    mergedTasks.push(at);
                }
            });
        }

        // Auto-move to In Progress if due date is close (within 7 days) or overdue
        const parseDateHelper = (dateStr) => {
            if (!dateStr) return null;
            // Try DD-MMM-YYYY
            let match = dateStr.match(/(\d{1,2})-([a-zA-Z]{3})-(\d{4})/);
            if (match) {
                const day = parseInt(match[1]);
                const monthStr = match[2].toLowerCase();
                const year = parseInt(match[3]);
                const months = { 'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5, 'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11 };
                const month = months[monthStr];
                if (!isNaN(day) && month !== undefined && !isNaN(year)) return new Date(year, month, day);
            }
            // Try DD/MM/YYYY
            match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            if (match) {
                 const day = parseInt(match[1]);
                 const month = parseInt(match[2]) - 1;
                 const year = parseInt(match[3]);
                 if (!isNaN(day) && !isNaN(month) && !isNaN(year)) return new Date(year, month, day);
            }
            return null;
        };

        const now = new Date();
        mergedTasks = mergedTasks.map(t => {
            if (t.status === 'todo' && t.date) {
                const d = parseDateHelper(t.date);
                if (d) {
                    const diffTime = d - now;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    // If due within 7 days or overdue, move to inprogress
                    if (diffDays <= 7) {
                        return { ...t, status: 'inprogress' };
                    }
                }
            }
            return t;
        });

        setTasks(mergedTasks);
        if (result.goodBoardGrades) setGrades(result.goodBoardGrades);
        if (result.goodBoardCourses) setCourses(result.goodBoardCourses);
        if (result.goodBoardColumns) setColumns(result.goodBoardColumns);
        setIsLoaded(true);
      });
      
      // Listen for changes
      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
          // We need to re-merge if either tasks or assignments change
          // This is a bit complex inside the listener, so we might just reload all
          if (changes.goodBoardTasks || changes.goodBoardAssignments) {
             chrome.storage.local.get(['goodBoardTasks', 'goodBoardAssignments'], (res) => {
                 let newTasks = res.goodBoardTasks || [];
                 if (res.goodBoardAssignments) {
                     const newAssignments = res.goodBoardAssignments.map((a, index) => ({
                        id: `assignment-${index}-${a.title}`,
                        title: a.title,
                        course: a.course,
                        date: a.dueDate || 'Sin fecha',
                        status: a.status === 'graded' ? 'done' : 'todo',
                        description: a.grade && a.grade !== 'N/A' ? `Calificación: ${a.grade}` : 'Importado de Calificaciones',
                        source: 'Blackboard Grades',
                        url: a.url
                     }));
                     
                     const existingSignatures = new Set(newTasks.map(t => `${t.title}-${t.course}`));
                     newAssignments.forEach(at => {
                        if (!existingSignatures.has(`${at.title}-${at.course}`)) {
                            newTasks.push(at);
                        }
                     });
                 }
                 setTasks(newTasks);
             });
          }
          
          if (changes.goodBoardGrades) setGrades(changes.goodBoardGrades.newValue);
          if (changes.goodBoardCourses) setCourses(changes.goodBoardCourses.newValue);
          if (changes.goodBoardColumns) setColumns(changes.goodBoardColumns.newValue);
        }
      });

      // Listen for sync completion
      const handleMessage = (request, sender, sendResponse) => {
        if (request.action === "syncComplete") {
          setIsSyncing(false);
          // Keep modal open but show completion state
          console.log("Sync completed!");
        }
      };
      chrome.runtime.onMessage.addListener(handleMessage);
      return () => chrome.runtime.onMessage.removeListener(handleMessage);

    } else {
      // Load mock data ONLY for local development (not extension)
      setTasks([
        { id: '1', title: 'Implementar API RESTful', course: 'Programación Web', status: 'todo', description: 'Completar los endpoints de usuarios.', date: 'Hoy, 23:59' },
        { id: '2', title: 'Diseño de Interfaz', course: 'UX/UI', status: 'inprogress', description: 'Terminar los mockups en Figma.', date: 'Mañana' },
        { id: '3', title: 'Quiz Historia', course: 'Historia', status: 'done', description: 'Calificación: 95/100', date: 'Ayer' }
      ]);
      setGrades([
        { course: 'Programación Web', grade: '9.5/10' },
        { course: 'UX/UI', grade: '10/10' }
      ]);
      setCourses([
        { name: 'Programación Web', id: 'PW-101' },
        { name: 'UX/UI', id: 'UX-202' }
      ]);
      setIsLoaded(true);
    }
  }, []);

  // Persistence Effects
  useEffect(() => {
    if (isLoaded && typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ goodBoardTasks: tasks });
    }
  }, [tasks, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ goodBoardColumns: columns });
    }
  }, [columns, isLoaded]);

  const handleSync = () => {
    setActiveView('sync');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView tasks={tasks} grades={grades} onSync={handleSync} isSyncing={isSyncing} onCourseClick={handleCourseClick} onNewTask={() => setIsTaskModalOpen(true)} />
      case 'kanban':
        return <KanbanView 
          tasks={tasks} 
          setTasks={setTasks} 
          columns={columns} 
          setColumns={setColumns}
          onNewTask={() => setIsTaskModalOpen(true)}
          onEditColumn={(col) => setEditingColumn(col)}
          onEditTask={openEditTaskModal}
        />
      case 'kpis':
        return <KPIsView grades={grades} courses={courses} onCourseClick={handleCourseClick} />
      case 'calendar':
        return <CalendarView tasks={tasks} columns={columns} onEditTask={openEditTaskModal} onUpdateTask={handleUpdateTask} />
      case 'courseDetail':
        return <CourseDetailView 
            courseDetails={selectedCourseDetails} 
            isLoading={isLoadingGrades} 
            onBack={() => setActiveView('kpis')} 
        />
      case 'sync':
        return <SyncView />
      case 'settings':
        return <SettingsView />
      default:
        return <DashboardView tasks={tasks} />
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white font-display relative">
      {/* Sidebar */}
      {isSidebarOpen && (
      <aside className="hidden md:flex flex-col w-64 h-full border-r border-border-dark bg-background-dark p-4 justify-between shrink-0 z-20">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 px-2">
            <img src="/logo/goodBoardIcon.png" alt="GoodBoard" className="h-8 w-auto" />
            <div className="flex flex-col">
              <h1 className="text-white text-lg font-bold leading-tight tracking-tight">GoodBoard</h1>
              <p className="text-text-secondary text-xs font-normal">UVM Dashboard</p>
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            <NavItem 
              icon="dashboard" 
              label="Inicio" 
              active={activeView === 'dashboard'} 
              onClick={() => setActiveView('dashboard')} 
            />
            <NavItem 
              icon="view_kanban" 
              label="Tablero" 
              active={activeView === 'kanban'} 
              onClick={() => setActiveView('kanban')} 
            />
            <NavItem 
              icon="bar_chart" 
              label="KPIs" 
              active={activeView === 'kpis'} 
              onClick={() => setActiveView('kpis')} 
            />
            <NavItem 
              icon="calendar_month" 
              label="Cronograma" 
              active={activeView === 'calendar'} 
              onClick={() => setActiveView('calendar')} 
            />
            <NavItem 
              icon="sync" 
              label="Sincronizar" 
              active={false} 
              onClick={handleSync} 
            />
          </nav>
        </div>
        <div className="flex flex-col gap-4">
          <div className="border-t border-border-dark pt-4">
            <button 
              onClick={() => setActiveView('settings')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left ${
                activeView === 'settings' 
                  ? 'bg-surface-lighter text-white border-l-4 border-primary' 
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">settings</span>
              <span className="text-sm font-medium">Configuración</span>
            </button>
          </div>
        </div>
      </aside>
      )}

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-30 p-1 bg-surface-dark border border-border-dark text-text-secondary hover:text-white hover:bg-surface-lighter transition-all rounded-full shadow-lg items-center justify-center w-6 h-6 ${isSidebarOpen ? 'left-64 -ml-3' : 'left-0 ml-2'}`}
        title={isSidebarOpen ? "Ocultar Sidebar" : "Mostrar Sidebar"}
      >
        <span className="material-symbols-outlined text-sm">{isSidebarOpen ? 'chevron_left' : 'chevron_right'}</span>
      </button>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-background-dark">
        {renderContent()}
      </main>

      {/* Modals */}
      {isTaskModalOpen && (
        <NewTaskModal 
          onClose={() => setIsTaskModalOpen(false)} 
          onSave={(newTask) => {
            setTasks([...tasks, newTask]);
            setIsTaskModalOpen(false);
          }}
          courses={courses}
        />
      )}

      {editingColumn && (
        <ColumnSettingsModal 
          column={editingColumn} 
          onClose={() => setEditingColumn(null)} 
          onSave={(updatedColumn) => {
            setColumns(columns.map(c => c.id === updatedColumn.id ? updatedColumn : c));
            setEditingColumn(null);
          }}
          onDelete={(columnId) => {
             setColumns(columns.filter(c => c.id !== columnId));
             setEditingColumn(null);
          }}
        />
      )}

      {isEditTaskModalOpen && (
        <EditTaskModal
          task={editingTask}
          isOpen={isEditTaskModalOpen}
          onClose={() => setIsEditTaskModalOpen(false)}
          onSave={handleUpdateTask}
          courses={courses}
        />
      )}

      {isEditTaskModalOpen && editingTask && (
        <EditTaskModal 
          task={editingTask} 
          onClose={() => {
            setIsEditTaskModalOpen(false);
            setEditingTask(null);
          }} 
          onSave={handleUpdateTask}
          courses={courses}
        />
      )}
    </div>
  )
}

const CourseDetailView = ({ courseDetails, isLoading, onBack }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <span className="material-symbols-outlined text-6xl text-primary animate-spin mb-6">sync</span>
                <h2 className="text-2xl font-bold text-white mb-2">Analizando Curso...</h2>
                <p className="text-text-secondary">Obteniendo calificaciones, criterios y actividades.</p>
            </div>
        );
    }

    if (!courseDetails) return null;

    const { title, grades = [], weights = {} } = courseDetails;
    
    // Helper to check if an assignment is submitted
    const isSubmitted = (g) => {
        // If it has a grade that is not a placeholder, it's submitted/graded
        if (g.grade && g.grade !== '-' && g.grade.trim() !== '') return true;
        
        // If it has a submitted date, it's submitted
        if (g.submittedDate && g.submittedDate.trim() !== '') return true;
        
        // Check status text
        if (g.status) {
            const s = g.status.toLowerCase();
            return s.includes('calificar') || s.includes('enviado') || s.includes('needs grading') || s.includes('completado');
        }
        
        return false;
    };

    // Calculate stats
    const completed = grades.filter(isSubmitted).length;
    const total = grades.length;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    const gradedCount = grades.filter(g => {
        const score = parseFloat(g.grade);
        return !isNaN(score);
    }).length;
    const submittedNotGradedCount = completed - gradedCount;
    const gradedProgress = total > 0 ? (gradedCount / total) * 100 : 0;
    const submittedNotGradedProgress = total > 0 ? (submittedNotGradedCount / total) * 100 : 0;

    // Calculate weighted average if weights exist
    let weightedSum = 0;
    let totalWeight = 0;
    let currentGrade = 0;
    let maxPossible = 10; // Start with perfect score
    
    // Simple average for fallback
    let simpleSum = 0;
    let simpleCount = 0;

    // Sort weight keys by length descending to match longest specific names first
    const weightKeys = Object.keys(weights).sort((a, b) => b.length - a.length);

    grades.forEach(g => {
        let score = parseFloat(g.grade);
        if (!isNaN(score)) {
            // Normalize score to 0-10 scale
            let maxScore = 10;
            if (g.pointsPossible && !isNaN(parseFloat(g.pointsPossible))) {
                maxScore = parseFloat(g.pointsPossible);
            } else if (score > 10) {
                // Heuristic: if score > 10, assume max is 100
                maxScore = 100;
            }
            
            const normalizedScore = (score / maxScore) * 10;

            simpleSum += normalizedScore;
            simpleCount++;
            
            // Try to match with weights
            // Check if any weight key is contained in the title
            // Also try removing "Calificación Final" from key just in case
            const weightKey = weightKeys.find(k => {
                const cleanKey = k.replace(/^Calificación Final\s+/i, '');
                return g.title.toLowerCase().includes(cleanKey.toLowerCase());
            });
            
            if (weightKey && weights[weightKey]) {
                const w = parseFloat(weights[weightKey]);
                const earnedPoints = normalizedScore * (w / 100);
                const maxPointsForActivity = (w / 100) * 10;
                
                weightedSum += earnedPoints;
                totalWeight += w;
                
                // Subtract lost points from maxPossible
                maxPossible -= (maxPointsForActivity - earnedPoints);
            }
        }
    });

    // If totalWeight is not 100 (e.g. course in progress), we normalize to the current total weight
    // Example: If only 30% of course is graded, and student has 10/10 in all, weightedSum is 3.
    // Average should be 3 / (30/100) = 10.
    const average = totalWeight > 0 ? (weightedSum / (totalWeight / 100)).toFixed(2) : (simpleCount > 0 ? (simpleSum / simpleCount).toFixed(2) : '-');
    const accumulatedPoints = weightedSum.toFixed(2);
    const isWeighted = totalWeight > 0;

    // Calculate Max Possible correctly
    // Max Possible = Accumulated Points + (Total Weight of Remaining Activities / 100 * 10)
    // We need to find remaining activities (not graded) and sum their weights
    let remainingWeight = 0;
    grades.forEach(g => {
        let score = parseFloat(g.grade);
        if (isNaN(score)) { // Not graded
             const weightKey = weightKeys.find(k => {
                const cleanKey = k.replace(/^Calificación Final\s+/i, '');
                return g.title.toLowerCase().includes(cleanKey.toLowerCase());
            });
            if (weightKey && weights[weightKey]) {
                remainingWeight += parseFloat(weights[weightKey]);
            }
        }
    });
    
    // If we have weights, Max Possible is current points + potential points from remaining
    // If no weights, assume 10
    maxPossible = isWeighted ? (weightedSum + (remainingWeight / 100 * 10)) : 10;

    // Prepare data for charts
    const gradesWithWeights = grades.map(g => {
        let weight = 0;
        const weightKey = weightKeys.find(k => {
            const cleanKey = k.replace(/^Calificación Final\s+/i, '');
            return g.title.toLowerCase().includes(cleanKey.toLowerCase());
        });
        if (weightKey && weights[weightKey]) {
            weight = parseFloat(weights[weightKey]);
        }
        return { ...g, weight };
    });

    // Find Next Assignment
    const parseSpanishDate = (dateStr) => {
        if (!dateStr) return null;
        
        // Extract date pattern: 22-DIC-2025 or 22-dic-2025
        // Ignores surrounding text like "Vencimiento:"
        const match = dateStr.match(/(\d{1,2})-([a-zA-Z]{3})-(\d{4})/);
        if (!match) return null;
        
        const day = parseInt(match[1]);
        const monthStr = match[2].toLowerCase();
        const year = parseInt(match[3]);

        const months = {
            'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
        };
        
        const month = months[monthStr];
        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
            return new Date(year, month, day);
        }
        return null;
    };

    const pendingAssignments = grades
        .filter(g => !isSubmitted(g))
        .map(g => ({ ...g, parsedDate: parseSpanishDate(g.dueDate) }))
        .filter(g => g.parsedDate !== null) // Only consider items with valid dates
        .sort((a, b) => a.parsedDate - b.parsedDate);

    // Find the first one that is today or future
    // Or if all are past, show the most recent past one? No, usually "Next" means future.
    // If all pending are in the past (overdue), show the oldest overdue?
    // Let's show the first pending one in the sorted list (which is the earliest due date)
    // This correctly identifies "Overdue" items as the next thing to do.
    const nextAssignment = pendingAssignments.length > 0 ? pendingAssignments[0] : null;

    return (
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background-dark">
            {/* Header */}
            <header className="flex-none px-6 py-6 border-b border-border-dark bg-background-dark/95 backdrop-blur sticky top-0 z-10">
                <div className="w-full flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-lg hover:bg-surface-lighter text-text-secondary hover:text-white transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{title}</h1>
                        <p className="text-text-secondary text-sm">Detalle del curso y rendimiento</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 p-6 md:p-10">
                <div className="w-full flex flex-col gap-8">
                    
                    {/* Top Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-6 rounded-xl bg-surface-dark border border-border-dark flex flex-col h-full justify-between">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-text-secondary text-xs font-bold uppercase tracking-wider">
                                    {isWeighted ? "Puntos Acumulados" : "Promedio"}
                                </span>
                            </div>
                            <div className="mt-auto w-full">
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-primary leading-none">
                                            {isWeighted ? accumulatedPoints : average}
                                        </span>
                                        <span className="text-text-secondary text-sm">/ 10</span>
                                    </div>
                                    {isWeighted && (
                                        <span className="text-[10px] font-bold text-text-secondary leading-none mb-1">
                                            Máximo posible: {maxPossible.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                <div className="relative w-full h-1.5 rounded-full overflow-hidden bg-background-dark">
                                    {/* Lost Part (Red/Gray) - from maxPossible to 100% */}
                                    {isWeighted && (
                                        <div 
                                            className="absolute top-0 right-0 h-full bg-red-500/20" 
                                            style={{ width: `${(10 - maxPossible) * 10}%` }}
                                        ></div>
                                    )}
                                    {/* Earned Part (Primary) - from 0 to accumulated */}
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-primary rounded-full" 
                                        style={{ width: `${parseFloat(accumulatedPoints) * 10}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 rounded-xl bg-surface-dark border border-border-dark flex flex-col h-full justify-between">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-text-secondary text-xs font-bold uppercase tracking-wider">Progreso de Actividades</span>
                            </div>
                            <div className="mt-auto w-full">
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-white leading-none">{completed}</span>
                                        <span className="text-text-secondary text-sm">de {total} entregadas</span>
                                    </div>
                                    {submittedNotGradedCount > 0 && (
                                        <span className="text-[10px] font-bold text-text-secondary leading-none mb-1">
                                            Pendientes de calificar: {submittedNotGradedCount}
                                        </span>
                                    )}
                                </div>
                                <div className="relative w-full h-1.5 rounded-full overflow-hidden bg-background-dark">
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-green-500" 
                                        style={{ width: `${gradedProgress}%` }}
                                    ></div>
                                    <div 
                                        className="absolute top-0 h-full bg-gray-500" 
                                        style={{ left: `${gradedProgress}%`, width: `${submittedNotGradedProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 rounded-xl bg-surface-dark border border-border-dark flex flex-col gap-2 h-full">
                            <span className="text-text-secondary text-xs font-bold uppercase tracking-wider">Próxima Entrega</span>
                            {nextAssignment ? (
                                <>
                                    <span className="text-lg font-bold text-white truncate" title={nextAssignment.title}>
                                        {nextAssignment.title}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold ${nextAssignment.parsedDate < new Date().setHours(0,0,0,0) ? 'text-red-500' : 'text-primary'}`}>
                                            {nextAssignment.dueDate}
                                        </span>
                                        {nextAssignment.parsedDate < new Date().setHours(0,0,0,0) && (
                                            <span className="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded uppercase font-bold">Vencida</span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                total > completed ? (
                                     <div className="flex flex-col justify-center h-full">
                                        <span className="text-white font-bold text-lg">Faltan {total - completed} actividades</span>
                                        <span className="text-xs text-text-secondary">Sin fecha próxima asignada</span>
                                     </div>
                                ) : (
                                    <div className="flex flex-col justify-center h-full">
                                        <span className="text-white font-medium">¡Todo al día!</span>
                                        <span className="text-xs text-text-secondary">Has completado todas las actividades</span>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {isWeighted && (
                        <CourseCharts 
                            grades={gradesWithWeights} 
                            totalWeight={totalWeight} 
                            accumulatedPoints={accumulatedPoints} 
                        />
                    )}

                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">list</span>
                        Actividades y Calificaciones
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Activities List */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            <div className="flex flex-col gap-3">
                                {grades.map((item, idx) => (
                                    <div key={idx} className="p-4 rounded-lg bg-surface-dark border border-border-dark hover:border-primary/30 transition-all group">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-white font-bold text-base group-hover:text-primary transition-colors">{item.title}</h3>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-text-secondary">
                                                    {item.dueDate && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">event</span> Vence: {item.dueDate}</span>}
                                                    {item.submittedDate && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">check_circle</span> Entregado: {item.submittedDate}</span>}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end shrink-0">
                                                <div className="flex items-baseline gap-1">
                                                    <span className={`text-xl font-black ${item.grade !== '-' ? 'text-primary' : 'text-text-secondary'}`}>
                                                        {item.grade}
                                                    </span>
                                                    {item.pointsPossible && <span className="text-xs text-text-secondary font-medium">/{item.pointsPossible}</span>}
                                                </div>
                                                {/* Show weight tag if available directly on item or via lookup */}
                                                {(item.weight || weights[item.title]) && (
                                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded mt-1 border border-primary/20">
                                                        {item.weight || weights[item.title]}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {item.feedback && (
                                            <div className="mt-3 p-3 rounded bg-background-dark/50 text-sm text-text-secondary border-l-2 border-primary/50">
                                                <div className="font-bold text-xs mb-1 text-primary flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">comment</span>
                                                    Feedback
                                                </div>
                                                <div className="prose prose-invert prose-sm max-w-none text-xs opacity-90" dangerouslySetInnerHTML={{ __html: item.feedback }} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Criteria & Graphs */}
                        <div className="flex flex-col gap-6 sticky top-24 h-fit">
                            {/* Simple Graph: Grade Distribution */}
                            <DistributionChart grades={gradesWithWeights} accumulatedPoints={accumulatedPoints} />

                            {/* Criteria Card */}
                            <div className="p-6 rounded-xl bg-surface-dark border border-border-dark">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">pie_chart</span>
                                    Criterios de Evaluación
                                </h3>
                                {Object.keys(weights).length > 0 ? (
                                    <div className="flex flex-col gap-3">
                                        {Object.entries(weights).map(([name, percent], idx) => (
                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                <span className="text-text-secondary truncate pr-2" title={name}>{name}</span>
                                                <span className="font-bold text-white bg-surface-lighter px-2 py-1 rounded">{percent}%</span>
                                            </div>
                                        ))}
                                        <div className="mt-4 pt-4 border-t border-border-dark flex justify-between items-center">
                                            <span className="text-white font-bold">Total</span>
                                            <span className="text-primary font-black">
                                                {Object.values(weights).reduce((a, b) => a + parseFloat(b), 0).toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-text-secondary text-sm">
                                        No se encontraron criterios de ponderación específicos.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200 group w-full text-left ${
      active 
        ? 'bg-surface-lighter text-white border-l-4 border-primary' 
        : 'text-text-secondary hover:bg-surface-dark hover:text-white'
    }`}
  >
    <span className={`material-symbols-outlined text-[22px] transition-colors ${active ? 'text-primary' : 'group-hover:text-primary'}`}>
      {icon}
    </span>
    <span className="text-sm font-medium">{label}</span>
  </button>
)

const EmptyState = ({ icon, title, message }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center p-8 border border-dashed border-border-dark rounded-xl bg-surface-dark/30">
    <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">{icon}</span>
    <h3 className="text-white text-lg font-bold mb-2">{title}</h3>
    <p className="text-text-secondary text-sm max-w-xs">{message}</p>
  </div>
)

const DashboardView = ({ tasks, grades, onSync, isSyncing, onCourseClick, onNewTask }) => {
  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const completedTasks = tasks.filter(t => t.status === 'done');
  const uniqueCourses = [...new Set(tasks.map(t => t.course))];

  const calculateAverage = () => {
    if (!grades || grades.length === 0) return null;
    let total = 0;
    let count = 0;
    
    grades.forEach(g => {
      let score = 0;
      let max = 10;

      if (typeof g.grade === 'string') {
        // Clean string (remove non-numeric except . and /)
        const cleanGrade = g.grade.replace(/[^\d./]/g, '');
        
        if (cleanGrade.includes('/')) {
          const parts = cleanGrade.split('/');
          score = parseFloat(parts[0]);
          max = parseFloat(parts[1]) || 10;
        } else {
          score = parseFloat(cleanGrade);
          if (score > 10) max = 100;
        }
      } else if (typeof g.grade === 'number') {
          score = g.grade;
          if (score > 10) max = 100;
      }

      if (!isNaN(score)) {
        const normalized = (score / max) * 10;
        total += normalized;
        count++;
      }
    });

    return count > 0 ? (total / count).toFixed(1) : null;
  };

  const average = calculateAverage();

  return (
  <>
    <header className="flex-none px-6 py-6 md:px-10 md:py-8 border-b border-border-dark bg-background-dark/95 backdrop-blur z-10 sticky top-0">
      <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">Hola, Estudiante 👋</h1>
          <p className="text-text-secondary text-base font-normal">
            {pendingTasks.length > 0 
              ? <>Tienes <strong className="text-white">{pendingTasks.length} entregas pendientes</strong>.</>
              : "No tienes entregas pendientes por ahora."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onSync}
            disabled={isSyncing}
            className={`flex items-center justify-center h-10 px-4 rounded-lg bg-surface-dark text-white text-sm font-bold hover:bg-surface-lighter transition-colors border border-border-dark ${isSyncing ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <span className={`material-symbols-outlined mr-2 text-[18px] ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </button>
          <button 
            onClick={onNewTask}
            className="flex items-center justify-center h-10 px-4 rounded-lg bg-primary text-black text-sm font-bold shadow-[0_0_15px_rgba(255,193,7,0.3)] hover:shadow-[0_0_20px_rgba(255,193,7,0.5)] transition-all"
          >
            <span className="material-symbols-outlined mr-2 text-[20px]">add</span>
            Nueva Tarea
          </button>
        </div>
      </div>
    </header>
    <div className="flex-1 overflow-y-auto p-6 md:p-10">
      <div className="w-full flex flex-col gap-8">
        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl p-6 bg-gradient-to-br from-surface-lighter to-surface-dark border border-border-dark relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-8xl text-white">school</span>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
              <div>
                <p className="text-text-secondary text-sm font-medium uppercase tracking-wider mb-1">Promedio General</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-white text-5xl font-black tracking-tight">{average || '--'}</h3>
                  {average && <span className="text-text-secondary text-lg font-medium">/ 10</span>}
                </div>
              </div>
              <div className="w-full bg-background-dark rounded-full h-2 overflow-hidden border border-white/5">
                <div className="bg-primary h-full rounded-full" style={{ width: `${average ? (average * 10) : 0}%` }}></div>
              </div>
              <p className="text-xs text-text-secondary">
                {average ? "Calculado basado en tus calificaciones sincronizadas." : "Sincroniza para ver tu promedio."}
              </p>
            </div>
          </div>
          
          {/* Completed Tasks Stats */}
          <div className="rounded-xl p-6 bg-surface-dark border border-border-dark flex flex-col justify-center items-center gap-4 text-center hover:bg-surface-lighter transition-colors cursor-pointer group">
             <span className="material-symbols-outlined text-4xl text-text-secondary group-hover:text-primary transition-colors">check_circle</span>
             {completedTasks.length > 0 ? (
                <>
                  <h3 className="text-white text-3xl font-bold">{completedTasks.length}</h3>
                  <p className="text-text-secondary text-sm">Tareas completadas</p>
                </>
             ) : (
                <p className="text-text-secondary text-sm">No hay tareas completadas esta semana</p>
             )}
          </div>

          {/* Next Class / Pending Stats */}
          <div className="rounded-xl p-6 bg-surface-dark border border-border-dark flex flex-col justify-center items-center gap-4 text-center hover:bg-surface-lighter transition-colors cursor-pointer group">
             <span className="material-symbols-outlined text-4xl text-text-secondary group-hover:text-primary transition-colors">schedule</span>
             {pendingTasks.length > 0 ? (
                <>
                  <h3 className="text-white text-3xl font-bold">{pendingTasks.length}</h3>
                  <p className="text-text-secondary text-sm">Entregas pendientes</p>
                </>
             ) : (
                <p className="text-text-secondary text-sm">No hay clases próximas detectadas</p>
             )}
          </div>
        </section>

        {/* Radar Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-white text-xl font-bold">Radar de Entregas</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
             {pendingTasks.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {pendingTasks.map(task => (
                   <div key={task.id} className="p-4 rounded-lg bg-surface-dark border border-border-dark">
                     <h4 className="text-white font-bold">{task.title}</h4>
                     <p className="text-text-secondary text-sm">{task.course}</p>
                     <p className="text-primary text-xs mt-2">{task.date}</p>
                   </div>
                 ))}
               </div>
             ) : (
               <EmptyState 
                  icon="radar" 
                  title="Radar Vacío" 
                  message="No se han detectado entregas urgentes. ¡Buen trabajo!" 
               />
             )}
          </div>
        </section>

        {/* Courses Section */}
        <section>
          <h2 className="text-white text-xl font-bold mb-4 px-1">Mis Cursos Activos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {uniqueCourses.length > 0 ? (
               uniqueCourses.map((course, idx) => (
                 <div 
                    key={idx} 
                    onClick={() => onCourseClick(course)}
                    className="p-4 rounded-lg bg-surface-dark border border-border-dark hover:border-primary/50 transition-colors cursor-pointer"
                 >
                   <div className="flex items-center gap-3 mb-2">
                     <div className="size-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                       {course.substring(0, 2).toUpperCase()}
                     </div>
                     <h3 className="text-white font-bold text-sm truncate" title={course}>
                        {course.includes(':') ? course.split(':')[1].trim() : course}
                     </h3>
                   </div>
                   <p className="text-text-secondary text-xs">
                     {tasks.filter(t => t.course === course && t.status !== 'done').length} tareas pendientes
                   </p>
                 </div>
               ))
             ) : (
               <div className="col-span-full">
                  <EmptyState 
                    icon="school" 
                    title="Sin Cursos" 
                    message="Sincroniza con Blackboard para cargar tus materias." 
                  />
               </div>
             )}
          </div>
        </section>
        <div className="h-10"></div>
      </div>
    </div>
  </>
  )
}

// Sortable Task Item Component
const SortableTaskItem = ({ task, color, onEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const tagColors = {
    red: 'bg-red-500/10 text-red-500 border-red-500/30',
    yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    green: 'bg-green-500/10 text-green-500 border-green-500/30',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    pink: 'bg-pink-500/10 text-pink-500 border-pink-500/30',
  };

  const getSourceIcon = (source) => {
    switch(source) {
      case 'Teams': return 'group';
      case 'Blackboard': return 'school';
      case 'Clase': return 'person';
      default: return 'edit';
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="group relative flex flex-col gap-3 p-4 rounded-lg bg-surface-dark border border-border-dark hover:border-primary/50 cursor-grab active:cursor-grabbing transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:-translate-y-1"
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-wrap gap-2">
          <span className={`px-2 py-1 rounded text-xs font-semibold border ${tagColors[color] || tagColors.yellow}`}>{task.course}</span>
          {task.source && (
            <span className="px-2 py-1 rounded text-xs font-semibold border border-border-dark bg-surface-lighter text-text-secondary flex items-center gap-1" title={`Fuente: ${task.source}`}>
              <span className="material-symbols-outlined text-[12px]">{getSourceIcon(task.source)}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
            <button 
                onPointerDown={(e) => {
                    e.stopPropagation(); // Prevent drag start
                    onEdit(task);
                }}
                className="text-text-secondary hover:text-white material-symbols-outlined text-base p-1 rounded hover:bg-white/10 transition-colors"
            >
                edit
            </button>
            <span className="material-symbols-outlined text-text-secondary group-hover:text-white text-lg">drag_indicator</span>
        </div>
      </div>
      <div>
        <h4 className="text-white font-semibold text-sm mb-1 leading-snug">{task.title}</h4>
        <p className="text-text-secondary text-xs line-clamp-2">{task.description}</p>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-border-dark pt-3">
        <div className="flex items-center gap-1.5 text-text-secondary">
          <span className="material-symbols-outlined text-base">calendar_month</span>
          <span className="text-xs font-medium">{task.date}</span>
        </div>
      </div>
    </div>
  );
}

const KanbanColumn = ({ id, title, tasks, color, onEdit, onEditTask }) => {
  const { setNodeRef, attributes, listeners, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const colorClasses = {
    red: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]',
    yellow: 'bg-yellow-500 shadow-[0_0_8px_rgba(255,193,7,0.4)]',
    green: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]',
    blue: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]',
    purple: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]',
    pink: 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.4)]',
    orange: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]',
    teal: 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.4)]',
    gray: 'bg-gray-500 shadow-[0_0_8px_rgba(107,114,128,0.4)]',
  };

  const borderClasses = {
    red: 'border-red-500/20',
    yellow: 'border-yellow-500/20',
    green: 'border-green-500/20',
    blue: 'border-blue-500/20',
    purple: 'border-purple-500/20',
    pink: 'border-pink-500/20',
    orange: 'border-orange-500/20',
    teal: 'border-teal-500/20',
    gray: 'border-gray-500/20',
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex flex-col flex-1 h-full min-w-[320px] rounded-xl bg-[#1e1e1e]/50 border ${borderClasses[color] || 'border-border-dark/50'} backdrop-blur-sm transition-colors duration-300`}>
      <div {...attributes} {...listeners} className={`p-4 border-b ${borderClasses[color] || 'border-border-dark/50'} flex justify-between items-center sticky top-0 bg-[#1e1e1e]/90 rounded-t-xl z-10 backdrop-blur-md cursor-grab active:cursor-grabbing`}>
        <div className="flex items-center gap-3">
          <div className={`size-3 rounded-full ${colorClasses[color] || 'bg-gray-500'}`}></div>
          <h3 className="text-white font-bold text-base">{title}</h3>
          <span className="px-2 py-0.5 rounded bg-surface-dark text-text-secondary text-xs font-medium border border-border-dark">{tasks.length}</span>
        </div>
        <button 
            onPointerDown={(e) => {
                e.stopPropagation();
                onEdit({ id, title, color });
            }}
            className="text-text-secondary hover:text-white material-symbols-outlined text-lg p-1 rounded hover:bg-white/10"
        >
            more_horiz
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 kanban-scroll">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <SortableTaskItem key={task.id} task={task} color={color} onEdit={onEditTask} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
           <div className="h-24 border-2 border-dashed border-border-dark/30 rounded-lg flex items-center justify-center text-text-secondary text-xs">
             Arrastra tareas aquí
           </div>
        )}
      </div>
    </div>
  )
}

const KanbanView = ({ tasks, setTasks, columns, setColumns, onNewTask, onEditColumn, onEditTask }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5, // Require 5px movement before drag starts (prevents accidental drags on clicks)
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeId, setActiveId] = useState(null);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Check if dragging a column
    const activeColumnIndex = columns.findIndex(c => c.id === activeId);
    const overColumnIndex = columns.findIndex(c => c.id === overId);

    if (activeColumnIndex !== -1 && overColumnIndex !== -1) {
        if (activeColumnIndex !== overColumnIndex) {
            setColumns(arrayMove(columns, activeColumnIndex, overColumnIndex));
        }
        setActiveId(null);
        return;
    }

    // Task dragging logic
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) {
        setActiveId(null);
        return;
    }
    
    // Check if dropped on a column
    const isOverColumn = columns.some(col => col.id === overId);
    
    let newStatus = activeTask.status;

    if (isOverColumn) {
       newStatus = overId;
    } else {
       // Dropped on another task
       const overTask = tasks.find(t => t.id === overId);
       if (overTask) {
         newStatus = overTask.status;
       }
    }

    if (activeTask.status !== newStatus) {
       setTasks(tasks.map(t => t.id === activeId ? { ...t, status: newStatus } : t));
    }
    
    setActiveId(null);
  };

  const addColumn = () => {
    const newId = `col-${Date.now()}`;
    const colors = ['red', 'yellow', 'green', 'blue', 'purple', 'pink', 'orange', 'teal', 'gray'];
    
    // Find used colors
    const usedColors = new Set(columns.map(c => c.color));
    // Find available colors
    const availableColors = colors.filter(c => !usedColors.has(c));
    
    let nextColor;
    if (availableColors.length > 0) {
        nextColor = availableColors[0];
    } else {
        // If all used, default to gray
        nextColor = 'gray';
    }

    setColumns([...columns, { id: newId, title: 'Nueva Columna', color: nextColor }]);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex-none px-6 py-6 md:px-10 md:py-8 border-b border-border-dark bg-background-dark/95 backdrop-blur z-10 sticky top-0">
        <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">Tablero Kanban</h1>
                <p className="text-text-secondary text-base font-normal">Gestiona tus tareas y entregas.</p>
            </div>
            <div className="flex items-center justify-end gap-4">
                <button 
                    onClick={addColumn}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-surface-dark text-white text-sm font-bold border border-border-dark hover:bg-surface-lighter transition-all"
                >
                    <span className="material-symbols-outlined text-base">view_column</span>
                    Nueva Columna
                </button>
                <button 
                    onClick={onNewTask}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-black text-sm font-bold shadow-[0_0_15px_rgba(255,193,7,0.3)] hover:shadow-[0_0_20px_rgba(255,193,7,0.5)] transition-all"
                >
                    <span className="material-symbols-outlined text-base">add</span>
                    Nueva Tarea
                </button>
            </div>
        </div>
      </header>
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-6 w-full pt-6">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex h-full gap-6 min-w-[1000px] w-full">
                {columns.map(col => (
                <KanbanColumn 
                    key={col.id} 
                    id={col.id} 
                    title={col.title} 
                    tasks={tasks.filter(t => t.status === col.id)} 
                    color={col.color} 
                    onEdit={onEditColumn}
                    onEditTask={onEditTask}
                />
                ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeId ? (
               columns.some(c => c.id === activeId) ? (
                   // Column Overlay
                   <div className="p-4 rounded-lg bg-surface-dark border border-primary shadow-2xl opacity-90 rotate-3 cursor-grabbing w-[320px] h-[200px] flex items-center justify-center">
                        <h4 className="text-white font-semibold text-lg">Moviendo Columna...</h4>
                   </div>
               ) : (
                   // Task Overlay
                   <div className="p-4 rounded-lg bg-surface-dark border border-primary shadow-2xl opacity-90 rotate-3 cursor-grabbing">
                        <h4 className="text-white font-semibold text-sm">Moviendo tarea...</h4>
                   </div>
               )
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}

const KPIsView = ({ grades, courses, onCourseClick }) => (
  <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background-dark">
    <header className="flex-none px-6 py-6 md:px-10 md:py-8 border-b border-border-dark bg-background-dark/95 backdrop-blur z-10 sticky top-0">
      <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">KPIs del Estudiante</h1>
          <p className="text-text-secondary text-base font-normal">Visión general de tu rendimiento.</p>
        </div>
        <a 
            href="https://uvmonline.blackboard.com/ultra/course" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-surface-lighter hover:bg-white/10 text-white rounded-lg transition-colors font-medium text-sm"
        >
            <span className="material-symbols-outlined">open_in_new</span>
            Ir a Blackboard
        </a>
      </div>
    </header>

    <div className="w-full px-6 py-8">
      {/* Overall Performance Chart */}
      {grades && grades.length > 0 && (
        <OverallPerformanceChart grades={grades} onCourseClick={onCourseClick} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {grades && grades.length > 0 ? (
            grades.map((grade, index) => {
              // Try to find course by Internal ID first, then by Name (fuzzy)
              const course = courses?.find(c => {
                  // 1. Match by Internal ID (most reliable)
                  if (c.internalId && grade.internalId && c.internalId === grade.internalId) return true;
                  
                  // 2. Match by Name (fuzzy)
                  if (c.name === grade.course) return true;
                  
                  // 3. Match by Name (normalized)
                  const normalize = (s) => s ? s.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
                  if (normalize(c.name) === normalize(grade.course)) return true;
                  
                  return false;
              });

              const displayId = course?.id || grade.courseId;
              const professor = course?.professor;
              
              return (
              <div 
                key={index} 
                className="p-6 rounded-xl bg-surface-dark border border-border-dark flex flex-col gap-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                        <h3 className="text-white font-bold text-lg leading-tight flex-1">{grade.course}</h3>
                    </div>
                    <div className="flex flex-col gap-1">
                        {displayId && (
                            <span className="text-xs font-mono text-text-secondary flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">fingerprint</span>
                                {displayId}
                            </span>
                        )}
                        {professor && (
                            <span className="text-xs text-text-secondary flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">school</span>
                                {professor}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="flex items-end gap-2">
                   <span className="text-4xl font-black text-primary">{grade.grade}</span>
                   <span className="text-text-secondary text-sm mb-1">Calificación</span>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                    <button 
                        onClick={() => onCourseClick(grade.course)}
                        className="w-full py-2 px-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">analytics</span>
                        Ver Detalles
                    </button>
                </div>
              </div>
            )})
         ) : (
            <EmptyState 
                icon="bar_chart" 
                title="Sin Datos de KPIs" 
                message="Necesitamos sincronizar con Blackboard para generar tus métricas." 
            />
         )}
      </div>
    </div>
  </div>
)

const CoursesView = ({ courses }) => (
  <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background-dark p-8">
    <h1 className="text-white text-3xl font-bold mb-6">Mis Cursos</h1>
    {courses && courses.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <div 
            key={index} 
            onClick={() => course.url && window.open(course.url, '_blank')}
            className="p-6 rounded-xl bg-surface-dark border border-border-dark hover:border-primary transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="size-10 rounded-lg bg-surface-lighter flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                <span className="material-symbols-outlined">book</span>
              </div>
              <span className="text-xs font-mono text-text-secondary bg-surface-lighter px-2 py-1 rounded">{course.id}</span>
            </div>
            <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{course.name}</h3>
            <p className="text-text-secondary text-sm flex items-center gap-1">
              Ver curso en Blackboard 
              <span className="material-symbols-outlined text-xs">open_in_new</span>
            </p>
          </div>
        ))}
      </div>
    ) : (
      <EmptyState icon="book" title="No hay cursos cargados" message="Sincroniza tu cuenta para ver tus materias." />
    )}
  </div>
)

const CalendarView = ({ tasks, columns, onEditTask, onUpdateTask }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewStartDate, setViewStartDate] = useState(new Date());
  const containerRef = useRef(null);
  const [dragState, setDragState] = useState(null); // { taskId, type: 'move'|'resize'|'schedule', startX, initialStart, initialEnd }
  const [tempTask, setTempTask] = useState(null); // { id, start, end }

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Reset view to start of current cycle (Monday 3:00 AM) when mounting
  useEffect(() => {
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 1=Mon, ...
    const currentHour = now.getHours();
    
    let diff = 0;
    if (day === 1 && currentHour < 3) {
        diff = -7;
    } else if (day === 0) { // Sunday
        diff = -6;
    } else {
        diff = 1 - day; // e.g. Tue(2) -> 1-2 = -1 (Yesterday)
    }
    
    const start = new Date(now);
    start.setDate(now.getDate() + diff);
    start.setHours(3, 0, 0, 0);
    
    setViewStartDate(start);
  }, []);

  const parseDate = (dateStr) => {
    if (!dateStr || dateStr === 'Sin fecha') return null;
    
    // Clean string: remove common prefixes and extra spaces
    let cleanStr = dateStr.replace(/^(Vencimiento|Entrega|Fecha|Due|Date|Para el):\s*/i, '').trim();

    // 1. Try ISO date or standard JS date
    let date = new Date(cleanStr);
    if (!isNaN(date.getTime())) return date;

    // 2. Try DD/MM/YYYY or DD-MM-YYYY format (Relaxed start anchor)
    const ddmmyyyy = cleanStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (ddmmyyyy) {
        const day = parseInt(ddmmyyyy[1]);
        const month = parseInt(ddmmyyyy[2]) - 1; 
        let year = parseInt(ddmmyyyy[3]);
        if (year < 100) year += 2000; 
        
        const parsed = new Date(year, month, day);
        const timePart = cleanStr.match(/(\d{1,2}):(\d{2})/);
        if (timePart) {
            parsed.setHours(parseInt(timePart[1]), parseInt(timePart[2]));
        }
        return parsed;
    }

    // 3. Try "DD de Month" format (Spanish)
    const spanishMonths = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const textDate = cleanStr.toLowerCase().match(/(\d{1,2})\s+de\s+([a-z]+)/);
    if (textDate) {
        const day = parseInt(textDate[1]);
        const monthName = textDate[2];
        const monthIndex = spanishMonths.findIndex(m => m.startsWith(monthName)); 
        
        if (monthIndex !== -1) {
            const now = new Date();
            let year = now.getFullYear();
            const parsed = new Date(year, monthIndex, day);
             const timePart = cleanStr.match(/(\d{1,2}):(\d{2})/);
            if (timePart) {
                parsed.setHours(parseInt(timePart[1]), parseInt(timePart[2]));
            }
            return parsed;
        }
    }

    // 4. Try "Day - Time" format (e.g., "Lunes - 03:00")
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const englishDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const lowerDateStr = cleanStr.toLowerCase();
    let dayIndex = days.findIndex(d => lowerDateStr.startsWith(d.toLowerCase()));
    if (dayIndex === -1) {
        dayIndex = englishDays.findIndex(d => lowerDateStr.startsWith(d.toLowerCase()));
    }

    if (dayIndex !== -1) {
      const now = new Date();
      const currentDayIndex = now.getDay(); // 0=Sun, 1=Mon...
      
      const currentMonSun = currentDayIndex === 0 ? 7 : currentDayIndex;
      const targetMonSun = dayIndex === 0 ? 7 : dayIndex;
      
      const diffDays = targetMonSun - currentMonSun;
      
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + diffDays);
      
      // Parse Time if available
      if (cleanStr.includes('-') || cleanStr.includes(':')) {
          const timePart = cleanStr.match(/(\d{1,2}):(\d{2})/);
          if (timePart) {
              targetDate.setHours(parseInt(timePart[1]), parseInt(timePart[2]), 0, 0);
          }
      }
      
      return targetDate;
    }
    return null;
  };

  const daysToShow = 7;
  const viewEndDate = new Date(viewStartDate);
  viewEndDate.setDate(viewStartDate.getDate() + daysToShow);

  const processedTasks = useMemo(() => {
    return tasks.map(t => {
        // Override with temp state if being dragged
        if (tempTask && tempTask.id === t.id) {
             return { ...t, start: new Date(tempTask.start), end: new Date(tempTask.end) };
        }

        let start, end;
        if (t.startDate && t.endDate) {
            start = new Date(t.startDate);
            end = new Date(t.endDate);
        }
        return { ...t, start, end };
    }).filter(t => t.start && t.end && t.end >= viewStartDate && t.start <= viewEndDate);
  }, [tasks, viewStartDate, tempTask]);

  const unscheduledTasks = useMemo(() => {
      return tasks.filter(t => {
          // Hide if currently being dragged onto timeline
          if (tempTask && tempTask.id === t.id) return false;

          if (t.startDate && t.endDate) return false;
          return true;
      });
  }, [tasks, tempTask]);
  
  const getPosition = (date) => {
    const totalMs = viewEndDate - viewStartDate;
    const diffMs = date - viewStartDate;
    return (diffMs / totalMs) * 100;
  };

  const currentPos = getPosition(currentTime);

  const navigate = (days) => {
    const newDate = new Date(viewStartDate);
    newDate.setDate(viewStartDate.getDate() + days);
    setViewStartDate(newDate);
  }

  // Drag and Drop Logic
  useEffect(() => {
    const handleMouseMove = (e) => {
        if (!dragState || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const totalMs = viewEndDate.getTime() - viewStartDate.getTime();
        const msPerPixel = totalMs / containerWidth;

        // Handle 'schedule' type (dragging from bottom list)
        if (dragState.type === 'schedule') {
            // If Y is below the timeline container (with buffer), unschedule.
            if (e.clientY > containerRect.bottom + 50) {
                 setTempTask(null);
                 return;
            }

            const relativeX = e.clientX - containerRect.left;
            const timeOffset = relativeX * msPerPixel;
            let newStart = viewStartDate.getTime() + timeOffset;
            let newEnd = newStart + (60 * 60 * 1000); // Default 1 hour

            setTempTask({
                id: dragState.taskId,
                start: newStart,
                end: newEnd
            });
            return;
        }

        const deltaX = e.clientX - dragState.startX;
        const deltaMs = deltaX * msPerPixel;

        const task = tasks.find(t => t.id === dragState.taskId);
        if (!task) return;

        let newStart = dragState.initialStart;
        let newEnd = dragState.initialEnd;

        if (dragState.type === 'move') {
            newStart += deltaMs;
            newEnd += deltaMs;
        } else if (dragState.type === 'resize') {
            newEnd += deltaMs;
            // Prevent end before start
            if (newEnd <= newStart + (15 * 60 * 1000)) { // Min 15 mins
                newEnd = newStart + (15 * 60 * 1000);
            }
        }

        setTempTask({
            id: dragState.taskId,
            start: newStart,
            end: newEnd
        });
    };

    const handleMouseUp = () => {
        if (dragState && tempTask) {
            const task = tasks.find(t => t.id === dragState.taskId);
            if (task) {
                onUpdateTask({
                    ...task,
                    startDate: tempTask.start,
                    endDate: tempTask.end
                });
            }
        }
        setDragState(null);
        setTempTask(null);
    };

    if (dragState) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, tempTask, viewStartDate, viewEndDate, tasks, onUpdateTask]);

  const handleMouseDown = (e, task, type) => {
      e.stopPropagation();
      
      if (type === 'schedule') {
          setDragState({
              taskId: task.id,
              type: 'schedule',
              startX: e.clientX,
              initialStart: 0,
              initialEnd: 0
          });
          return;
      }

      // Find current start/end (might be different from task.startDate if derived)
      const processed = processedTasks.find(t => t.id === task.id);
      if (!processed) return;

      setDragState({
          taskId: task.id,
          type,
          startX: e.clientX,
          initialStart: processed.start.getTime(),
          initialEnd: processed.end.getTime()
      });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark">
      <header className="flex-none px-6 py-6 md:px-10 md:py-8 border-b border-border-dark bg-background-dark/95 backdrop-blur z-10 sticky top-0">
        <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">Cronograma Gantt</h1>
                <div className="flex items-center gap-4 bg-surface-dark p-1 rounded-lg border border-border-dark inline-flex w-fit">
                    <button onClick={() => navigate(-7)} className="p-1 hover:bg-white/10 rounded text-text-secondary hover:text-white">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button onClick={() => {
                        const now = new Date();
                        const day = now.getDay();
                        const currentHour = now.getHours();
                        let diff = 0;
                        if (day === 1 && currentHour < 3) {
                            diff = -7;
                        } else if (day === 0) {
                            diff = -6;
                        } else {
                            diff = 1 - day;
                        }
                        const start = new Date(now);
                        start.setDate(now.getDate() + diff);
                        start.setHours(3, 0, 0, 0);
                        setViewStartDate(start);
                    }} className="px-3 py-1 text-sm font-bold text-white hover:bg-white/10 rounded">
                        Hoy
                    </button>
                    <span className="text-sm text-text-secondary font-mono border-l border-r border-border-dark px-3">
                        {viewStartDate.toLocaleDateString([], {month: 'short', day: 'numeric'})} - {new Date(viewEndDate.getTime() - 1).toLocaleDateString([], {month: 'short', day: 'numeric'})}
                    </span>
                    <button onClick={() => navigate(7)} className="p-1 hover:bg-white/10 rounded text-text-secondary hover:text-white">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>
            <div className="text-right">
                <div className="text-2xl font-mono text-primary font-bold">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-text-secondary text-sm">
                    {currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
            </div>
        </div>
      </header>
      <div className="flex-1 overflow-hidden p-8">

      <div className="flex-1 flex flex-col overflow-hidden border border-border-dark rounded-xl bg-surface-dark">
          {/* Header Days */}
          <div className="flex border-b border-border-dark sticky top-0 bg-surface-dark z-20 h-12 shrink-0">
            <div className="flex-1 relative">
              {Array.from({ length: daysToShow }).map((_, i) => {
                const d = new Date(viewStartDate);
                d.setDate(viewStartDate.getDate() + i);
                const isToday = d.toDateString() === new Date().toDateString();
                return (
                  <div key={i} className={`absolute top-0 bottom-0 border-l border-border-dark/30 flex items-center justify-center text-xs ${isToday ? 'bg-primary/5 text-primary font-bold' : 'text-text-secondary'}`} style={{ left: `${(i / daysToShow) * 100}%`, width: `${100 / daysToShow}%` }}>
                    {d.toLocaleDateString([], { weekday: 'short', day: 'numeric' })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Body */}
          <div className="relative flex-1 overflow-y-auto">
            {/* Grid Lines (Background) */}
            <div className="absolute inset-0 flex pointer-events-none h-full">
               <div className="flex-1 relative h-full" ref={containerRef}>
                 {Array.from({ length: daysToShow }).map((_, i) => (
                   <div key={i} className="absolute top-0 bottom-0 border-l border-border-dark/30" style={{ left: `${(i / daysToShow) * 100}%` }}></div>
                 ))}
                 {/* Current Time Line */}
                 {currentPos >= 0 && currentPos <= 100 && (
                   <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ left: `${currentPos}%` }}>
                     <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                   </div>
                 )}
               </div>
            </div>

            {/* Tasks Rows */}
            <div className="relative z-10">
              {processedTasks.map((task, idx) => {
                const startPos = getPosition(task.start);
                const endPos = getPosition(task.end);
                const width = endPos - startPos;
                
                const column = columns ? columns.find(c => c.id === task.status) : null;
                const color = column ? column.color : 'red';
                
                const colorMap = {
                    red: 'bg-red-500/20 border-red-500',
                    yellow: 'bg-yellow-500/20 border-yellow-500',
                    green: 'bg-green-500/20 border-green-500',
                    blue: 'bg-blue-500/20 border-blue-500',
                    purple: 'bg-purple-500/20 border-purple-500',
                    pink: 'bg-pink-500/20 border-pink-500',
                    orange: 'bg-orange-500/20 border-orange-500',
                    teal: 'bg-teal-500/20 border-teal-500',
                    gray: 'bg-gray-500/20 border-gray-500',
                };
                const colorClass = colorMap[color] || colorMap['red'];
                
                return (
                  <div key={idx} className="flex border-b border-border-dark/50 hover:bg-white/5 transition-colors group h-14 items-center relative">
                    <div className="flex-1 relative h-full">
                      {/* Task Bar */}
                      <div 
                        className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-md border flex items-center px-2 cursor-pointer transition-all shadow-lg
                          ${colorClass}
                          ${dragState?.taskId === task.id ? 'opacity-80 cursor-grabbing' : 'hover:brightness-110'}
                        `}
                        style={{ 
                          left: `${startPos}%`, 
                          width: `${width}%`,
                          minWidth: '4px'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, task, 'move')}
                        onDoubleClick={() => onEditTask(task)}
                        title={`${task.title}\nInicio: ${task.start.toLocaleString()}\nFin: ${task.end.toLocaleString()}`}
                      >
                        <span className="text-xs text-white truncate w-full text-left pr-1 select-none">
                          {task.title}
                        </span>
                        
                        {/* Resize Handle */}
                        <div 
                            className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize hover:bg-white/20"
                            onMouseDown={(e) => handleMouseDown(e, task, 'resize')}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Empty Rows for Unscheduled Tasks */}
              {unscheduledTasks.map((_, idx) => (
                  <div key={`empty-${idx}`} className="flex border-b border-border-dark/30 h-14 items-center relative bg-white/0">
                  </div>
              ))}
            </div>
          </div>
          
          {/* Unscheduled Tasks Area */}
          <div className="h-48 border-t border-border-dark bg-surface-dark/50 p-4 overflow-y-auto shrink-0 z-30">
            <h3 className="text-text-secondary font-bold text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">inbox</span>
                Actividades Pendientes (Arrastra al calendario)
            </h3>
            <div className="flex flex-wrap gap-3">
                {unscheduledTasks.length > 0 ? unscheduledTasks.map(task => (
                    <div 
                        key={task.id}
                        onMouseDown={(e) => handleMouseDown(e, task, 'schedule')}
                        className="bg-surface-lighter border border-border-dark p-3 rounded-lg cursor-grab hover:border-primary hover:shadow-md transition-all w-64 group select-none active:cursor-grabbing"
                    >
                        <div className="font-bold text-white text-sm truncate">{task.title}</div>
                        <div className="text-xs text-text-secondary truncate">{task.course}</div>
                    </div>
                )) : (
                    <div className="text-text-secondary text-sm italic w-full text-center py-4">No hay actividades pendientes.</div>
                )}
            </div>
          </div>
      </div>
    </div>
    </div>
  );
}

const NewTaskModal = ({ onClose, onSave, courses }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState(courses.length > 0 ? courses[0].name : 'General');
  const [date, setDate] = useState('');
  const [source, setSource] = useState('Clase');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let finalDateStr = date;
    let startDate = null;
    let endDate = null;

    if (date) {
        const d = new Date(date);
        if (!isNaN(d.getTime())) {
             // Format: DD/MM/YYYY HH:mm
             const day = d.getDate().toString().padStart(2, '0');
             const month = (d.getMonth() + 1).toString().padStart(2, '0');
             const year = d.getFullYear();
             const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
             finalDateStr = `${day}/${month}/${year} ${time}`;
             
             startDate = d.getTime();
             endDate = d.getTime() + (60 * 60 * 1000); // 1 hour default
        }
    }

    onSave({
      id: Date.now().toString(),
      title,
      description,
      course,
      date: finalDateStr || 'Sin fecha',
      startDate,
      endDate,
      status: 'todo',
      source
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-dark border border-border-dark rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Nueva Tarea</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Título</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Descripción</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary h-24 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Materia</label>
              <select 
                value={course} 
                onChange={(e) => setCourse(e.target.value)} 
                className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
              >
                <option value="General">General</option>
                {courses.map((c, idx) => (
                  <option key={idx} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Fuente</label>
              <select 
                value={source} 
                onChange={(e) => setSource(e.target.value)} 
                className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
              >
                <option value="Clase">Clase</option>
                <option value="Teams">Teams</option>
                <option value="Blackboard">Blackboard</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Fecha de Entrega</label>
            <input 
              type="datetime-local" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary [color-scheme:dark]"
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-black font-bold hover:bg-primary/90 transition-colors">Crear Tarea</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ColumnSettingsModal = ({ column, onClose, onSave, onDelete }) => {
  const [title, setTitle] = useState(column.title);
  const [color, setColor] = useState(column.color);

  const colors = [
    { id: 'red', label: 'Rojo' },
    { id: 'yellow', label: 'Amarillo' },
    { id: 'green', label: 'Verde' },
    { id: 'blue', label: 'Azul' },
    { id: 'purple', label: 'Morado' },
    { id: 'pink', label: 'Rosa' },
    { id: 'orange', label: 'Naranja' },
    { id: 'teal', label: 'Verde Azulado' },
    { id: 'gray', label: 'Gris' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...column, title, color });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-dark border border-border-dark rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Editar Columna</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Título</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Color</label>
             <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                {colors.map((c) => (
                   <div 
                     key={c.id} 
                     onClick={() => setColor(c.id)}
                     className={`w-8 h-8 rounded-full cursor-pointer border-2 flex items-center justify-center ${color === c.id ? 'border-white' : 'border-transparent'}`}
                   >
                      <div className={`w-6 h-6 rounded-full bg-${c.id}-500`}></div>
                   </div>
                ))}
             </div>
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-dark">
            <button type="button" onClick={() => onDelete(column.id)} className="text-red-500 text-sm hover:underline">Eliminar Columna</button>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-3 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors text-sm">Cancelar</button>
              <button type="submit" className="px-3 py-2 rounded-lg bg-primary text-black font-bold hover:bg-primary/90 transition-colors text-sm">Guardar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const SettingsView = () => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleClearData = () => {
        if (showDeleteConfirm) {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.clear(() => {
                    window.location.reload();
                });
            }
        } else {
            setShowDeleteConfirm(true);
            setTimeout(() => setShowDeleteConfirm(false), 3000);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background-dark">
            <header className="flex-none px-6 py-6 md:px-10 md:py-8 border-b border-border-dark bg-background-dark/95 backdrop-blur z-10 sticky top-0">
                <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">Configuración</h1>
                        <p className="text-text-secondary text-base font-normal">Personaliza tu experiencia en GoodBoard.</p>
                    </div>
                </div>
            </header>
            <div className="w-full p-8">
                <div className="grid grid-cols-1 gap-6">
                    {/* General Settings */}
                    <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">tune</span>
                            General
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-surface-lighter/20 rounded-lg opacity-50 cursor-not-allowed">
                                <div className="flex flex-col">
                                    <span className="text-white font-medium">Tema Oscuro</span>
                                    <span className="text-xs text-text-secondary">Activar o desactivar el modo oscuro</span>
                                </div>
                                <div className="w-10 h-5 bg-primary rounded-full relative">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-black rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-surface-lighter/20 rounded-lg opacity-50 cursor-not-allowed">
                                <div className="flex flex-col">
                                    <span className="text-white font-medium">Notificaciones</span>
                                    <span className="text-xs text-text-secondary">Recibir alertas de tareas próximas</span>
                                </div>
                                <div className="w-10 h-5 bg-surface-lighter rounded-full relative">
                                    <div className="absolute left-1 top-1 w-3 h-3 bg-text-secondary rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-400">database</span>
                            Gestión de Datos
                        </h2>
                        <p className="text-sm text-text-secondary mb-4">
                            Si experimentas problemas con los datos o quieres reiniciar, puedes borrar toda la información almacenada localmente.
                        </p>
                        <button 
                            onClick={handleClearData}
                            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                                showDeleteConfirm 
                                    ? 'bg-red-500 text-white hover:bg-red-600' 
                                    : 'bg-surface-lighter text-text-secondary hover:text-white hover:bg-red-500/20'
                            }`}
                        >
                            <span className="material-symbols-outlined">delete_forever</span>
                            {showDeleteConfirm ? '¿Estás seguro? Click para confirmar' : 'Borrar Datos Locales'}
                        </button>
                    </div>

                    {/* About */}
                    <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">info</span>
                            Acerca de
                        </h2>
                        <div className="flex flex-col gap-2 text-sm text-text-secondary">
                            <p>GoodBoard v1.0.0</p>
                            <p>Desarrollado para mejorar la experiencia de Blackboard UVM.</p>
                            <div className="mt-2 flex gap-4">
                                <a href="#" className="text-primary hover:underline">GitHub</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EditTaskModal = ({ task, onClose, onSave, courses }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [course, setCourse] = useState(task.course);
  const [date, setDate] = useState(task.date || '');
  const [startDate, setStartDate] = useState(task.startDate ? new Date(task.startDate).toISOString().slice(0, 16) : '');
  const [endDate, setEndDate] = useState(task.endDate ? new Date(task.endDate).toISOString().slice(0, 16) : '');
  const [instructions, setInstructions] = useState(null);
  const [loadingInstructions, setLoadingInstructions] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...task,
      title,
      description,
      course,
      date,
      startDate: startDate ? new Date(startDate).getTime() : undefined,
      endDate: endDate ? new Date(endDate).getTime() : undefined
    });
  };

  const handleFetchInstructions = () => {
    if (!task.url) return;
    setLoadingInstructions(true);
    
    // Find a blackboard tab
    chrome.tabs.query({url: "*://uvmonline.blackboard.com/*"}, (tabs) => {
        if (tabs && tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, { 
                action: "FETCH_INSTRUCTIONS", 
                url: task.url 
            }, (response) => {
                setLoadingInstructions(false);
                if (chrome.runtime.lastError) {
                     console.error(chrome.runtime.lastError);
                     setInstructions('<p class="text-red-500">Error de conexión con Blackboard. Recarga la pestaña de Blackboard.</p>');
                     return;
                }
                if (response && response.success) {
                    setInstructions(response.html);
                } else {
                    setInstructions('<p class="text-red-500">Error al cargar instrucciones. ' + (response?.error || '') + '</p>');
                }
            });
        } else {
            setLoadingInstructions(false);
            setInstructions('<p class="text-yellow-500">No se encontró una pestaña de Blackboard abierta. Por favor abre Blackboard en otra pestaña para cargar los datos.</p>');
        }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-dark border border-border-dark rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Editar Tarea</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Título</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
              required
            />
          </div>
          
          {task.url && (
            <div className="bg-background-dark border border-border-dark rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-text-secondary">Instrucciones de Blackboard</label>
                    <button 
                        type="button" 
                        onClick={handleFetchInstructions}
                        disabled={loadingInstructions}
                        className="text-xs bg-primary/20 text-primary px-2 py-1 rounded hover:bg-primary/30 transition-colors"
                    >
                        {loadingInstructions ? 'Cargando...' : (instructions ? 'Recargar' : 'Ver Instrucciones')}
                    </button>
                </div>
                {instructions && (
                    <div 
                        className="prose prose-invert prose-sm max-w-none bg-black/20 p-3 rounded border border-white/5 overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: instructions }}
                    />
                )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Descripción</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary h-24 resize-none"
            />
          </div>
          <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Materia</label>
              <select 
                value={course} 
                onChange={(e) => setCourse(e.target.value)} 
                className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
              >
                <option value="General">General</option>
                {course && course !== 'General' && !courses.some(c => c.name === course) && (
                    <option value={course}>{course}</option>
                )}
                {courses.map((c, idx) => (
                  <option key={idx} value={c.name}>{c.name}</option>
                ))}
              </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Fecha de Entrega (Blackboard)</label>
            <input 
              type="text" 
              value={date} 
              readOnly
              className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-text-secondary focus:outline-none cursor-not-allowed opacity-70"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Inicio (Planificado)</label>
                <input 
                  type="datetime-local" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  style={{ colorScheme: 'dark' }}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Fin (Planificado)</label>
                <input 
                  type="datetime-local" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  style={{ colorScheme: 'dark' }}
                />
             </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-black font-bold hover:bg-primary/90 transition-colors">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App
