
// ============================================
// BF BITES - SCRIPT GLOBAL
// Funções utilitárias e helpers para todo o sistema
// ============================================

// ===== FUNÇÕES DE NOTIFICAÇÃO =====
function showToast(message, type = 'info') {
    // Remove toast existente se houver
    const existingToast = document.querySelector('.custom-toast');
    if (existingToast) existingToast.remove();
    
    // Criar novo toast
    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    toast.innerHTML = `
        <span>${getToastIcon(type)} ${message}</span>
    `;
    
    // Estilos do toast
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#2196F3'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideUp 0.3s ease;
        white-space: nowrap;
        max-width: 90%;
        white-space: normal;
        text-align: center;
    `;
    
    document.body.appendChild(toast);
    
    // Remover após 3 segundos
    setTimeout(() => {
        if (toast && toast.remove) toast.remove();
    }, 3000);
}

function getToastIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
}

// ===== FUNÇÕES DE FORMATAÇÃO =====
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    }).format(new Date(date));
}

function formatNumber(value) {
    return new Intl.NumberFormat('pt-BR').format(value);
}

// ===== FUNÇÕES DE VALIDAÇÃO =====
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}-?[0-9]{4}$/;
    return re.test(phone);
}

function validatePositiveNumber(value) {
    return !isNaN(value) && value > 0;
}

// ===== FUNÇÕES DE ARMAZENAMENTO LOCAL =====
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(`bfbites_${key}`, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Erro ao salvar no localStorage:', e);
        return false;
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(`bfbites_${key}`);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Erro ao carregar do localStorage:', e);
        return null;
    }
}

function removeFromLocalStorage(key) {
    localStorage.removeItem(`bfbites_${key}`);
}

// ===== FUNÇÕES DE LOADING =====
function showLoading(elementId = null) {
    if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            const originalContent = element.innerHTML;
            element.setAttribute('data-original', originalContent);
            element.innerHTML = '<div class="loading-spinner"></div> Carregando...';
        }
    } else {
        // Criar overlay de loading global
        const overlay = document.createElement('div');
        overlay.id = 'globalLoading';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        overlay.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 12px; text-align: center;">
                <div class="loading-spinner" style="margin: 0 auto 10px;"></div>
                <p>Carregando...</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }
}

function hideLoading(elementId = null) {
    if (elementId) {
        const element = document.getElementById(elementId);
        if (element && element.hasAttribute('data-original')) {
            element.innerHTML = element.getAttribute('data-original');
            element.removeAttribute('data-original');
        }
    } else {
        const overlay = document.getElementById('globalLoading');
        if (overlay) overlay.remove();
    }
}

// ===== FUNÇÕES DE MODAL =====
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        // Adicionar animação
        modal.style.animation = 'fadeIn 0.3s ease';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// ===== FUNÇÕES DE CONFIRMAÇÃO =====
function showConfirm(message, onConfirm, onCancel = null) {
    // Criar modal de confirmação dinâmico
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 300px;">
            <h3>⚠️ Confirmação</h3>
            <p style="margin: 16px 0;">${message}</p>
            <div class="modal-buttons">
                <button class="btn btn-primary" id="confirmYes">Sim</button>
                <button class="btn btn-secondary" id="confirmNo">Não</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('confirmYes').onclick = () => {
        modal.remove();
        if (onConfirm) onConfirm();
    };
    
    document.getElementById('confirmNo').onclick = () => {
        modal.remove();
        if (onCancel) onCancel();
    };
}

// ===== FUNÇÕES DE RELATÓRIO =====
function generateReport(data, type = 'pedidos') {
    let report = '';
    const date = new Date().toLocaleDateString('pt-BR');
    
    switch(type) {
        case 'pedidos':
            report = `📊 RELATÓRIO DE PEDIDOS - ${date}\n`;
            report += '═'.repeat(40) + '\n';
            data.forEach((item, index) => {
                report += `${index + 1}. ${item.cliente}: ${item.quantidade}x ${item.saborNome} - ${item.status}\n`;
            });
            break;
            
        case 'estoque':
            report = `📦 RELATÓRIO DE ESTOQUE - ${date}\n`;
            report += '═'.repeat(40) + '\n';
            data.forEach(item => {
                const status = item.quantidade === 0 ? 'ESGOTADO' : item.quantidade < 10 ? 'BAIXO' : 'OK';
                report += `${item.icone} ${item.nome}: ${item.quantidade} unidades [${status}]\n`;
            });
            break;
            
        case 'vendas':
            report = `💰 RELATÓRIO DE VENDAS - ${date}\n`;
            report += '═'.repeat(40) + '\n';
            let total = 0;
            data.forEach(item => {
                const subtotal = item.quantidade * (item.preco || 5);
                total += subtotal;
                report += `${item.saborNome}: ${item.quantidade} unidades - ${formatCurrency(subtotal)}\n`;
            });
            report += '═'.repeat(40) + '\n';
            report += `TOTAL: ${formatCurrency(total)}`;
            break;
    }
    
    return report;
}

function downloadReport(report, filename = 'relatorio.txt') {
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('Relatório baixado com sucesso!', 'success');
}

// ===== FUNÇÕES DE PESQUISA E FILTRO =====
function searchItems(items, searchTerm, fields = ['nome']) {
    if (!searchTerm) return items;
    
    const term = searchTerm.toLowerCase();
    return items.filter(item => {
        return fields.some(field => {
            const value = item[field] || '';
            return value.toString().toLowerCase().includes(term);
        });
    });
}

function filterByStatus(items, status, statusField = 'status') {
    if (!status || status === 'todos') return items;
    return items.filter(item => item[statusField] === status);
}

// ===== FUNÇÕES DE ORDENAÇÃO =====
function sortBy(items, field, order = 'asc') {
    const sorted = [...items];
    sorted.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        
        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }
        
        if (order === 'asc') {
            return valA > valB ? 1 : valA < valB ? -1 : 0;
        } else {
            return valA < valB ? 1 : valA > valB ? -1 : 0;
        }
    });
    return sorted;
}

// ===== FUNÇÕES DE MASCARAMENTO =====
function maskPhone(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length <= 2) {
        value = value.replace(/^(\d{0,2})/, '($1');
    } else if (value.length <= 6) {
        value = value.replace(/^(\d{2})(\d{0,4})/, '($1) $2');
    } else {
        value = value.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    input.value = value;
}

function maskMoney(input) {
    let value = input.value.replace(/\D/g, '');
    value = (parseInt(value) / 100).toFixed(2);
    input.value = formatCurrency(value);
}

// ===== FUNÇÕES DE VALIDAÇÃO DE FORMULÁRIO =====
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
            
            // Adicionar mensagem de erro
            let errorMsg = input.parentElement.querySelector('.error-message');
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'Campo obrigatório';
                input.parentElement.appendChild(errorMsg);
            }
            errorMsg.style.display = 'block';
        } else {
            input.classList.remove('error');
            const errorMsg = input.parentElement.querySelector('.error-message');
            if (errorMsg) errorMsg.style.display = 'none';
        }
    });
    
    return isValid;
}

// ===== FUNÇÕES DE PERSISTÊNCIA DE SESSÃO =====
function setSession(userData) {
    sessionStorage.setItem('bfbites_session', JSON.stringify({
        ...userData,
        timestamp: new Date().getTime(),
        expiresIn: 3600000 // 1 hora
    }));
}

function getSession() {
    const session = sessionStorage.getItem('bfbites_session');
    if (!session) return null;
    
    const data = JSON.parse(session);
    const now = new Date().getTime();
    
    if (now - data.timestamp > data.expiresIn) {
        sessionStorage.removeItem('bfbites_session');
        return null;
    }
    
    return data;
}

function clearSession() {
    sessionStorage.removeItem('bfbites_session');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
}

// ===== FUNÇÕES DE CONEXÃO COM API (para futuro back-end) =====
async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`/api/${endpoint}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Erro na requisição');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        showToast(error.message, 'error');
        return null;
    }
}

// ===== FUNÇÕES DE IMPORTAÇÃO/EXPORTAÇÃO =====
function exportData(data, filename = 'bfbites_backup.json') {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('Dados exportados com sucesso!', 'success');
}

function importData(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (callback) callback(data);
            showToast('Dados importados com sucesso!', 'success');
        } catch (error) {
            showToast('Erro ao importar dados: arquivo inválido', 'error');
        }
    };
    reader.readAsText(file);
}

// ===== FUNÇÕES DE ANIMAÇÃO =====
function animateElement(element, animation, duration = 300) {
    if (!element) return;
    
    element.style.animation = `${animation} ${duration}ms ease`;
    setTimeout(() => {
        element.style.animation = '';
    }, duration);
}

// Estilos de animação (adicionar ao CSS)
const animationStyles = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    .loading-spinner {
        width: 30px;
        height: 30px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #FFC107;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Adicionar estilos de animação ao documento
if (!document.querySelector('#animationStyles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'animationStyles';
    styleSheet.textContent = animationStyles;
    document.head.appendChild(styleSheet);
}

// ===== EXPORTAR FUNÇÕES PARA USO GLOBAL =====
window.BFBites = {
    showToast,
    formatCurrency,
    formatDate,
    formatNumber,
    validateEmail,
    validatePhone,
    saveToLocalStorage,
    loadFromLocalStorage,
    removeFromLocalStorage,
    showLoading,
    hideLoading,
    openModal,
    closeModal,
    closeAllModals,
    showConfirm,
    generateReport,
    downloadReport,
    searchItems,
    filterByStatus,
    sortBy,
    maskPhone,
    validateForm,
    setSession,
    getSession,
    clearSession,
    exportData,
    importData,
    animateElement
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    // Fechar modais ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Prevenir envio de formulários vazios
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            if (!validateForm(form.id)) {
                e.preventDefault();
                showToast('Preencha todos os campos obrigatórios', 'warning');
            }
        });
    });
    
    console.log('✅ BF BITES - Script global carregado!');
});
