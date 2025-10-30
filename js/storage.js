// js/storage.js - Storage API Functions

// ===== STORAGE API ENHANCEMENTS =====
function saveJournalEntries() {
    const entries = [];
    document.querySelectorAll('.journal-entry').forEach(entry => {
        const contentElement = entry.querySelector('.collapsible-content');
        if (contentElement) {
            const isNew = entry.getAttribute('data-is-new') === 'true';
            const isJSON = entry.getAttribute('data-source') === 'json';
            
            // Only save local entries, not JSON entries or static weeks
            if (isNew && !isJSON) {
                entries.push({
                    title: entry.querySelector('h2').textContent,
                    content: contentElement.innerHTML,
                    date: entry.querySelector('.entry-meta')?.textContent || new Date().toLocaleDateString(),
                    isNew: isNew,
                    id: entry.getAttribute('data-entry-id')
                });
            }
        }
    });
    localStorage.setItem('journalEntries', JSON.stringify(entries));
    console.log('Saved local entries:', entries.length);
}

function loadJournalEntries() {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
        try {
            const entries = JSON.parse(savedEntries);
            console.log('Loaded local entries:', entries.length);
            return entries;
        } catch (error) {
            console.error('Error parsing saved entries:', error);
            return [];
        }
    }
    return [];
}

// Enhanced theme storage with session storage fallback
function initThemeSwitcher() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check multiple storage options
    const currentTheme = localStorage.getItem('theme') || 
                        sessionStorage.getItem('theme') ||
                        (prefersDarkScheme.matches ? 'dark' : 'light');
    
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeToggle) themeToggle.textContent = '☀️ Light Mode';
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            
            let theme = 'light';
            if (document.body.classList.contains('dark-theme')) {
                theme = 'dark';
                this.textContent = '☀️ Light Mode';
            } else {
                this.textContent = '🌙 Dark Mode';
            }
            
            // Save to both local and session storage
            localStorage.setItem('theme', theme);
            sessionStorage.setItem('theme', theme);
        });
    }
}

// ===== STORAGE DEMO FUNCTION =====
function showStorageInfo() {
    const infoDiv = document.getElementById('storage-info');
    const theme = localStorage.getItem('theme') || 'light';
    const entries = localStorage.getItem('journalEntries');
    const entryCount = entries ? JSON.parse(entries).length : 0;
    
    infoDiv.innerHTML = `
        <p><strong>Current Theme:</strong> ${theme}</p>
        <p><strong>Saved Local Entries:</strong> ${entryCount}</p>
        <p><strong>Storage Used:</strong> ${calculateStorageUsage()} KB</p>
        <p><strong>JSON Entries:</strong> <span id="json-entry-count">Loading...</span></p>
    `;
    
    // Update JSON entry count
    fetchJSONReflections().then(reflections => {
        document.getElementById('json-entry-count').textContent = reflections.length;
    });
}

function calculateStorageUsage() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length;
        }
    }
    return (total / 1024).toFixed(2);
}

// ===== LOAD SAVED ENTRIES =====
function loadSavedEntries() {
    const savedEntries = loadJournalEntries();
    if (savedEntries && savedEntries.length > 0) {
        const journalFormSection = document.querySelector('.journal-form-section');
        if (journalFormSection) {
            savedEntries.forEach(entry => {
                const entryHTML = createJournalEntry(entry.title, entry.content, entry.date, true);
                journalFormSection.insertAdjacentHTML('afterend', entryHTML);
            });
        }
    }
}

// ===== JSON FILE STORAGE FUNCTIONS =====
async function fetchJSONReflections() {
    try {
        const response = await fetch('backend/reflections.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const reflections = await response.json();
        console.log('Fetched JSON reflections:', reflections.length);
        return reflections;
    } catch (error) {
        console.error('Error fetching JSON reflections:', error);
        // Return empty array instead of throwing to prevent breaking the UI
        return [];
    }
}

function displayJSONReflections(reflections) {
    const container = document.getElementById('journal-entries-container');
    if (!container) return;

    // Filter out entries that are already in the hardcoded ones
    const existingTitles = new Set();
    document.querySelectorAll('.journal-entry:not([data-source="json"]) h2').forEach(title => {
        existingTitles.add(title.textContent.trim());
    });

    const newReflections = reflections.filter(reflection => {
        const potentialTitle = `Python Entry: ${reflection.date} - ${reflection.name}`;
        return !existingTitles.has(potentialTitle);
    });

    if (newReflections.length === 0) {
        console.log('No new JSON reflections to display');
        return;
    }

    console.log('Displaying new JSON reflections:', newReflections.length);

    // Create entries for JSON reflections (insert after local entries but before static weeks)
    newReflections.forEach(reflection => {
        const entryHTML = `
            <article class="journal-entry collapsible" data-source="json">
                <div class="collapsible-header">
                    <h2>Python Entry: ${reflection.date} - ${reflection.name}</h2>
                    <div class="header-spacer"></div>
                    <div class="entry-actions">
                        <span class="toggle-icon">▼</span>
                        <button class="copy-btn" type="button">📋 Copy</button>
                    </div>
                </div>
                <div class="collapsible-content">
                    <div class="entry-meta">Added via Python Backend • ${reflection.date}</div>
                    <div class="entry-content">
                        ${reflection.reflection.replace(/\n/g, '<br>')}
                    </div>
                    <div style="margin-top: 1rem; padding: 0.5rem; background: rgba(52, 152, 219, 0.1); border-radius: 4px;">
                        <small>💡 This entry was added using the Python script and stored in reflections.json</small>
                    </div>
                </div>
            </article>
        `;
        
        // Insert after the form section (before any existing entries)
        const journalFormSection = document.querySelector('.journal-form-section');
        if (journalFormSection) {
            journalFormSection.insertAdjacentHTML('afterend', entryHTML);
        } else {
            container.insertAdjacentHTML('afterbegin', entryHTML);
        }
    });
}

// ===== ENHANCED REFLECTION COUNTER =====
function updateReflectionCounter() {
    const totalEntries = document.querySelectorAll('.journal-entry').length;
    const jsonEntries = document.querySelectorAll('.journal-entry[data-source="json"]').length;
    const localEntries = document.querySelectorAll('.journal-entry[data-is-new="true"]').length;
    const staticEntries = totalEntries - jsonEntries - localEntries;
    
    const counterHTML = `
        <div class="reflection-counter">
            <h3>📊 Reflection Statistics - Lab 5</h3>
            <div class="counter-grid">
                <div class="counter-item">
                    <span class="counter-number">${totalEntries}</span>
                    <span class="counter-label">Total Entries</span>
                </div>
                <div class="counter-item">
                    <span class="counter-number">${staticEntries}</span>
                    <span class="counter-label">Course Weeks</span>
                </div>
                <div class="counter-item">
                    <span class="counter-number">${localEntries}</span>
                    <span class="counter-label">Local Entries</span>
                </div>
                <div class="counter-item">
                    <span class="counter-number">${jsonEntries}</span>
                    <span class="counter-label">JSON Entries</span>
                </div>
            </div>
            <div style="text-align: center; margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">
                💡 JSON entries are managed by Python backend
            </div>
        </div>
    `;
    
    // Update or create counter
    const counterContainer = document.getElementById('reflection-counter-container');
    if (counterContainer) {
        counterContainer.innerHTML = counterHTML;
    }
}

// ===== BACKEND INTERACTION FUNCTIONS =====
async function refreshJSONData() {
    try {
        console.log('Refreshing JSON data...');
        const jsonReflections = await fetchJSONReflections();
        
        // Remove existing JSON entries
        document.querySelectorAll('.journal-entry[data-source="json"]').forEach(entry => {
            entry.remove();
        });
        
        // Display updated JSON reflections
        displayJSONReflections(jsonReflections);
        updateReflectionCounter();
        
        // Re-initialize features
        if (window.initCollapsibleSections) initCollapsibleSections();
        if (window.initClipboardAPI) initClipboardAPI();
        
        showSuccessMessage(`JSON data refreshed! Loaded ${jsonReflections.length} entries from backend.`);
    } catch (error) {
        console.error('Error refreshing JSON data:', error);
        alert('Error refreshing JSON data. Please check the console for details.');
    }
}

function showBackendInfo() {
    const infoDiv = document.getElementById('backend-info');
    const totalEntries = document.querySelectorAll('.journal-entry').length;
    const jsonEntries = document.querySelectorAll('.journal-entry[data-source="json"]').length;
    const localEntries = document.querySelectorAll('.journal-entry[data-is-new="true"]').length;
    
    infoDiv.style.display = 'block';
    infoDiv.innerHTML = `
        <h4>🔧 Backend Information</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">
            <div>
                <strong>Total Entries:</strong> ${totalEntries}
            </div>
            <div>
                <strong>JSON Entries:</strong> ${jsonEntries}
            </div>
            <div>
                <strong>Local Entries:</strong> ${localEntries}
            </div>
            <div>
                <strong>Static Entries:</strong> ${totalEntries - jsonEntries - localEntries}
            </div>
        </div>
        <p><strong>JSON File:</strong> <code>backend/reflections.json</code></p>
        <p><strong>Python Script:</strong> <code>backend/save_entry.py</code></p>
        <p><strong>Usage:</strong> Run the Python script in terminal to add new reflections</p>
        <div style="margin-top: 1rem; padding: 0.8rem; background: rgba(52, 152, 219, 0.1); border-radius: 4px;">
            <strong>💡 How to use Python backend:</strong>
            <ol style="margin: 0.5rem 0 0 1rem;">
                <li>Open terminal in project folder</li>
                <li>Run: <code>cd backend</code></li>
                <li>Run: <code>python save_entry.py</code></li>
                <li>Follow the menu to add entries</li>
                <li>Click "Refresh JSON Data" above</li>
            </ol>
        </div>
    `;
}

function exportJSONData() {
    fetchJSONReflections().then(reflections => {
        const dataStr = JSON.stringify(reflections, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'journal_reflections_export.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showSuccessMessage('JSON data exported successfully!');
    });
}

// ===== SUCCESS MESSAGE FUNCTION =====
function showSuccessMessage(message) {
    // Create success notification
    const successMsg = document.createElement('div');
    successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(39, 174, 96, 0.4);
        z-index: 1001;
        animation: slideInRight 0.5s ease, slideOutRight 0.5s ease 2.5s;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 300px;
    `;
    
    successMsg.innerHTML = `✅ ${message}`;
    document.body.appendChild(successMsg);
    
    // Auto remove after animation
    setTimeout(() => {
        if (successMsg.parentNode) {
            successMsg.parentNode.removeChild(successMsg);
        }
    }, 3000);
}

// Make functions globally available
window.refreshJSONData = refreshJSONData;
window.showBackendInfo = showBackendInfo;
window.exportJSONData = exportJSONData;
window.showStorageInfo = showStorageInfo;