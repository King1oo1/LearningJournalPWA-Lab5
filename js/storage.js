// js/storage.js - Storage API Functions for Lab 5: Python JSON Backend

// ===== THEME STORAGE ONLY (No journal entry storage) =====
function initThemeSwitcher() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check theme preference
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
            
            // Save theme preference only
            localStorage.setItem('theme', theme);
            sessionStorage.setItem('theme', theme);
        });
    }
}

// ===== STORAGE DEMO FUNCTION =====
function showStorageInfo() {
    const infoDiv = document.getElementById('storage-info');
    const theme = localStorage.getItem('theme') || 'light';
    
    // Fetch JSON data to show current entries
    fetchJSONReflections().then(reflections => {
        infoDiv.innerHTML = `
            <p><strong>Current Theme:</strong> ${theme}</p>
            <p><strong>JSON Entries:</strong> ${reflections.length} entries in reflections.json</p>
            <p><strong>Storage Used:</strong> ${calculateStorageUsage()} KB (theme only)</p>
            <p><strong>Data Source:</strong> Python JSON Backend</p>
        `;
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

// ===== PYTHON JSON BACKEND INTEGRATION =====
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

    // Clear existing JSON entries (keep static weeks)
    document.querySelectorAll('.journal-entry[data-source="json"]').forEach(entry => {
        entry.remove();
    });

    if (reflections.length === 0) {
        console.log('No JSON reflections to display');
        return;
    }

    console.log('Displaying JSON reflections:', reflections.length);

    // Reverse the array to show NEWEST entries FIRST (at the top)
    const reversedReflections = [...reflections].reverse();

    // Create entries for JSON reflections (insert at the VERY TOP, before Week 5)
    reversedReflections.forEach((reflection, index) => {
        const entryHTML = `
            <article class="journal-entry collapsible" data-source="json">
                <div class="collapsible-header">
                    <h2>${reflection.name} - ${reflection.date}</h2>
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
                        <small>💡 This entry was created using Python and stored in reflections.json</small>
                    </div>
                </div>
            </article>
        `;
        
        // Insert at the VERY beginning of the container (before Week 5)
        container.insertAdjacentHTML('afterbegin', entryHTML);
    });
}

// ===== REFLECTION COUNTER =====
function updateReflectionCounter() {
    const totalEntries = document.querySelectorAll('.journal-entry').length;
    const jsonEntries = document.querySelectorAll('.journal-entry[data-source="json"]').length;
    const staticEntries = totalEntries - jsonEntries;
    
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
                    <span class="counter-number">${jsonEntries}</span>
                    <span class="counter-label">Python JSON Entries</span>
                </div>
                <div class="counter-item">
                    <span class="counter-number">${jsonEntries}</span>
                    <span class="counter-label">Backend Storage</span>
                </div>
            </div>
            <div style="text-align: center; margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">
                💡 All new entries are created using Python and stored in JSON
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
        console.log('Refreshing JSON data from Python backend...');
        const jsonReflections = await fetchJSONReflections();
        
        // Remove existing JSON entries and re-display
        document.querySelectorAll('.journal-entry[data-source="json"]').forEach(entry => {
            entry.remove();
        });
        
        displayJSONReflections(jsonReflections);
        updateReflectionCounter();
        
        // Re-initialize features for new entries
        if (window.initCollapsibleSections) initCollapsibleSections();
        if (window.initClipboardAPI) initClipboardAPI();
        
        showSuccessMessage(`✅ Loaded ${jsonReflections.length} entries from Python JSON backend`);
    } catch (error) {
        console.error('Error refreshing JSON data:', error);
        showErrorMessage('Error refreshing JSON data. Make sure reflections.json exists in backend folder.');
    }
}

function showBackendInfo() {
    const infoDiv = document.getElementById('backend-info');
    const totalEntries = document.querySelectorAll('.journal-entry').length;
    const jsonEntries = document.querySelectorAll('.journal-entry[data-source="json"]').length;
    
    infoDiv.style.display = 'block';
    infoDiv.innerHTML = `
        <h4>🔧 How the Python JSON Backend Works</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">
            <div>
                <strong>Total Entries:</strong> ${totalEntries}
            </div>
            <div>
                <strong>JSON Entries:</strong> ${jsonEntries}
            </div>
        </div>
        
        <p><strong>Data Flow:</strong></p>
        <ol style="margin: 0.5rem 0 1rem 1rem;">
            <li>Python script creates/updates <code>reflections.json</code></li>
            <li>JavaScript fetches JSON data using Fetch API</li>
            <li>Entries are displayed dynamically in the PWA</li>
            <li>All data is version-controlled in GitHub</li>
        </ol>
        
        <p><strong>Files:</strong></p>
        <ul style="margin: 0.5rem 0 1rem 1rem;">
            <li><code>backend/reflections.json</code> - Data storage</li>
            <li><code>backend/save_entry.py</code> - Python interface</li>
            <li><code>js/storage.js</code> - JavaScript data fetching</li>
        </ul>
        
        <div style="margin-top: 1rem; padding: 0.8rem; background: rgba(52, 152, 219, 0.1); border-radius: 4px;">
            <strong>🚀 How to add entries:</strong>
            <ol style="margin: 0.5rem 0 0 1rem;">
                <li>Open terminal in project folder</li>
                <li>Run: <code>cd backend</code></li>
                <li>Run: <code>python save_entry.py</code></li>
                <li>Choose option 1 to add new reflection</li>
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

// ===== MESSAGE FUNCTIONS =====
function showSuccessMessage(message) {
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
    
    setTimeout(() => {
        if (successMsg.parentNode) {
            successMsg.parentNode.removeChild(successMsg);
        }
    }, 3000);
}

function showErrorMessage(message) {
    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(231, 76, 60, 0.4);
        z-index: 1001;
        animation: slideInRight 0.5s ease, slideOutRight 0.5s ease 2.5s;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 300px;
    `;
    
    errorMsg.innerHTML = `❌ ${message}`;
    document.body.appendChild(errorMsg);
    
    setTimeout(() => {
        if (errorMsg.parentNode) {
            errorMsg.parentNode.removeChild(errorMsg);
        }
    }, 3000);
}

// Make functions globally available
window.refreshJSONData = refreshJSONData;
window.showBackendInfo = showBackendInfo;
window.exportJSONData = exportJSONData;
window.showStorageInfo = showStorageInfo;