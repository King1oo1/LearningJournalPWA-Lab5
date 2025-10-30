// js/storage.js - Storage API Functions

// ===== STORAGE API ENHANCEMENTS =====
function saveJournalEntries() {
    const entries = [];
    document.querySelectorAll('.journal-entry').forEach(entry => {
        const contentElement = entry.querySelector('.collapsible-content');
        if (contentElement) {
            const isNew = entry.getAttribute('data-is-new') === 'true';
            entries.push({
                title: entry.querySelector('h2').textContent,
                content: contentElement.innerHTML,
                date: entry.querySelector('.entry-meta').textContent,
                isNew: isNew,
                id: entry.getAttribute('data-entry-id')
            });
        }
    });
    localStorage.setItem('journalEntries', JSON.stringify(entries));
}

function loadJournalEntries() {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
        const entries = JSON.parse(savedEntries);
        // Only load new entries (not Week 1-4)
        const newEntries = entries.filter(entry => entry.isNew);
        return newEntries;
    }
    return null;
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
        <p><strong>Saved Journal Entries:</strong> ${entryCount}</p>
        <p><strong>Storage Used:</strong> ${calculateStorageUsage()} KB</p>
    `;
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