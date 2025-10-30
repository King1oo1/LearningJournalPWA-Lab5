// js/script.js - Main Application Logic

// ===== HEADER STRUCTURE MANAGEMENT =====
function ensureHeaderStructure() {
    document.querySelectorAll('.journal-entry').forEach((entry, index) => {
        const header = entry.querySelector('.collapsible-header');
        if (!header) return;
        
        // Check if header already has proper structure
        const existingSpacer = header.querySelector('.header-spacer');
        const existingActions = header.querySelector('.entry-actions');
        
        if (existingSpacer && existingActions) {
            // Structure exists, just ensure copy button is there
            ensureCopyButton(header, entry);
            return;
        }
        
        // Get the title text from existing content
        let titleText = header.textContent
            .replace(/[▼📋✏️🗑️]/g, '') // Remove all icons
            .replace(/Copy|Edit|Delete/g, '') // Remove button text
            .trim();
        
        // Clear header and rebuild with proper structure
        header.innerHTML = '';
        
        // Create title element
        const title = document.createElement('h2');
        title.textContent = titleText;
        header.appendChild(title);
        
        // Create spacer element
        const spacer = document.createElement('div');
        spacer.className = 'header-spacer';
        header.appendChild(spacer);
        
        // Create actions container
        const entryActions = document.createElement('div');
        entryActions.className = 'entry-actions';
        
        // Create toggle icon
        const toggleIcon = document.createElement('span');
        toggleIcon.className = 'toggle-icon';
        toggleIcon.textContent = '▼';
        toggleIcon.setAttribute('aria-label', 'Toggle section');
        entryActions.appendChild(toggleIcon);
        
        // Add edit button only for new entries
        const isNewEntry = entry.getAttribute('data-is-new') === 'true';
        if (isNewEntry) {
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '✏️ Edit';
            editBtn.setAttribute('type', 'button');
            entryActions.appendChild(editBtn);
        }
        
        // Add copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.setAttribute('type', 'button');
        entryActions.appendChild(copyBtn);
        
        header.appendChild(entryActions);
    });
}

// Ensure copy button exists in header
function ensureCopyButton(header, entry) {
    const entryActions = header.querySelector('.entry-actions');
    if (!entryActions) return;
    
    // Check if copy button already exists
    if (!entryActions.querySelector('.copy-btn')) {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.setAttribute('type', 'button');
        
        // Insert before toggle icon if it exists
        const toggleIcon = entryActions.querySelector('.toggle-icon');
        if (toggleIcon) {
            entryActions.insertBefore(copyBtn, toggleIcon);
        } else {
            entryActions.appendChild(copyBtn);
        }
    }
}

// ===== EDIT JOURNAL ENTRIES FUNCTIONALITY =====
function initEditFunctionality() {
    // Use event delegation for edit buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
            const editBtn = e.target.classList.contains('edit-btn') ? e.target : e.target.closest('.edit-btn');
            const entry = editBtn.closest('.journal-entry');
            
            if (entry && entry.getAttribute('data-is-new') === 'true') {
                e.stopPropagation();
                toggleEditMode(entry);
            }
        }
    });
}

function toggleEditMode(entry) {
    const isEditing = entry.classList.contains('edit-mode');
    
    if (isEditing) {
        // Save changes
        const titleInput = entry.querySelector('.edit-title');
        const contentTextarea = entry.querySelector('.edit-content');
        const title = titleInput.value.trim();
        const content = contentTextarea.value.trim();
        
        if (!title) {
            alert('Title cannot be empty!');
            titleInput.focus();
            return;
        }
        
        if (!content) {
            alert('Content cannot be empty!');
            contentTextarea.focus();
            return;
        }
        
        // Update display
        const titleElement = document.createElement('h2');
        titleElement.textContent = title;
        entry.querySelector('.collapsible-header').replaceChild(titleElement, titleInput);
        
        const contentElement = document.createElement('div');
        contentElement.className = 'entry-content';
        contentElement.innerHTML = content.replace(/\n/g, '<br>');
        entry.querySelector('.collapsible-content').replaceChild(contentElement, contentTextarea);
        
        entry.classList.remove('edit-mode');
        entry.querySelector('.edit-btn').innerHTML = '✏️ Edit';
        
        // Save to localStorage
        saveJournalEntries();
        
        // Show success message
        showSuccessMessage('Journal entry updated successfully!');
    } else {
        // Enter edit mode
        const title = entry.querySelector('h2').textContent;
        const content = entry.querySelector('.entry-content').textContent;
        
        // Create edit inputs
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.className = 'edit-title';
        titleInput.value = title;
        titleInput.style.cssText = `
            width: 100%;
            padding: 0.5rem;
            border: 2px solid #3498db;
            border-radius: 4px;
            font-size: 1.3rem;
            font-weight: 600;
            background: var(--card-bg);
            color: var(--text-color);
            margin-bottom: 1rem;
        `;
        
        const contentTextarea = document.createElement('textarea');
        contentTextarea.className = 'edit-content';
        contentTextarea.value = content;
        contentTextarea.style.cssText = `
            width: 100%;
            height: 200px;
            padding: 1rem;
            border: 2px solid #27ae60;
            border-radius: 4px;
            font-family: inherit;
            font-size: 1rem;
            line-height: 1.6;
            background: var(--card-bg);
            color: var(--text-color);
            resize: vertical;
        `;
        
        // Replace content with inputs
        const header = entry.querySelector('.collapsible-header');
        header.replaceChild(titleInput, entry.querySelector('h2'));
        
        const contentContainer = entry.querySelector('.collapsible-content');
        contentContainer.replaceChild(contentTextarea, entry.querySelector('.entry-content'));
        
        entry.classList.add('edit-mode');
        entry.querySelector('.edit-btn').innerHTML = '💾 Save';
        
        // Focus on title input
        titleInput.focus();
    }
}

// ===== ENHANCED DELETE FUNCTIONALITY =====
function initDeleteFunctionality() {
    // Use event delegation for delete buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            const deleteBtn = e.target.classList.contains('delete-btn') ? e.target : e.target.closest('.delete-btn');
            const entry = deleteBtn.closest('.journal-entry');
            
            if (entry && entry.getAttribute('data-is-new') === 'true') {
                e.stopPropagation();
                const entryId = entry.getAttribute('data-entry-id');
                showDeleteConfirmation(entryId);
            }
        }
    });
}

function showDeleteConfirmation(entryId) {
    // Create confirmation dialog
    const confirmationHTML = `
        <div class="delete-confirmation">
            <div class="confirmation-dialog">
                <h3>🗑️ Delete Journal Entry</h3>
                <p>Are you sure you want to delete this journal entry? This action cannot be undone and the entry will be permanently removed.</p>
                <div class="confirmation-actions">
                    <button class="cancel-delete-btn" onclick="closeDeleteConfirmation()">
                        ↩️ Keep Entry
                    </button>
                    <button class="confirm-delete-btn" onclick="confirmDeleteEntry('${entryId}')">
                        🗑️ Delete Permanently
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', confirmationHTML);
    
    // Add escape key listener
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeDeleteConfirmation();
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Store the handler for cleanup
    document.currentDeleteEscapeHandler = escapeHandler;
}

function closeDeleteConfirmation() {
    const confirmation = document.querySelector('.delete-confirmation');
    if (confirmation) {
        confirmation.remove();
    }
    
    // Clean up escape key listener
    if (document.currentDeleteEscapeHandler) {
        document.removeEventListener('keydown', document.currentDeleteEscapeHandler);
        document.currentDeleteEscapeHandler = null;
    }
}

function confirmDeleteEntry(entryId) {
    const entry = document.querySelector(`[data-entry-id="${entryId}"]`);
    const deleteBtn = entry ? entry.querySelector('.delete-btn') : null;
    
    if (deleteBtn) {
        // Show processing state
        deleteBtn.classList.add('processing');
        deleteBtn.innerHTML = '⏳ Deleting...';
        
        setTimeout(() => {
            if (entry) {
                // Add fade out animation
                entry.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                entry.style.opacity = '0';
                entry.style.transform = 'translateX(-100px)';
                entry.style.maxHeight = '0';
                entry.style.overflow = 'hidden';
                
                setTimeout(() => {
                    entry.remove();
                    saveJournalEntries();
                    
                    // Show success message
                    showSuccessMessage('Journal entry deleted successfully!');
                    
                    // Close confirmation dialog
                    closeDeleteConfirmation();
                }, 500);
            }
        }, 1000);
    }
}

// ===== ENHANCED FORM VALIDATION =====
function initFormValidation() {
    const journalForm = document.getElementById('journal-form');
    
    if (journalForm) {
        journalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const titleInput = document.getElementById('journal-title');
            const entryInput = document.getElementById('journal-entry');
            const title = titleInput.value.trim();
            const content = entryInput.value.trim();
            
            // Use Validation API
            if (!titleInput.checkValidity()) {
                titleInput.reportValidity();
                return false;
            }
            
            if (!entryInput.checkValidity()) {
                entryInput.reportValidity();
                return false;
            }
            
            // Count words
            const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
            
            if (wordCount < 10) {
                alert(`Please write at least 10 words. You currently have ${wordCount} words.`);
                entryInput.focus();
                return false;
            }
            
            // Create and save new entry
            const now = new Date();
            const dateString = now.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            const newEntryHTML = createJournalEntry(title, content, dateString, true);
            const journalFormSection = document.querySelector('.journal-form-section');
            if (journalFormSection) {
                journalFormSection.insertAdjacentHTML('afterend', newEntryHTML);
            }
            
            // Re-initialize features for new entry
            ensureHeaderStructure();
            initCollapsibleSections();
            initEditFunctionality();
            saveJournalEntries();
            
            showSuccessMessage('Journal entry added successfully!');
            journalForm.reset();
            updateWordCount('');
            
            return true;
        });
    }
}

// Enhanced journal entry creation with edit functionality
function createJournalEntry(title, content, date, isNewEntry = false) {
    const entryId = isNewEntry ? 'entry-' + Date.now() : '';
    
    return `
        <article class="journal-entry collapsible" data-entry-id="${entryId}" data-is-new="${isNewEntry}">
            <div class="collapsible-header">
                <h2>${title}</h2>
                <div class="header-spacer"></div>
                <div class="entry-actions">
                    <span class="toggle-icon">▼</span>
                    ${isNewEntry ? '<button class="edit-btn" type="button">✏️ Edit</button>' : ''}
                    <button class="copy-btn" type="button">📋 Copy</button>
                </div>
            </div>
            <div class="collapsible-content">
                <div class="entry-meta">Posted on: ${date}</div>
                <div class="entry-content">
                    ${content.replace(/\n/g, '<br>')}
                </div>
                ${isNewEntry ? `
                <div style="margin-top: 1.5rem; text-align: center;">
                    <button class="delete-btn" type="button">
                        🗑️ Delete Entry
                    </button>
                </div>
                ` : ''}
            </div>
        </article>
    `;
}

// ===== COLLAPSIBLE SECTIONS =====
function initCollapsibleSections() {
    const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    
    collapsibleHeaders.forEach((header, index) => {
        // Remove any existing event listeners by cloning
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
        
        // Get the new header and its content
        const freshHeader = document.querySelectorAll('.collapsible-header')[index];
        const content = freshHeader.nextElementSibling;
        
        if (content && content.classList.contains('collapsible-content')) {
            // Set initial state - all collapsed
            content.style.display = 'none';
            freshHeader.classList.remove('active');
            
            // Add click event to header
            freshHeader.addEventListener('click', function(e) {
                // Don't trigger if click was on copy button or edit button
                if (e.target.closest('.copy-btn') || e.target.closest('.edit-btn') || e.target.closest('.delete-btn')) return;
                
                // Toggle the content visibility
                if (content.style.display === 'block' || content.style.display === '') {
                    content.style.display = 'none';
                    this.classList.remove('active');
                } else {
                    content.style.display = 'block';
                    this.classList.add('active');
                }
            });
        }
    });
}

// ===== REUSABLE NAVIGATION =====
function loadNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    const navHTML = `
    <nav class="navbar">
        <div class="nav-container">
            <a href="index.html" class="nav-logo">Chandandeep Singh</a>
            
            <input type="checkbox" id="nav-toggle" class="nav-toggle">
            <label for="nav-toggle" class="nav-toggle-label">
                <span></span>
                <span></span>
                <span></span>
            </label>
            
            <ul class="nav-menu">
                <li><a href="index.html" class="${currentPage === 'index.html' ? 'active' : ''}">Home</a></li>
                <li><a href="journal.html" class="${currentPage === 'journal.html' ? 'active' : ''}">Journal</a></li>
                <li><a href="about.html" class="${currentPage === 'about.html' ? 'active' : ''}">About</a></li>
                <li><a href="projects.html" class="${currentPage === 'projects.html' ? 'active' : ''}">Projects</a></li>
            </ul>
        </div>
    </nav>`;
    
    // Insert navigation at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', navHTML);
}

// ===== LIVE DATE DISPLAY =====
function displayLiveDate() {
    const dateElement = document.getElementById('live-date');
    if (dateElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
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



// ===== ENHANCED INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing enhanced features');
    
    // Load reusable navigation first
    loadNavigation();
    
    // Initialize basic features
    displayLiveDate();
    initThemeSwitcher();
    initFormValidation();
    initEnhancedValidation();
    initYouTubeAPI();
    
    // Load saved entries and initialize components with proper timing
    setTimeout(() => {
        console.log('Loading saved entries and initializing components...');
        
        // Load saved entries first
        loadSavedEntries();
        
        // Then ensure proper structure
        ensureHeaderStructure();
        
        // Initialize interactive components
        initCollapsibleSections();
        initClipboardAPI();
        initEditFunctionality();
        initDeleteFunctionality();
        
        // NEW: Initialize JSON features after everything else is set up
        initJSONFeatures();
        
        console.log('All enhanced features initialized successfully!');
        
        // Debug: Log all copy buttons found
        const copyButtons = document.querySelectorAll('.copy-btn');
        console.log(`Found ${copyButtons.length} copy buttons in the document`);
        
    }, 100);
});

// ===== NEW JSON FEATURES INITIALIZATION =====
async function initJSONFeatures() {
    console.log('Initializing JSON features...');
    
    try {
        // Fetch and display JSON reflections
        const jsonReflections = await fetchJSONReflections();
        displayJSONReflections(jsonReflections);
        
        // Update counter
        updateReflectionCounter();
        
        // Re-initialize collapsible sections for new entries
        initCollapsibleSections();
        initClipboardAPI();
        
        console.log('JSON features initialized successfully!');
        
    } catch (error) {
        console.error('Error initializing JSON features:', error);
    }
}

// ===== GLOBAL FUNCTIONS FOR JSON INTERACTION =====
// Make these functions available globally for HTML onclick attributes
window.refreshJSONData = async function() {
    try {
        const jsonReflections = await fetchJSONReflections();
        
        // Remove existing JSON entries
        document.querySelectorAll('.journal-entry[data-source="json"]').forEach(entry => {
            entry.remove();
        });
        
        // Display updated JSON reflections
        displayJSONReflections(jsonReflections);
        updateReflectionCounter();
        
        // Re-initialize features
        initCollapsibleSections();
        initClipboardAPI();
        
        showSuccessMessage('JSON data refreshed successfully!');
    } catch (error) {
        console.error('Error refreshing JSON data:', error);
        alert('Error refreshing JSON data. Please check the console for details.');
    }
};

window.showBackendInfo = function() {
    const infoDiv = document.getElementById('backend-info');
    const totalEntries = document.querySelectorAll('.journal-entry').length;
    const jsonEntries = document.querySelectorAll('.journal-entry[data-source="json"]').length;
    const localEntries = document.querySelectorAll('.journal-entry[data-is-new="true"]').length;
    const staticEntries = totalEntries - jsonEntries - localEntries;
    
    infoDiv.style.display = 'block';
    infoDiv.innerHTML = `
        <h4>📊 Backend Information</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin: 1rem 0;">
            <div><strong>Total Entries:</strong></div>
            <div>${totalEntries}</div>
            <div><strong>JSON Entries:</strong></div>
            <div>${jsonEntries}</div>
            <div><strong>Local Entries:</strong></div>
            <div>${localEntries}</div>
            <div><strong>Static Entries:</strong></div>
            <div>${staticEntries}</div>
        </div>
        <p><strong>JSON File:</strong> <code>backend/reflections.json</code></p>
        <p><strong>Python Script:</strong> <code>backend/save_entry.py</code></p>
        <p><strong>Usage:</strong> Run the Python script in terminal to add new reflections</p>
        <button onclick="this.parentElement.style.display='none'" class="btn-primary" style="margin-top: 1rem;">
            Close
        </button>
    `;
};

// Add keyframes for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
    }
    
    .youtube-controls-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 0.8rem;
        max-width: 500px;
        margin: 0 auto;
    }
    
    .yt-control-btn {
        background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
        color: white;
        border: none;
        padding: 0.8rem 0.5rem;
        border-radius: 25px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 600;
        font-size: 0.9rem;
        box-shadow: 0 3px 10px rgba(255, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: center;
        min-width: 100px;
    }
    
    .yt-control-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 15px rgba(255, 0, 0, 0.4);
    }
    
    .pause-btn {
        background: linear-gradient(135deg, #3498db 0%, #2980b9 100%) !important;
        box-shadow: 0 3px 10px rgba(52, 152, 219, 0.3) !important;
    }
    
    .stop-btn {
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%) !important;
        box-shadow: 0 3px 10px rgba(231, 76, 60, 0.3) !important;
    }
    
    .mute-btn, .unmute-btn {
        background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%) !important;
        box-shadow: 0 3px 10px rgba(149, 165, 166, 0.3) !important;
    }
    
    /* JSON Entry Styles */
    .journal-entry[data-source="json"] {
        border-left: 4px solid #27ae60;
    }
    
    .journal-entry[data-source="json"] .collapsible-header {
        background: linear-gradient(135deg, #f8f9fa 0%, #e8f5e8 100%);
    }
    
    .dark-theme .journal-entry[data-source="json"] {
        border-left-color: #2ecc71;
    }
    
    .dark-theme .journal-entry[data-source="json"] .collapsible-header {
        background: linear-gradient(135deg, #2d2d2d 0%, #1e2f1e 100%);
    }
    
    /* Reflection Counter Styles */
    .reflection-counter {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 12px;
        margin: 2rem 0;
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
    
    .reflection-counter h3 {
        margin: 0 0 1rem 0;
        text-align: center;
        font-size: 1.3rem;
    }
    
    .counter-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
    }
    
    .counter-item {
        text-align: center;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        backdrop-filter: blur(10px);
    }
    
    .counter-number {
        display: block;
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }
    
    .counter-label {
        font-size: 0.9rem;
        opacity: 0.9;
    }
    
    .dark-theme .reflection-counter {
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    }
    
    /* Python Backend Section Styles */
    .python-backend-section {
        background: var(--card-bg);
        padding: 2rem;
        border-radius: 12px;
        margin: 2rem 0;
        border: 2px solid #e9ecef;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    
    .python-backend-section h3 {
        color: #2c3e50;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .backend-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
        flex-wrap: wrap;
    }
    
    .backend-steps {
        margin: 1.5rem 0;
    }
    
    .backend-step {
        margin-bottom: 1rem;
        padding-left: 1.5rem;
        position: relative;
    }
    
    .backend-step:before {
        content: '▸';
        position: absolute;
        left: 0;
        color: #667eea;
        font-weight: bold;
    }
    
    .dark-theme .python-backend-section {
        border-color: #404040;
    }
    
    .json-error {
        color: #e74c3c;
        background: rgba(231, 76, 60, 0.1);
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
        border-left: 4px solid #e74c3c;
    }
`;
document.head.appendChild(style);
