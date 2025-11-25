// Global state
let allPrompts = []
let allCategories = []
let currentCategory = 'すべて'
let currentTags = []

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadCategories()
    loadPrompts()
})

// Load all prompts
async function loadPrompts() {
    try {
        const response = await axios.get('/api/prompts')
        allPrompts = response.data.prompts
        renderPrompts(allPrompts)
    } catch (error) {
        console.error('Error loading prompts:', error)
        showError('プロンプトの読み込みに失敗しました')
    }
}

// Load categories
async function loadCategories() {
    try {
        const response = await axios.get('/api/categories')
        const categories = response.data.categories
        allCategories = categories
        
        // Update sidebar category list
        const categoryList = document.getElementById('categoryList')
        categoryList.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold accent-cyan">
                    <i class="fas fa-folder mr-2"></i>
                    カテゴリー
                </h3>
                <button onclick="openCategoryModal()" class="text-cyan-400 hover:text-cyan-300" title="カテゴリーを追加">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="category-item ${currentCategory === 'すべて' ? 'active' : ''}" onclick="filterByCategory('すべて')">
                <i class="fas fa-th-large mr-2"></i>
                すべて
            </div>
            <div id="sortableCategories">
            </div>
        `
        
        const sortableContainer = document.getElementById('sortableCategories')
        categories.forEach(category => {
            const iconClass = category.icon || 'layer-group'
            const color = category.color || '#4CD1E0'
            const categoryDiv = document.createElement('div')
            categoryDiv.className = `category-item ${currentCategory === category.name ? 'active' : ''} group flex items-center justify-between`
            categoryDiv.dataset.id = category.id
            categoryDiv.innerHTML = `
                <div onclick="filterByCategory('${escapeHtml(category.name)}')">
                    <i class="fas fa-${iconClass} mr-2" style="color: ${color}"></i>
                    ${escapeHtml(category.name)}
                </div>
                <div class="hidden group-hover:flex gap-2" onclick="event.stopPropagation()">
                    <button onclick="editCategory(${category.id})" class="text-gray-400 hover:text-cyan-400" title="編集">
                        <i class="fas fa-edit text-xs"></i>
                    </button>
                    <button onclick="deleteCategory(${category.id})" class="text-gray-400 hover:text-red-400" title="削除">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            `
            sortableContainer.appendChild(categoryDiv)
        })
        
        // Initialize SortableJS
        if (window.Sortable && sortableContainer) {
            new Sortable(sortableContainer, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                dragClass: 'sortable-drag',
                onEnd: async function(evt) {
                    // Get new order of category IDs
                    const categoryIds = Array.from(sortableContainer.children).map(
                        el => parseInt(el.dataset.id)
                    )
                    
                    // Save new order to backend
                    try {
                        await axios.put('/api/categories/reorder', { categoryIds })
                        console.log('Categories reordered successfully')
                    } catch (error) {
                        console.error('Error reordering categories:', error)
                        // Reload categories on error
                        loadCategories()
                    }
                }
            })
        }
        
        // Update category dropdown in modal
        updateCategoryDropdown()
    } catch (error) {
        console.error('Error loading categories:', error)
    }
}

// Update category dropdown in prompt modal
function updateCategoryDropdown() {
    const categorySelect = document.getElementById('category')
    if (!categorySelect) return
    
    const currentValue = categorySelect.value
    categorySelect.innerHTML = '<option value="">カテゴリーを選択してください</option>'
    
    allCategories.forEach(category => {
        const option = document.createElement('option')
        option.value = category.name
        option.textContent = category.name
        if (category.name === currentValue) {
            option.selected = true
        }
        categorySelect.appendChild(option)
    })
}

// Render prompts grid
function renderPrompts(prompts) {
    const grid = document.getElementById('promptsGrid')
    const emptyState = document.getElementById('emptyState')
    
    if (prompts.length === 0) {
        grid.innerHTML = ''
        emptyState.classList.remove('hidden')
        // Destroy sortable if exists
        if (grid.sortableInstance) {
            grid.sortableInstance.destroy()
            grid.sortableInstance = null
        }
        return
    }
    
    emptyState.classList.add('hidden')
    grid.innerHTML = prompts.map(prompt => `
        <div class="card p-6 prompt-card" data-id="${prompt.id}" data-prompt-id="${prompt.id}">
            <div class="prompt-card-clickable">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-2 flex-1">
                        <button class="drag-handle text-gray-500 hover:text-cyan-400 cursor-move" title="ドラッグして並び替え">
                            <i class="fas fa-grip-vertical"></i>
                        </button>
                        <h3 class="text-xl font-bold text-white">${escapeHtml(prompt.title)}</h3>
                    </div>
                    <span class="text-xs text-gray-500">${formatDate(prompt.created_at)}</span>
                </div>
                
                <div class="mb-3 flex flex-wrap items-center gap-2">
                    <span class="text-sm bg-gray-700 px-3 py-1 rounded-full">
                        <i class="fas fa-folder mr-1"></i>
                        ${escapeHtml(prompt.category)}
                    </span>
                    ${prompt.tags && prompt.tags.length > 0 ? 
                        prompt.tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')
                    : ''}
                </div>
                
                ${prompt.image_url ? `
                    <div class="mb-4">
                        <img src="${escapeHtml(prompt.image_url)}" alt="Prompt image" class="w-full h-32 object-cover rounded-lg" onerror="this.style.display='none'" />
                    </div>
                ` : ''}
                
                <p class="text-gray-400 text-sm mb-4 line-clamp-3">${escapeHtml(prompt.prompt).substring(0, 150)}...</p>
            </div>
            
            <div class="flex gap-3 justify-center items-center pt-3 border-t border-gray-700 action-buttons">
                <button class="btn-icon btn-copy" title="コピー" data-action="copy" data-id="${prompt.id}">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="btn-icon btn-edit" title="編集" data-action="edit" data-id="${prompt.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-icon-delete btn-delete-action" title="削除" data-action="delete" data-id="${prompt.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('')
    
    // Add click event listeners to clickable areas
    document.querySelectorAll('.prompt-card-clickable').forEach(clickable => {
        clickable.addEventListener('click', function(e) {
            const card = this.closest('.prompt-card')
            const promptId = parseInt(card.dataset.promptId)
            showPromptDetail(promptId)
        })
    })
    
    // Add click event listeners to action buttons
    document.querySelectorAll('.action-buttons button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation()
            const action = this.dataset.action
            const id = parseInt(this.dataset.id)
            
            switch(action) {
                case 'copy':
                    copyPrompt(id)
                    break
                case 'edit':
                    editPrompt(id)
                    break
                case 'delete':
                    deletePrompt(id)
                    break
            }
        })
    })
    
    // Prevent drag handle clicks from triggering card click
    document.querySelectorAll('.drag-handle').forEach(handle => {
        handle.addEventListener('click', function(e) {
            e.stopPropagation()
        })
    })
    
    // Initialize SortableJS for prompt cards
    if (window.Sortable && grid) {
        // Destroy previous instance if exists
        if (grid.sortableInstance) {
            grid.sortableInstance.destroy()
        }
        
        grid.sortableInstance = new Sortable(grid, {
            animation: 150,
            handle: '.drag-handle',
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
            onEnd: async function(evt) {
                // Get new order of prompt IDs
                const promptIds = Array.from(grid.children).map(
                    el => parseInt(el.dataset.id)
                )
                
                // Save new order to backend
                try {
                    await axios.put('/api/prompts/reorder', { promptIds })
                    console.log('Prompts reordered successfully')
                } catch (error) {
                    console.error('Error reordering prompts:', error)
                    showError('並び替えの保存に失敗しました')
                    // Reload prompts on error
                    loadPrompts()
                }
            }
        })
    }
}

// Filter by category
function filterByCategory(category) {
    currentCategory = category
    handleSearch()
    loadCategories()
}

// Handle search
function handleSearch() {
    const keyword = document.getElementById('keywordSearch').value.toLowerCase()
    const tag = document.getElementById('tagSearch').value.toLowerCase()
    
    let filtered = allPrompts
    
    // Filter by category
    if (currentCategory && currentCategory !== 'すべて') {
        filtered = filtered.filter(p => p.category === currentCategory)
    }
    
    // Filter by keyword
    if (keyword) {
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(keyword) || 
            p.prompt.toLowerCase().includes(keyword)
        )
    }
    
    // Filter by tag
    if (tag) {
        filtered = filtered.filter(p => 
            p.tags && p.tags.some(t => t.toLowerCase().includes(tag))
        )
    }
    
    renderPrompts(filtered)
}

// Copy prompt to clipboard
async function copyPrompt(id) {
    try {
        const response = await axios.get(`/api/prompts/${id}`)
        const prompt = response.data.prompt
        
        await navigator.clipboard.writeText(prompt.prompt)
        showSuccess('プロンプトをコピーしました')
    } catch (error) {
        console.error('Error copying prompt:', error)
        showError('コピーに失敗しました')
    }
}

// Edit prompt
async function editPrompt(id) {
    try {
        const response = await axios.get(`/api/prompts/${id}`)
        const prompt = response.data.prompt
        
        document.getElementById('promptId').value = prompt.id
        document.getElementById('title').value = prompt.title
        document.getElementById('prompt').value = prompt.prompt
        
        // Update category dropdown and set value
        updateCategoryDropdown()
        document.getElementById('category').value = prompt.category
        
        // Set tags
        currentTags = prompt.tags || []
        renderTags()
        
        if (prompt.image_url) {
            document.getElementById('imageUrl').value = prompt.image_url
            previewImage()
        }
        
        document.getElementById('modalTitle').textContent = 'プロンプト編集'
        document.getElementById('promptModal').classList.add('active')
    } catch (error) {
        console.error('Error loading prompt:', error)
        showError('プロンプトの読み込みに失敗しました')
    }
}

// Delete prompt
async function deletePrompt(id) {
    if (!confirm('このプロンプトを削除してもよろしいですか？')) {
        return
    }
    
    try {
        await axios.delete(`/api/prompts/${id}`)
        showSuccess('プロンプトを削除しました')
        loadPrompts()
        loadCategories()
    } catch (error) {
        console.error('Error deleting prompt:', error)
        showError('プロンプトの削除に失敗しました')
    }
}

// Open new prompt modal
function openNewPromptModal() {
    document.getElementById('promptForm').reset()
    document.getElementById('promptId').value = ''
    document.getElementById('modalTitle').textContent = '新規プロンプト'
    currentTags = []
    renderTags()
    document.getElementById('imagePreview').classList.add('hidden')
    updateCategoryDropdown()
    
    // Pre-select current category if not "すべて"
    if (currentCategory && currentCategory !== 'すべて') {
        document.getElementById('category').value = currentCategory
    }
    
    document.getElementById('promptModal').classList.add('active')
}

// Close modal
function closeModal() {
    document.getElementById('promptModal').classList.remove('active')
}

// Handle form submit
async function handleSubmit(event) {
    event.preventDefault()
    
    const id = document.getElementById('promptId').value
    const title = document.getElementById('title').value
    const prompt = document.getElementById('prompt').value
    const category = document.getElementById('category').value
    const imageUrl = document.getElementById('imageUrl').value
    
    const data = {
        title,
        prompt,
        category,
        tags: currentTags,
        image_url: imageUrl || null
    }
    
    try {
        if (id) {
            // Update existing prompt
            await axios.put(`/api/prompts/${id}`, data)
            showSuccess('プロンプトを更新しました')
        } else {
            // Create new prompt
            await axios.post('/api/prompts', data)
            showSuccess('プロンプトを作成しました')
        }
        
        closeModal()
        loadPrompts()
        loadCategories()
    } catch (error) {
        console.error('Error saving prompt:', error)
        showError('プロンプトの保存に失敗しました')
    }
}

// Tag input handling
function handleTagInput(event) {
    if (event.key === 'Enter') {
        event.preventDefault()
        const input = event.target
        const tag = input.value.trim()
        
        if (tag && !currentTags.includes(tag)) {
            currentTags.push(tag)
            renderTags()
            input.value = ''
        }
    }
}

// Remove tag
function removeTag(index) {
    currentTags.splice(index, 1)
    renderTags()
}

// Render tags
function renderTags() {
    const container = document.getElementById('tagInputContainer')
    const input = document.getElementById('tagInput')
    
    container.innerHTML = currentTags.map((tag, index) => `
        <div class="tag-item">
            ${escapeHtml(tag)}
            <button type="button" onclick="removeTag(${index})">×</button>
        </div>
    `).join('')
    
    container.appendChild(input)
}

// Preview image
function previewImage() {
    const url = document.getElementById('imageUrl').value
    const preview = document.getElementById('imagePreview')
    
    if (url) {
        preview.src = url
        preview.classList.remove('hidden')
    } else {
        preview.classList.add('hidden')
    }
}

// Category management functions
let currentCategoryId = null

// Icon list with names
const iconList = [
    { icon: 'layer-group', name: 'レイヤー' },
    { icon: 'crown', name: 'クラウン' },
    { icon: 'gem', name: 'ジェム' },
    { icon: 'fire', name: 'ファイア' },
    { icon: 'bolt', name: 'ボルト' },
    { icon: 'star', name: 'スター' },
    { icon: 'heart', name: 'ハート' },
    { icon: 'compass', name: 'コンパス' },
    { icon: 'rocket', name: 'ロケット' },
    { icon: 'wand-magic-sparkles', name: 'マジック' },
    { icon: 'brain', name: 'ブレイン' },
    { icon: 'lightbulb', name: 'アイデア' },
    { icon: 'atom', name: 'アトム' },
    { icon: 'infinity', name: 'インフィニティ' },
    { icon: 'shield-halved', name: 'シールド' },
    { icon: 'cube', name: 'キューブ' },
    { icon: 'code', name: 'コード' },
    { icon: 'pen-fancy', name: 'ペン' },
    { icon: 'palette', name: 'パレット' },
    { icon: 'chart-line', name: 'チャート' },
    { icon: 'camera', name: 'カメラ' },
    { icon: 'music', name: 'ミュージック' },
    { icon: 'gamepad', name: 'ゲーム' },
    { icon: 'gift', name: 'ギフト' }
]

function initIconGrid() {
    const iconGrid = document.getElementById('iconGrid')
    if (!iconGrid) return
    
    iconGrid.innerHTML = iconList.map(item => `
        <div class="icon-item" data-icon="${item.icon}" data-name="${item.name}" onclick="selectIcon('${item.icon}', '${item.name}')" title="${item.name}">
            <i class="fas fa-${item.icon}"></i>
        </div>
    `).join('')
    
    // Select first icon by default
    selectIcon('layer-group', 'レイヤー')
}

function selectIcon(icon, name) {
    // Update hidden input
    document.getElementById('categoryIcon').value = icon
    
    // Update preview
    const preview = document.getElementById('selectedIconPreview')
    const nameSpan = document.getElementById('selectedIconName')
    preview.className = `fas fa-${icon} mr-2 text-cyan-400`
    nameSpan.textContent = name
    
    // Update selected state
    document.querySelectorAll('.icon-item').forEach(item => {
        if (item.dataset.icon === icon) {
            item.classList.add('selected')
        } else {
            item.classList.remove('selected')
        }
    })
}

function openCategoryModal(categoryId = null) {
    currentCategoryId = categoryId
    const modal = document.getElementById('categoryModal')
    const title = document.getElementById('categoryModalTitle')
    
    // Initialize icon grid
    initIconGrid()
    
    if (categoryId) {
        // Edit mode
        title.textContent = 'カテゴリー編集'
        loadCategoryData(categoryId)
    } else {
        // Create mode
        title.textContent = '新規カテゴリー'
        document.getElementById('categoryForm').reset()
        selectIcon('layer-group', 'レイヤー')
    }
    
    modal.classList.add('active')
}

function closeCategoryModal() {
    document.getElementById('categoryModal').classList.remove('active')
    currentCategoryId = null
}

async function loadCategoryData(categoryId) {
    try {
        const response = await axios.get('/api/categories')
        const category = response.data.categories.find(c => c.id === categoryId)
        
        if (category) {
            document.getElementById('categoryName').value = category.name
            document.getElementById('categoryColor').value = category.color || '#4CD1E0'
            
            // Select the icon
            const iconInfo = iconList.find(i => i.icon === category.icon)
            if (iconInfo) {
                selectIcon(iconInfo.icon, iconInfo.name)
            } else {
                selectIcon('layer-group', 'レイヤー')
            }
        }
    } catch (error) {
        console.error('Error loading category:', error)
    }
}

async function handleCategorySubmit(event) {
    event.preventDefault()
    
    const name = document.getElementById('categoryName').value
    const icon = document.getElementById('categoryIcon').value
    const color = document.getElementById('categoryColor').value
    
    const data = { name, icon, color }
    
    try {
        if (currentCategoryId) {
            // Update
            await axios.put(`/api/categories/${currentCategoryId}`, data)
            showSuccess('カテゴリーを更新しました')
        } else {
            // Create
            await axios.post('/api/categories', data)
            showSuccess('カテゴリーを作成しました')
        }
        
        closeCategoryModal()
        await loadCategories()
        loadPrompts()
    } catch (error) {
        console.error('Error saving category:', error)
        showError('カテゴリーの保存に失敗しました')
    }
}

async function editCategory(categoryId) {
    event.stopPropagation()
    openCategoryModal(categoryId)
}

async function deleteCategory(categoryId) {
    event.stopPropagation()
    
    if (!confirm('このカテゴリーを削除してもよろしいですか？')) {
        return
    }
    
    try {
        await axios.delete(`/api/categories/${categoryId}`)
        showSuccess('カテゴリーを削除しました')
        
        // Reset to "すべて" if deleted category was selected
        const deletedCategory = allCategories.find(c => c.id === categoryId)
        if (deletedCategory && currentCategory === deletedCategory.name) {
            currentCategory = 'すべて'
        }
        
        await loadCategories()
        loadPrompts()
    } catch (error) {
        console.error('Error deleting category:', error)
        showError('カテゴリーの削除に失敗しました')
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

function formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return '今日'
    if (days === 1) return '昨日'
    if (days < 7) return `${days}日前`
    
    return date.toLocaleDateString('ja-JP')
}

function showSuccess(message) {
    alert(message)
}

function showError(message) {
    alert(message)
}

function showLoading(message) {
    // Simple loading indicator
    const loading = document.createElement('div')
    loading.id = 'loadingIndicator'
    loading.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px 40px; border-radius: 8px; z-index: 9999;'
    loading.innerHTML = `<div class="loading" style="display: inline-block; margin-right: 10px;"></div>${message}`
    document.body.appendChild(loading)
}

function hideLoading() {
    const loading = document.getElementById('loadingIndicator')
    if (loading) {
        loading.remove()
    }
}

// Prompt Detail Modal Functions
let currentDetailPromptId = null

async function showPromptDetail(id) {
    try {
        const response = await axios.get(`/api/prompts/${id}`)
        const prompt = response.data.prompt
        
        currentDetailPromptId = id
        
        // Set title
        document.getElementById('detailTitle').textContent = prompt.title
        
        // Set category
        document.getElementById('detailCategory').innerHTML = `
            <i class="fas fa-folder mr-2"></i>
            ${escapeHtml(prompt.category)}
        `
        
        // Set date
        document.getElementById('detailDate').textContent = formatDate(prompt.created_at)
        
        // Set tags
        const tagsContainer = document.getElementById('detailTagsContainer')
        const tagsDiv = document.getElementById('detailTags')
        if (prompt.tags && prompt.tags.length > 0) {
            tagsContainer.classList.remove('hidden')
            tagsDiv.innerHTML = prompt.tags.map(tag => 
                `<span class="tag">#${escapeHtml(tag)}</span>`
            ).join('')
        } else {
            tagsContainer.classList.add('hidden')
        }
        
        // Set image
        const imageContainer = document.getElementById('detailImageContainer')
        const imageElement = document.getElementById('detailImage')
        if (prompt.image_url) {
            imageContainer.classList.remove('hidden')
            imageElement.src = prompt.image_url
        } else {
            imageContainer.classList.add('hidden')
        }
        
        // Set prompt content
        document.getElementById('detailPrompt').textContent = prompt.prompt
        
        // Show modal
        document.getElementById('promptDetailModal').classList.add('active')
    } catch (error) {
        console.error('Error loading prompt detail:', error)
        showError('プロンプトの読み込みに失敗しました')
    }
}

function closeDetailModal() {
    document.getElementById('promptDetailModal').classList.remove('active')
    currentDetailPromptId = null
}

function copyDetailPrompt() {
    const promptText = document.getElementById('detailPrompt').textContent
    navigator.clipboard.writeText(promptText).then(() => {
        showSuccess('プロンプトをコピーしました')
    }).catch(err => {
        console.error('Failed to copy:', err)
        showError('コピーに失敗しました')
    })
}

function editPromptFromDetail() {
    if (currentDetailPromptId) {
        closeDetailModal()
        editPrompt(currentDetailPromptId)
    }
}

function deletePromptFromDetail() {
    if (currentDetailPromptId) {
        closeDetailModal()
        deletePrompt(currentDetailPromptId)
    }
}
