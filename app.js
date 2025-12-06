/**
 * ALAÏA AI Creative Tool
 * Main Application Logic
 * 
 * Workflow:
 * 1. Homepage - Select a collection (colored square)
 * 2. Collection screen - Select an image from archive
 * 3. Theme select - Select a theme (colored square)
 * 4. Theme images - Select an image from mood folder
 * 5. Result - Display archive image + theme image + merged result
 */

class AlaiaApp {
    constructor() {
        this.currentScreen = 'home';
        this.selectedCollection = null;
        this.selectedArchiveImage = null;
        this.selectedTheme = null;
        this.selectedThemeImage = null;
        
        this.init();
    }
    
    init() {
        this.renderCollectionNavs();
        this.renderThemeNavs();
        this.bindEvents();
    }
    
    // ═══════════════════════════════════════════════════════════
    // RENDER FUNCTIONS
    // ═══════════════════════════════════════════════════════════
    
    renderCollectionNavs() {
        const navIds = ['collection-nav-home', 'collection-nav-collection', 'collection-nav-result'];
        
        navIds.forEach(navId => {
            const nav = document.getElementById(navId);
            if (!nav) return;
            
            nav.innerHTML = '';
            
            ALAIA_DATA.collections.forEach(collection => {
                const item = document.createElement('div');
                item.className = 'collection-item';
                item.dataset.collectionId = collection.id;
                
                item.innerHTML = `
                    <div class="collection-square" style="background-color: ${collection.color}"></div>
                    <span class="collection-label">collection<br>${collection.name}</span>
                `;
                
                item.addEventListener('click', () => this.selectCollection(collection));
                nav.appendChild(item);
            });
        });
    }
    
    renderThemeNavs() {
        const navIds = ['theme-nav', 'theme-nav-images'];
        
        const themeColors = {
            'artcontemporain': '#c50c14',
            'medieval': '#8b4513',
            'cyber': '#423b7a',
            'texture': '#7d655b',
            'nature': '#416654'
        };
        
        navIds.forEach(navId => {
            const nav = document.getElementById(navId);
            if (!nav) return;
            
            nav.innerHTML = '';
            
            ALAIA_DATA.themes.forEach(theme => {
                const item = document.createElement('div');
                item.className = 'theme-item';
                item.dataset.themeId = theme.id;
                
                item.innerHTML = `
                    <div class="theme-square" style="background-color: ${themeColors[theme.id] || '#888'}"></div>
                    <span class="theme-label">${theme.name}</span>
                `;
                
                item.addEventListener('click', () => this.selectTheme(theme));
                nav.appendChild(item);
            });
        });
    }
    
    renderArchiveGrid() {
        const looksGrid = document.getElementById('looks-grid');
        if (!looksGrid || !this.selectedCollection) return;
        
        const looks = getLooksByCollection(this.selectedCollection.id);
        looksGrid.innerHTML = '';
        
        // Simple grid without row numbers for cleaner layout
        looks.forEach((look, index) => {
            const card = document.createElement('div');
            card.className = 'look-card';
            card.innerHTML = `<img src="${look.image}" alt="Look ${look.lookNumber}" onerror="this.parentElement.classList.add('image-error'); this.style.display='none'; this.parentElement.innerHTML='<span style=\\'font-size:10px;color:#999;\\'>Image not found</span>';">`;
            card.addEventListener('click', () => this.selectArchiveImage(look));
            looksGrid.appendChild(card);
        });
        
        // Update collection header
        const indicator = document.getElementById('collection-indicator');
        const title = document.getElementById('collection-title');
        if (indicator) indicator.style.backgroundColor = this.selectedCollection.color;
        if (title) title.textContent = this.selectedCollection.name;
    }
    
    renderThemeImagesGrid() {
        const themeGrid = document.getElementById('theme-images-grid');
        if (!themeGrid || !this.selectedTheme) return;
        
        const themeImages = getThemeImages(this.selectedTheme.id);
        themeGrid.innerHTML = '';
        
        themeImages.forEach((img) => {
            const card = document.createElement('div');
            card.className = 'theme-image-card';
            card.innerHTML = `<img src="${img.path}" alt="Theme ${img.number}" onerror="this.parentElement.classList.add('image-error'); this.style.display='none'; this.parentElement.innerHTML='<span style=\\'font-size:10px;color:#999;\\'>Image not found</span>';">`;
            card.addEventListener('click', () => this.selectThemeImage(img.path, img.number));
            themeGrid.appendChild(card);
        });
        
        // Update theme header
        const themeColors = {
            'artcontemporain': '#c50c14',
            'medieval': '#8b4513',
            'cyber': '#423b7a',
            'texture': '#7d655b',
            'nature': '#416654'
        };
        
        const indicator = document.getElementById('theme-indicator');
        const title = document.getElementById('theme-title');
        if (indicator) indicator.style.backgroundColor = themeColors[this.selectedTheme.id] || '#888';
        if (title) title.textContent = this.selectedTheme.name;
    }
    
    // ═══════════════════════════════════════════════════════════
    // EVENT BINDING
    // ═══════════════════════════════════════════════════════════
    
    bindEvents() {
        document.getElementById('back-from-collection')?.addEventListener('click', () => this.showScreen('home'));
        document.getElementById('back-from-theme-select')?.addEventListener('click', () => this.showScreen('collection'));
        document.getElementById('back-from-theme-images')?.addEventListener('click', () => this.showScreen('theme-select'));
        
        document.getElementById('regenerate-btn')?.addEventListener('click', () => this.regenerate());
        document.getElementById('restart-btn')?.addEventListener('click', () => this.restart());
    }
    
    // ═══════════════════════════════════════════════════════════
    // SELECTION HANDLERS
    // ═══════════════════════════════════════════════════════════
    
    selectCollection(collection) {
        this.selectedCollection = collection;
        
        document.querySelectorAll('.collection-item').forEach(item => {
            item.classList.toggle('active', item.dataset.collectionId === collection.id);
        });
        
        this.renderArchiveGrid();
        this.showScreen('collection');
    }
    
    selectArchiveImage(look) {
        this.selectedArchiveImage = look;
        
        const previewImg = document.getElementById('selected-look-preview-img');
        if (previewImg) {
            previewImg.src = look.image;
        }
        
        this.showScreen('theme-select');
    }
    
    selectTheme(theme) {
        this.selectedTheme = theme;
        
        document.querySelectorAll('.theme-item').forEach(item => {
            item.classList.toggle('active', item.dataset.themeId === theme.id);
        });
        
        this.renderThemeImagesGrid();
        this.showScreen('theme-images');
    }
    
    selectThemeImage(imagePath, imageNumber) {
        this.selectedThemeImage = {
            path: imagePath,
            number: imageNumber
        };
        
        this.displayResult();
        this.showScreen('result');
    }
    
    // ═══════════════════════════════════════════════════════════
    // RESULT DISPLAY
    // ═══════════════════════════════════════════════════════════
    
    displayResult() {
        const archiveImg = document.getElementById('archive-img');
        if (archiveImg && this.selectedArchiveImage) {
            archiveImg.src = this.selectedArchiveImage.image;
        }
        
        const archiveLabel = document.getElementById('archive-label');
        if (archiveLabel && this.selectedCollection) {
            archiveLabel.textContent = this.selectedCollection.name.toUpperCase();
        }
        
        const themeImg = document.getElementById('theme-img');
        if (themeImg && this.selectedThemeImage) {
            themeImg.src = this.selectedThemeImage.path;
        }
        
        const themeLabel = document.getElementById('theme-label');
        if (themeLabel && this.selectedTheme) {
            themeLabel.textContent = this.selectedTheme.name.toUpperCase();
        }
        
        const requirement = getRandomRequirement();
        const requirementsContent = document.getElementById('requirements-content');
        if (requirementsContent) {
            requirementsContent.innerHTML = `${requirement.category} —<br>${requirement.details.join('<br>')}`;
        }
    }
    
    regenerate() {
        this.showScreen('theme-select');
    }
    
    // ═══════════════════════════════════════════════════════════
    // NAVIGATION
    // ═══════════════════════════════════════════════════════════
    
    showScreen(screenName) {
        this.currentScreen = screenName;
        
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const screen = document.getElementById(`${screenName}-screen`);
        if (screen) {
            screen.classList.add('active');
            window.scrollTo(0, 0);
        }
    }
    
    restart() {
        this.selectedCollection = null;
        this.selectedArchiveImage = null;
        this.selectedTheme = null;
        this.selectedThemeImage = null;
        
        document.querySelectorAll('.collection-item, .theme-item').forEach(item => {
            item.classList.remove('active');
        });
        
        this.showScreen('home');
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.alaiaApp = new AlaiaApp();
});
