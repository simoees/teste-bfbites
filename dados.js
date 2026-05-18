
// Banco de dados simulado
const db = {
    sabores: [
        { id: 1, nome: 'Frango com catupiry', icone: '🧀', quantidade: 50, preco: 5.00 },
        { id: 2, nome: 'Calabresa', icone: '🌶️', quantidade: 50, preco: 5.00 },
        { id: 3, nome: 'Carne moída', icone: '🥩', quantidade: 50, preco: 5.00 },
        { id: 4, nome: 'Presunto e queijo', icone: '🧀', quantidade: 0, preco: 5.00 }
    ],
    
    pedidos: [
        { id: 1, cliente: 'João', saborId: 2, saborNome: 'Calabresa', quantidade: 5, status: 'pendente', data: new Date().toISOString() },
        { id: 2, cliente: 'Lás', saborId: 1, saborNome: 'Frango com catupiry', quantidade: 1, status: 'pendente', data: new Date().toISOString() },
        { id: 3, cliente: 'Emilly', saborId: 3, saborNome: 'Carne moída', quantidade: 2, status: 'pendente', data: new Date().toISOString() },
        { id: 4, cliente: 'Nicoly', saborId: 4, saborNome: 'Presunto e queijo', quantidade: 1, status: 'pendente', data: new Date().toISOString() }
    ],
    
    historicoPedidos: [],
    notificacoes: [],
    
    // Funções auxiliares
    getSaborById(id) {
        return this.sabores.find(s => s.id === id);
    },
    
    updateEstoque(saborId, quantidade) {
        const sabor = this.getSaborById(saborId);
        if (sabor) {
            sabor.quantidade += quantidade;
            return true;
        }
        return false;
    },
    
    addPedido(pedido) {
        this.pedidos.push(pedido);
        this.addNotificacao(`Novo pedido de ${pedido.cliente}: ${pedido.quantidade} ${pedido.saborNome}`, 'info');
    },
    
    concluirPedido(pedidoId) {
        const index = this.pedidos.findIndex(p => p.id === pedidoId);
        if (index !== -1) {
            const pedido = this.pedidos[index];
            const sabor = this.getSaborById(pedido.saborId);
            
            if (sabor && sabor.quantidade >= pedido.quantidade) {
                sabor.quantidade -= pedido.quantidade;
                pedido.status = 'entregue';
                this.historicoPedidos.push({ ...pedido, entregueEm: new Date().toISOString() });
                this.pedidos.splice(index, 1);
                this.addNotificacao(`Pedido de ${pedido.cliente} foi entregue! ✅`, 'success');
                return true;
            } else {
                this.addNotificacao(`Estoque insuficiente para ${pedido.saborNome}!`, 'error');
                return false;
            }
        }
        return false;
    },
    
    cancelarPedido(pedidoId) {
        const index = this.pedidos.findIndex(p => p.id === pedidoId);
        if (index !== -1) {
            const pedido = this.pedidos[index];
            pedido.status = 'cancelado';
            this.historicoPedidos.push({ ...pedido, canceladoEm: new Date().toISOString() });
            this.pedidos.splice(index, 1);
            this.addNotificacao(`Pedido de ${pedido.cliente} foi cancelado ❌`, 'warning');
            return true;
        }
        return false;
    },
    
    addNotificacao(mensagem, tipo = 'info') {
        this.notificacoes.unshift({
            id: Date.now(),
            mensagem,
            tipo,
            data: new Date().toISOString(),
            lida: false
        });
        
        // Manter apenas últimas 20 notificações
        if (this.notificacoes.length > 20) {
            this.notificacoes.pop();
        }
    },
    
    getNotificacoesNaoLidas() {
        return this.notificacoes.filter(n => !n.lida);
    },
    
    marcarNotificacoesComoLidas() {
        this.notificacoes.forEach(n => n.lida = true);
    },
    
    encerrarExpediente() {
        const resumo = {
            data: new Date().toISOString(),
            pedidosEntregues: this.historicoPedidos.filter(p => p.status === 'entregue').length,
            pedidosCancelados: this.pedidos.filter(p => p.status === 'cancelado').length,
            vendasPorSabor: {}
        };
        
        // Calcular vendas
        this.historicoPedidos.forEach(pedido => {
            if (!resumo.vendasPorSabor[pedido.saborNome]) {
                resumo.vendasPorSabor[pedido.saborNome] = 0;
            }
            resumo.vendasPorSabor[pedido.saborNome] += pedido.quantidade;
        });
        
        // Limpar pedidos pendentes
        this.pedidos = [];
        
        return resumo;
    }
};

// Salvar no localStorage para persistência
function saveToLocalStorage() {
    const dataToSave = {
        sabores: db.sabores,
        pedidos: db.pedidos,
        historicoPedidos: db.historicoPedidos,
        notificacoes: db.notificacoes
    };
    localStorage.setItem('bfBitesData', JSON.stringify(dataToSave));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('bfBitesData');
    if (savedData) {
        const data = JSON.parse(savedData);
        db.sabores = data.sabores;
        db.pedidos = data.pedidos;
        db.historicoPedidos = data.historicoPedidos;
        db.notificacoes = data.notificacoes;
    }
}

// Carregar dados ao iniciar
loadFromLocalStorage();

// Salvar automaticamente a cada 5 segundos
setInterval(saveToLocalStorage, 5000);
