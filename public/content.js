console.log("GoodBoard Content Script Loaded");

function scrapeCalendar() {
  console.log("Scraping Calendar...");
  const tasks = [];
  const seenIds = new Set();

  // Helper to clean date strings
  const cleanDate = (text) => {
      if (!text) return '';
      let cleaned = text.replace('Fecha de entrega:', '').trim();
      if (cleaned.includes('(')) {
          cleaned = cleaned.split('(')[0].trim();
      }
      return cleaned;
  };

  // List View
  const listRows = document.querySelectorAll('.fc-list-table tr');
  if (listRows.length > 0) {
    let currentDate = 'Sin fecha';
    
    listRows.forEach((row, index) => {
      if (row.classList.contains('fc-list-heading')) {
        const dateHeader = row.getAttribute('data-date') || row.querySelector('.fc-list-heading-main')?.innerText || row.innerText;
        currentDate = dateHeader;
      } else if (row.classList.contains('fc-list-item')) {
        const titleEl = row.querySelector('.fc-list-item-title');
        const timeEl = row.querySelector('.fc-list-item-time');
        const markerEl = row.querySelector('.fc-list-item-marker');
        
        if (titleEl) {
          const title = titleEl.innerText.trim();
          const time = timeEl ? timeEl.innerText.trim() : '';
          const fullDate = time ? `${currentDate} - ${time}` : currentDate;
          
          let colorClass = 'course-color-1';
          if (markerEl) {
             const span = markerEl.querySelector('span.fc-event-dot');
             if (span) {
                const classes = Array.from(span.classList);
                const found = classes.find(c => c.startsWith('course-color-'));
                if (found) colorClass = found;
             }
          }

          const colorMap = {
            'course-color-1': 'blue', 'course-color-2': 'purple', 'course-color-3': 'pink',
            'course-color-4': 'red', 'course-color-5': 'orange', 'course-color-6': 'yellow',
            'course-color-7': 'green', 'course-color-8': 'teal',
          };
          
          const signature = `${title}-${fullDate}`;
          if (!seenIds.has(signature)) {
            seenIds.add(signature);
            tasks.push({
              id: `bb-list-${signature.replace(/[^a-z0-9]/gi, '-')}`,
              title: title,
              date: fullDate,
              course: 'Blackboard Event',
              color: colorMap[colorClass] || 'blue',
              status: 'todo',
              description: 'Importado de Agenda'
            });
          }
        }
      }
    });
  }

  // Grid View
  const gridEvents = document.querySelectorAll('.fc-event');
  console.log(`[GoodBoard] Found ${gridEvents.length} grid events`);
  
  gridEvents.forEach((event, index) => {
    if (event.closest('.fc-list-table')) return;

    const titleEl = event.querySelector('.fc-title');
    const dateEl = event.querySelector('.dueDate') || event.querySelector('.fc-time');
    const courseEl = event.querySelector('.calendarName');
    
    let course = 'General';
    if (courseEl) {
        course = courseEl.innerText.trim();
        if (course.includes(':')) {
            course = course.split(':')[1].trim();
        }
    }

    let date = 'Sin fecha';
    if (event.hasAttribute('data-start')) date = event.getAttribute('data-start');
    else if (event.hasAttribute('data-date')) date = event.getAttribute('data-date');
    
    if (date === 'Sin fecha') {
        const parentCell = event.closest('td[data-date]');
        if (parentCell) date = parentCell.getAttribute('data-date');
        else {
            // Try to find column index for Time Grid view
            const col = event.closest('td');
            if (col) {
                const row = col.parentElement;
                if (row) {
                    const colIndex = Array.from(row.children).indexOf(col);
                    // Scope headers to the specific view to avoid conflicts
                    const view = event.closest('.fc-view');
                    const headers = view ? view.querySelectorAll('.fc-day-header') : document.querySelectorAll('.fc-day-header');
                    
                    if (headers[colIndex]) {
                        date = headers[colIndex].getAttribute('data-date') || headers[colIndex].innerText;
                    } else if (headers.length > 0 && colIndex > 0 && headers[colIndex - 1]) {
                         // Try previous index if axis is counted in row children but not in headers
                         date = headers[colIndex - 1].getAttribute('data-date') || headers[colIndex - 1].innerText;
                    }
                }
            }
        }
    }

    if (dateEl) {
        const timeText = cleanDate(dateEl.innerText);
        if (date === 'Sin fecha') date = timeText;
        else if (!date.includes(timeText)) date += ` ${timeText}`;
    }

    const classes = Array.from(event.classList);
    const colorClass = classes.find(c => c.startsWith('course-color-'));
    
    const colorMap = {
      'course-color-1': 'blue', 'course-color-2': 'purple', 'course-color-3': 'pink',
      'course-color-4': 'red', 'course-color-5': 'orange', 'course-color-6': 'yellow',
      'course-color-7': 'green', 'course-color-8': 'teal',
    };

    if (titleEl) {
      const title = titleEl.innerText.trim();
      // Use Title + Course + Date for signature to avoid duplicates
      const signature = `${title}-${course}-${date}`;
      
      if (!seenIds.has(signature)) {
        seenIds.add(signature);
        tasks.push({
          id: `bb-grid-${signature.replace(/[^a-z0-9]/gi, '-')}`,
          title: title,
          date: date,
          course: course,
          color: colorMap[colorClass] || 'blue',
          status: 'todo',
          description: 'Importado de Calendario'
        });
      }
    } else {
        console.log(`[GoodBoard] Event ${index} skipped: No title element found`);
    }
  });

  // Ultra List View
  const ultraListItems = document.querySelectorAll('.element-card.due-item');
  if (ultraListItems.length > 0) {
      console.log(`[GoodBoard] Found ${ultraListItems.length} Ultra List items`);
      ultraListItems.forEach((item) => {
          const titleEl = item.querySelector('.element-details .name a');
          const dateEl = item.querySelector('.element-details .content span');
          const courseEl = item.querySelector('.element-details .content a');
          
          if (titleEl) {
              const title = titleEl.innerText.trim();
              let date = dateEl ? dateEl.innerText.trim() : 'Sin fecha';
              date = cleanDate(date); // Use the helper
              
              const course = courseEl ? courseEl.innerText.trim() : 'General';
              
              // Extract color
              const classes = Array.from(item.classList);
              const colorClass = classes.find(c => c.startsWith('course-color-'));
              const colorMap = {
                  'course-color-1': 'blue', 'course-color-2': 'purple', 'course-color-3': 'pink',
                  'course-color-4': 'red', 'course-color-5': 'orange', 'course-color-6': 'yellow',
                  'course-color-7': 'green', 'course-color-8': 'teal',
              };

              const signature = `${title}-${course}-${date}`;
              if (!seenIds.has(signature)) {
                  seenIds.add(signature);
                  tasks.push({
                      id: `bb-ultra-list-${signature.replace(/[^a-z0-9]/gi, '-')}`,
                      title: title,
                      date: date,
                      course: course,
                      color: colorMap[colorClass] || 'blue',
                      status: 'todo',
                      description: 'Importado de Agenda Ultra'
                  });
              }
          }
      });
  }

  // Ultra Calendar
  const ultraEvents = document.querySelectorAll('[data-testid="calendar-event-item"], .bb-calendar-event, .element-card.event, .fc-event, [role="listitem"]');
  
  if (ultraEvents.length > 0) {
      console.log("Found Ultra Events:", ultraEvents.length);
      ultraEvents.forEach((event, index) => {
          // Skip if it's inside the list table we already processed
          if (event.closest('.fc-list-table')) return;
          // Skip if it's the due-item we just processed
          if (event.classList.contains('due-item')) return;

          const titleEl = event.querySelector('h3, .title, .event-title, [data-testid="event-title"]');
          const dateEl = event.querySelector('.date, .time, .timestamp, [data-testid="event-date"]');
          const courseEl = event.querySelector('.course-name, .context, [data-testid="event-course"]');

          if (titleEl) {
              const title = titleEl.innerText.trim();
              const date = dateEl ? cleanDate(dateEl.innerText) : 'Sin fecha';
              const course = courseEl ? courseEl.innerText.trim() : 'Blackboard Event';
              
              const signature = `${title}-${date}`;
              if (!seenIds.has(signature)) {
                  seenIds.add(signature);
                  tasks.push({
                      id: `bb-ultra-${signature.replace(/[^a-z0-9]/gi, '-')}`,
                      title: title,
                      date: date,
                      course: course,
                      color: 'blue', // Default for now
                      status: 'todo',
                      description: 'Importado de Ultra Calendario'
                  });
              }
          }
      });
  }

  // Fallback: Generic links
  if (tasks.length === 0) {
      const potentialEvents = document.querySelectorAll('a[href*="course_id"]');
      potentialEvents.forEach((link, index) => {
          const text = link.innerText;
          // Simple heuristic: if it has a date-like string
          if (/\d{1,2}\/\d{1,2}/.test(text) || /vence|due/i.test(text)) {
              const title = text.split(/\n| - /)[0].trim();
              const date = text.match(/\d{1,2}\/\d{1,2}(\/\d{2,4})?/) ? text.match(/\d{1,2}\/\d{1,2}(\/\d{2,4})?/)[0] : 'Pendiente';
              const signature = `${title}-${date}`;
              
              if (!seenIds.has(signature)) {
                  seenIds.add(signature);
                  tasks.push({
                      id: `bb-fallback-${signature.replace(/[^a-z0-9]/gi, '-')}`,
                      title: title, // Take first part
                      date: date,
                      course: 'Evento Detectado',
                      color: 'orange',
                      status: 'todo',
                      description: 'Detectado por heurística'
                  });
              }
          }
      });
  }

  // Aggressive Fallback
  if (tasks.length < 5) {
      const allEvents = document.querySelectorAll('.fc-event');
      allEvents.forEach((event) => {
          const text = event.innerText;
          if (!text) return;
          
          // Heuristic: First line is title, look for time/date in other lines
          const parts = text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
          if (parts.length > 0) {
              const title = parts[0];
              // Try to find a line that looks like a date or time
              let date = parts.find(p => p.includes(':') || /\d/.test(p)) || 'Sin fecha';
              
              // Clean up date if it has "Fecha de entrega:"
              date = date.replace('Fecha de entrega:', '').trim();

              const signature = `${title}-${date}`;
              if (!seenIds.has(signature)) {
                  seenIds.add(signature);
                  tasks.push({
                      id: `bb-aggressive-${signature.replace(/[^a-z0-9]/gi, '-')}`,
                      title: title,
                      date: date,
                      course: 'Evento General',
                      color: 'gray',
                      status: 'todo',
                      description: 'Recuperado por fuerza bruta'
                  });
              }
          }
      });
  }

  return tasks;
}

async function scrapeGrades() {
  console.log("Scraping Grades...");
  
  // Fetch stored courses to resolve names
  let storage = {};
  try {
      storage = await new Promise((resolve, reject) => {
          try {
              if (!chrome.runtime?.id) throw new Error("Extension context invalidated");
              chrome.storage.local.get(['goodBoardCourses', 'goodBoardAssignments'], (result) => {
                  if (chrome.runtime.lastError) {
                      reject(chrome.runtime.lastError);
                  } else {
                      resolve(result);
                  }
              });
          } catch (e) {
              reject(e);
          }
      });
  } catch (e) {
      console.warn("GoodBoard: Storage access failed (Context Invalidated). Please refresh the page.", e);
      return;
  }

  const storedCourses = storage.goodBoardCourses || [];
  const existingAssignments = storage.goodBoardAssignments || [];

  const grades = [];
  const assignments = [];

  // Global Grades Page
  const gradeCards = document.querySelectorAll('.element-card'); 
  if (gradeCards.length > 0) {
      gradeCards.forEach((card) => {
          const courseEl = card.querySelector('.subheader a');
          const gradeEl = card.querySelector('.customGradePill bdi');
          
          if (courseEl && gradeEl) {
              let courseUrl = courseEl.href;
              
              // Clean URL to ensure we go to the main course outline, not a legacy tool
              // Example bad URL: .../outline?legacyUrl=...
              // We want: .../ultra/courses/_12345_1/grades?courseId=_12345_1
              const idMatch = courseUrl.match(/course_id=(_[\d_]+)/) || courseUrl.match(/courses\/(_[\d_]+)/);
              if (idMatch && idMatch[1]) {
                  courseUrl = `https://uvmonline.blackboard.com/ultra/courses/${idMatch[1]}/grades?courseId=${idMatch[1]}`;
              }

              grades.push({
                  course: courseEl.innerText.trim(),
                  grade: gradeEl.innerText.trim(),
                  url: courseUrl,
                  internalId: idMatch ? idMatch[1] : null,
                  timestamp: Date.now()
              });
          }
      });
  }

  // Course Specific Grades Page
  const url = window.location.href;
  const isGlobalGrades = url.includes('/ultra/grades') && !url.includes('courseId=');
  
  if (!isGlobalGrades) {
      const assignmentRows = document.querySelectorAll('.tabular-row, [role="row"], .grade-item-row, .sortable_item_row'); 
      if (assignmentRows.length > 0) {
          let currentCourse = 'Unknown Course';

          // Try to get course name from URL ID mapping
          const idMatch = url.match(/courseId=(_[\d_]+)/);
          if (idMatch && idMatch[1]) {
              const found = storedCourses.find(c => c.url && c.url.includes(idMatch[1]));
              if (found) currentCourse = found.name;
          }

          // Fallback to DOM
          if (currentCourse === 'Unknown Course') {
              const courseNameEl = document.querySelector('.js-course-title-element') || 
                                   document.querySelector('h1[data-testid="course-title"]') ||
                                   document.querySelector('.base-header-title') ||
                                   document.querySelector('header h1') ||
                                   document.querySelector('.panel-title') ||
                                   document.querySelector('.subheader a');
              if (courseNameEl) currentCourse = courseNameEl.innerText.trim();
          }
          
          // Last resort: Breadcrumbs
          if (currentCourse === 'Unknown Course') {
              const breadcrumb = document.querySelector('.breadcrumbs a, .breadcrumb-link');
              if (breadcrumb) currentCourse = breadcrumb.innerText.trim();
          }

          console.log(`Scraping assignments for course: ${currentCourse}`);

          assignmentRows.forEach((row) => {
              // Skip header rows
              if (row.classList.contains('header') || row.querySelector('th')) return;

              const nameEl = row.querySelector('.js-gradable-item-link') || row.querySelector('.cell-gradable') || row.querySelector('[data-testid="gradable-item-name"]') || row.querySelector('h3') || row.querySelector('h4');
              const gradeEl = row.querySelector('.customGradePill bdi') || row.querySelector('.grade-value') || row.querySelector('[data-testid="grade-pill"]');
              
              // Improved Date Selector for Ultra Grades
              let date = 'Sin fecha';
              const rowText = row.innerText;
              
              // Look for DD/MM or DD/MM/YY
              const dateMatch = rowText.match(/(\d{1,2}\/\d{1,2}(\/\d{2,4})?)/);
              if (dateMatch) {
                  date = dateMatch[0];
              } else if (rowText.toLowerCase().includes('vence') || rowText.toLowerCase().includes('due')) {
                   const parts = rowText.split(/vence|due/i);
                   if (parts[1]) date = parts[1].trim().substring(0, 15);
              } else {
                  const secondaryText = row.querySelector('.secondary-text');
                  if (secondaryText) {
                      const secMatch = secondaryText.innerText.match(/(\d{1,2}\/\d{1,2}(\/\d{2,4})?)/);
                      if (secMatch) date = secMatch[0];
                  }
              }

              if (nameEl) {
                  const title = nameEl.innerText.trim();
                  // Avoid adding empty rows
                  if (!title) return;

                  // Capture URL if available
                  let assignmentUrl = '';
                  if (nameEl.tagName === 'A') {
                      assignmentUrl = nameEl.href;
                  } else {
                      const link = nameEl.querySelector('a');
                      if (link) assignmentUrl = link.href;
                  }

                  assignments.push({
                      title: title,
                      course: currentCourse,
                      grade: gradeEl ? gradeEl.innerText.trim() : 'N/A',
                      dueDate: date,
                      status: gradeEl ? 'graded' : 'pending',
                      url: assignmentUrl
                  });
              }
          });
      }
  }
  
  if (grades.length > 0) {
      chrome.storage.local.set({ 'goodBoardGrades': grades, 'lastSyncGrades': Date.now() });
      console.log("Global Grades saved:", grades);
  }

  if (assignments.length > 0) {
      // Filter out previous assignments for THIS course to avoid duplicates/stale data
      // But keep assignments from OTHER courses
      const currentCourseName = assignments[0].course; // Assuming all in this batch are same course
      
      const keptAssignments = existingAssignments.filter(a => a.course !== currentCourseName && a.course !== 'Unknown Course');
      
      const finalList = [...keptAssignments, ...assignments];
      
      // Final dedupe just in case
      const uniqueMap = new Map();
      finalList.forEach(a => uniqueMap.set(`${a.title}-${a.course}`, a));
      const unique = Array.from(uniqueMap.values());

      chrome.storage.local.set({ 'goodBoardAssignments': unique });
      console.log("Assignments saved:", unique.length);
  }

  return { grades, assignments };
}

function scrapeCourses() {
    console.log("Scraping Courses...");
    const courses = [];
    const seenIds = new Set(); // Use ID or Name+Prof as key, not just URL

    // Helper to add course if unique
    const addCourse = (course) => {
        const key = course.internalId || course.id || course.name;
        if (!key) return;

        if (!seenIds.has(key)) {
            seenIds.add(key);
            courses.push(course);
        } else {
            // Update existing course if new data is better (e.g. has professor or internalId)
            const existingIndex = courses.findIndex(c => (c.internalId && c.internalId === key) || (c.id && c.id === key) || c.name === key);
            if (existingIndex !== -1) {
                const existing = courses[existingIndex];
                if ((!existing.professor || existing.professor === 'Sin profesor asignado') && (course.professor && course.professor !== 'Sin profesor asignado')) {
                    courses[existingIndex] = { ...existing, ...course };
                }
                if (!existing.internalId && course.internalId) {
                    courses[existingIndex] = { ...existing, ...course };
                }
            }
        }
    };

    // Specific Card Selectors
    const courseCards = document.querySelectorAll('bb-base-course-card, .course-element-card, li[data-course-id], div[role="row"]');
    console.log(`[GoodBoard] Found ${courseCards.length} potential course cards`);

    if (courseCards.length > 0) {
        courseCards.forEach(card => {
            // Skip headers or non-course rows
            if (card.classList.contains('js-course-list-header') || card.querySelector('h2')) {
                 if (!card.querySelector('.js-course-title-element')) return;
            }

            // Try multiple selectors for title
            const titleEl = card.querySelector('.js-course-title-element') || 
                            card.querySelector('h3 a') || 
                            card.querySelector('.course-title') ||
                            card.querySelector('a[href*="/ultra/courses/"]') ||
                            card.querySelector('.name');
            
            // Try multiple selectors for link
            const linkEl = card.querySelector('a.course-title') || 
                           card.querySelector('a[href*="/ultra/courses/"]') ||
                           (titleEl && titleEl.tagName === 'A' ? titleEl : null);

            if (titleEl) {
                const name = titleEl.innerText.trim();
                const url = linkEl && linkEl.href ? linkEl.href : '';
                
                // Extract Internal ID from URL
                const internalIdMatch = url.match(/courses\/(_[\d_]+)/);
                const internalId = internalIdMatch ? internalIdMatch[1] : '';

                // Robust ID extraction
                let id = '';
                const idEl = card.querySelector('.multi-column-course-id') || card.querySelector('.course-id');
                if (idEl) {
                    id = idEl.innerText.trim();
                } else {
                    // Fallback: Search in text
                    const text = card.innerText;
                    const idMatch = text.match(/[A-Z]{4,5}[0-9]{4}[A-Z]?-[A-Z0-9]+/);
                    if (idMatch) id = idMatch[0];
                }

                // Robust Professor extraction
                let professor = 'Sin profesor asignado';
                const instructorEl = card.querySelector('.instructors bb-ui-username bdi') || 
                                     card.querySelector('.instructors [class*="makeStylesbaseText"]') ||
                                     card.querySelector('.instructors .user-name');
                
                if (instructorEl) {
                    professor = instructorEl.innerText.trim();
                } else {
                    const instructorsContainer = card.querySelector('.instructors');
                    if (instructorsContainer) {
                        let text = instructorsContainer.innerText.replace(/Instructors:|Profesores:/i, '').trim();
                        if (text) professor = text;
                    }
                }

                addCourse({
                    name: name,
                    id: id,
                    internalId: internalId,
                    professor: professor,
                    url: url,
                    timestamp: Date.now()
                });
            }
        });
    }

    // Generic Link Search
    const courseLinks = document.querySelectorAll('a[href*="/ultra/courses/_"]');
    courseLinks.forEach(link => {
        if (link.href.includes('/cl/outline') || link.href.match(/\/ultra\/courses\/_[0-9]+_1\/?$/)) {
            const name = link.innerText.trim();
            const url = link.href;
            
            // Extract Internal ID
            const internalIdMatch = url.match(/courses\/(_[\d_]+)/);
            const internalId = internalIdMatch ? internalIdMatch[1] : '';

            let id = '';
            // Try to find context
            const card = link.closest('div[role="row"]') || link.closest('li') || link.closest('.course-element-card');
            if (card) {
                const textContent = card.innerText;
                const idMatch = textContent.match(/[A-Z]{4,5}[0-9]{4}[A-Z]?-[A-Z0-9]+/);
                if (idMatch) id = idMatch[0];
            }

            if (name) {
                addCourse({
                    name: name,
                    id: id,
                    internalId: internalId,
                    professor: 'Sin profesor asignado', // Harder to find here without context
                    url: url,
                    timestamp: Date.now()
                });
            }
        }
    });

    // Messages Page Structure
    const messageCards = document.querySelectorAll('bb-course-conversations-summary');
    messageCards.forEach(card => {
        const titleEl = card.querySelector('h2.title a');
        const idEl = card.querySelector('div.subtitle span bdi');
        
        if (titleEl && titleEl.href) {
            const clone = titleEl.cloneNode(true);
            const span = clone.querySelector('span');
            if (span) span.remove();
            
            const url = titleEl.href;
            const internalIdMatch = url.match(/courses\/(_[\d_]+)/);
            const internalId = internalIdMatch ? internalIdMatch[1] : '';

            addCourse({
                name: clone.innerText.trim(),
                id: idEl ? idEl.innerText.trim() : '',
                internalId: internalId,
                professor: '',
                url: url,
                timestamp: Date.now()
            });
        }
    });

    if (courses.length > 0) {
        chrome.storage.local.set({ 'goodBoardCourses': courses, 'lastSyncCourses': Date.now() });
        console.log("Courses saved:", courses);
    }
    return courses;
}

function router() {
    // Safety check for invalidated context
    try {
        if (!chrome.runtime?.id) {
            // console.warn("GoodBoard: Extension context invalidated. Stopping router.");
            return;
        }
    } catch (e) {
        return;
    }

    const url = window.location.href;
    console.log("GoodBoard Router checking URL:", url);
    
    // Check for legacy/empty page indicators
    if (url.includes('legacyUrl')) {
        // console.warn("Detected Legacy URL wrapper. This might cause empty page issues.");
    }

    if (url.includes('calendar')) {
        const tasks = scrapeCalendar();
        // Update tasks if on calendar page. Avoid clearing if loading.
        const calendarContainer = document.querySelector('.fc-view-container') || document.querySelector('.fc-view');
        if (calendarContainer) {
             const rawEvents = document.querySelectorAll('.fc-event');
             if (tasks.length > 0 || rawEvents.length === 0) {
                 chrome.storage.local.set({ 'goodBoardTasks': tasks, 'lastSyncTasks': Date.now() });
                 console.log("Tasks synced:", tasks.length);
             } else {
                 console.warn("GoodBoard: Found events in DOM but scraped 0 tasks. Not clearing storage.");
             }
        }
    } else if (url.includes('grades')) {
        scrapeGrades();
    } else if (url.includes('messages') || url.includes('course')) {
        scrapeCourses();
    }

    // Check for Course Grade Details Page (Legacy View inside Ultra)
    if (document.querySelector('div.sortable_item_row')) {
        console.log("GoodBoard: Detected Grade Details Page. Auto-scraping...");
        const result = scrapeGradeDetails();
        if (result && result.assignments.length > 0 && result.courseName) {
            const storageKey = `course_details_${result.courseName.replace(/[^a-zA-Z0-9]/g, '_')}`;
            
            // Sanitize feedback HTML
            const sanitizedAssignments = result.assignments.map(a => {
                let cleanFeedback = a.feedback;
                if (cleanFeedback) {
                    cleanFeedback = cleanFeedback.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "").replace(/javascript:/gim, "");
                }
                return { ...a, feedback: cleanFeedback };
            });

            const newDetails = { 
                title: result.courseName, 
                grades: sanitizedAssignments, 
                weights: result.weights 
            };

            const updateObject = {};
            updateObject[storageKey] = newDetails;

            chrome.storage.local.set(updateObject, () => {
                console.log(`[GoodBoard] Auto-saved details for ${result.courseName} to ${storageKey}`);
            });
        }
    }
}

// Observer to handle dynamic content loading
let timeoutId;
const observer = new MutationObserver((mutations) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        router();
    }, 1000); // Debounce execution
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial run
setTimeout(router, 2000);
setTimeout(router, 5000);

function scrapeAssignmentInstructions() {
    console.log("Scraping assignment instructions...");
    const container = document.getElementById('dataCollectionContainer');
    if (!container) return null;

    const sections = [];
    const items = container.querySelectorAll('#stepcontent1 li');
    
    items.forEach(item => {
        const labelEl = item.querySelector('.label');
        const fieldEl = item.querySelector('.field');
        
        if (labelEl && fieldEl) {
            // Clean up the field content
            // Remove fieldErrorText span if empty
            const errorSpan = fieldEl.querySelector('.fieldErrorText');
            if (errorSpan && !errorSpan.innerText.trim()) {
                errorSpan.remove();
            }

            sections.push({
                title: labelEl.innerText.trim(),
                html: fieldEl.innerHTML.trim(),
                text: fieldEl.innerText.trim()
            });
        }
    });

    return sections;
}

// Listen for manual trigger
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrape") {
    router();
    sendResponse({ status: "scraped" });
  } else if (request.action === "SCRAPE_GRADE_DETAILS") {
      const result = scrapeGradeDetails(request.courseName);
      // Only respond if we found data.
      if (result && result.assignments.length > 0) {
          console.log("[GoodBoard] Found grade details in frame:", window.location.href);
          sendResponse({ status: "success", data: result });
      } else {
          // Don't respond if empty, let timeout handle it or another frame respond.
      }
  } else if (request.action === "SCRAPE_INSTRUCTIONS") {
      const instructions = scrapeAssignmentInstructions();
      if (instructions && instructions.length > 0) {
          sendResponse({ status: "success", data: instructions });
      } else {
          // Don't respond if not found, let other frames try
      }
  } else if (request.action === "FETCH_INSTRUCTIONS") {
      const url = request.url;
      if (url) {
          fetch(url)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Reuse the logic from scrapeAssignmentInstructions but on 'doc'
                const container = doc.getElementById('dataCollectionContainer');
                if (!container) {
                    sendResponse({ status: "error", message: "No instructions container found" });
                    return;
                }

                const sections = [];
                const items = container.querySelectorAll('#stepcontent1 li');
                
                items.forEach(item => {
                    const labelEl = item.querySelector('.label');
                    const fieldEl = item.querySelector('.field');
                    
                    if (labelEl && fieldEl) {
                        const errorSpan = fieldEl.querySelector('.fieldErrorText');
                        if (errorSpan && !errorSpan.innerText.trim()) {
                            errorSpan.remove();
                        }

                        // Fix relative images
                        const images = fieldEl.querySelectorAll('img');
                        images.forEach(img => {
                            if (img.src && img.src.startsWith('/')) {
                                img.src = window.location.origin + img.getAttribute('src');
                            }
                        });

                        sections.push({
                            title: labelEl.innerText.trim(),
                            html: fieldEl.innerHTML.trim(),
                            text: fieldEl.innerText.trim()
                        });
                    }
                });
                
                sendResponse({ status: "success", data: sections });
            })
            .catch(err => {
                sendResponse({ status: "error", message: err.toString() });
            });
          return true; // Async response
      }
  }
});

function scrapeGradeDetails(requestedCourseName) {
    console.log("Scraping Grade Details in frame:", window.location.href);

    // Validation: Check if this frame belongs to the requested course
    if (requestedCourseName) {
        const normalize = (s) => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '') : '';
        const target = normalize(requestedCourseName);
        
        let foundName = '';
        
        // Course Menu Link
        const menuLink = document.querySelector('#courseMenu_link');
        if (menuLink) foundName = menuLink.innerText;
        
        // Top Frame Title
        if (!foundName) {
             const breadcrumb = document.querySelector('#pageTitleText');
             if (breadcrumb) foundName = breadcrumb.innerText;
        }

        // Specific Breadcrumb
        if (!foundName) {
             const crumb1 = document.querySelector('#crumb_1');
             if (crumb1) foundName = crumb1.innerText;
        }

        // Document Title
        if (!foundName) {
             foundName = document.title;
        }
        
        if (foundName) {
            const current = normalize(foundName);
            // Check if target is contained in current or vice versa (fuzzy match)
            if (!current.includes(target) && !target.includes(current)) {
                console.log(`[GoodBoard] Skipping frame. Course mismatch. Requested: ${requestedCourseName}, Found: ${foundName}`);
                return { assignments: [], weights: {} };
            } else {
                console.log(`[GoodBoard] Course match confirmed: ${foundName}`);
            }
        } else {
            console.warn("[GoodBoard] Could not verify course name in frame. Proceeding with caution.");
        }
    }

    let rows = document.querySelectorAll('div.sortable_item_row');
    
    // Fallback: If no rows found by class, try finding by the specific link structure user provided
    if (rows.length === 0) {
        const links = document.querySelectorAll('a[onclick*="loadContentFrame"]');
        if (links.length > 0) {
            console.log("[GoodBoard] Found links via fallback selector");
            // Try to find the parent row for these links
            const fallbackRows = [];
            links.forEach(link => {
                // Go up to find a container that looks like a row
                const row = link.closest('div[role="row"]') || link.closest('tr') || link.closest('.cell').parentElement;
                if (row) fallbackRows.push(row);
            });
            if (fallbackRows.length > 0) {
                rows = fallbackRows;
            }
        }
    }

    // 1. Extract Weights from "Calculated Grade" row if available
    const weights = {};
    
    // Look for the "Criterios de calificación" button
    const criteriaBtn = document.querySelector('input[value="Criterios de calificación"], button[title="Criterios de calificación"]');
    let criteriaText = '';

    if (criteriaBtn) {
        const onclick = criteriaBtn.getAttribute('onclick');
        if (onclick) {
            // Extract the text inside the second argument
            const match = onclick.match(/showInLightBox\s*\(\s*'.*?',\s*'(.*?)',/);
            if (match && match[1]) {
                criteriaText = match[1];
            }
        }
    }

    // Look for the text directly in the page
    if (!criteriaText) {
        // Look for any element containing "Promedio ponderado de"
        const allDivs = document.querySelectorAll('div, span, p');
        for (const div of allDivs) {
            if (div.innerText && div.innerText.includes('Promedio ponderado de')) {
                criteriaText = div.innerText;
                break; 
            }
        }
    }

    if (criteriaText) {
        console.log("[GoodBoard] Found criteria text:", criteriaText);
        
        // Clean up text and remove prefixes
        let cleanText = criteriaText.replace(/Promedio ponderado de\s*/i, '')
                                    .replace(/Calificación Final\s*/i, '');
        
        // Match "Name (Weight%)" pattern
        const weightMatches = cleanText.matchAll(/([^,]+?)\s*\(\s*(\d+(?:\.\d+)?)\s*%\s*\)/g);
        
        for (const m of weightMatches) {
            let name = m[1].trim();
            const percent = m[2];
            
            if (name.startsWith(',')) name = name.substring(1).trim();
            name = name.replace(/^Calificación Final\s+/i, '');

            weights[name] = percent;
        }
    }
    
    console.log("[GoodBoard] Extracted weights:", weights);

    const details = [];

    rows.forEach(row => {
        // Try standard selector first (Anchor for clickable/submitted)
        let titleEl = row.querySelector('.cell.gradable a');
        
        // Span with ID (for upcoming/unsubmitted items)
        if (!titleEl) {
             titleEl = row.querySelector('.cell.gradable span[id^="_"]');
        }

        // Old fallback for links
        if (!titleEl) titleEl = row.querySelector('a[onclick*="loadContentFrame"]');
        
        // Clean up title: remove newlines and extra spaces
        const title = titleEl ? titleEl.innerText.replace(/\s+/g, ' ').trim() : '';
        
        const dueDateEl = row.querySelector('.cell.gradable .activityType');
        const submittedDateEl = row.querySelector('.cell.activity .lastActivityDate');
        const statusEl = row.querySelector('.cell.activity .activityType');
        const gradeEl = row.querySelector('.cell.grade .grade');
        const pointsPossibleEl = row.querySelector('.cell.grade .pointsPossible');
        const feedbackEl = row.querySelector('.cell.grade .grade-feedback');

        if (title && title !== 'Calificación Final') { // Skip the calculated row itself if it appears as a normal row
            let feedbackHTML = '';
            if (feedbackEl && feedbackEl.getAttribute('onclick')) {
                // Extract HTML from onclick attribute: mygrades.showInLightBox( 'Title', 'HTML_CONTENT', ... )
                const onclick = feedbackEl.getAttribute('onclick');
                // Regex to capture the second argument (the HTML content)
                // It handles escaped quotes like \"
                const match = onclick.match(/showInLightBox\s*\(\s*'.*?',\s*'(.*?)',/);
                if (match && match[1]) {
                    // Unescape the string
                    feedbackHTML = match[1].replace(/\\"/g, '"').replace(/\\'/g, "'");
                }
            }

            details.push({
                title: title,
                dueDate: dueDateEl ? dueDateEl.innerText.replace('Vencimiento:', '').trim() : '',
                submittedDate: submittedDateEl ? submittedDateEl.innerText.trim() : '',
                status: statusEl ? statusEl.innerText.trim() : '',
                grade: gradeEl ? gradeEl.innerText.trim() : '-',
                pointsPossible: pointsPossibleEl ? pointsPossibleEl.innerText.replace('/', '').trim() : '',
                feedback: feedbackHTML,
                weight: weights[title] || null // Add weight if found
            });
        }
    });
    
    // Post-processing to ensure clean data
    details.forEach(d => {
        if (!d.grade || d.grade.trim() === '') d.grade = '-';
        if (d.grade === '-') d.status = 'pending'; // Force pending if no grade
        // If we have a submitted date, it's submitted regardless of grade
        if (d.submittedDate) d.status = 'submitted';
    });

    if (details.length > 0) {
        console.log(`[GoodBoard] Scraped ${details.length} grade details`);
    }
    
    // Return the found name so the app knows which course this really is
    // We need to re-find it if we didn't run the validation block (e.g. if requestedCourseName was null)
    let finalCourseName = '';
    
    // Always try to find the course name, even if not requested (for auto-scrape)
    const menuLink = document.querySelector('#courseMenu_link');
    if (menuLink) finalCourseName = menuLink.innerText;
    if (!finalCourseName) {
            const breadcrumb = document.querySelector('#pageTitleText');
            if (breadcrumb) finalCourseName = breadcrumb.innerText;
    }
    if (!finalCourseName) {
            const crumb1 = document.querySelector('#crumb_1');
            if (crumb1) finalCourseName = crumb1.innerText;
    }
    if (!finalCourseName) finalCourseName = document.title;

    return { assignments: details, weights: weights, courseName: finalCourseName };
}
