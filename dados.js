// ============================================
// BF BITES - BANCO DE DADOS MOCKADO
// Sistema de gerenciamento de pedidos e estoque
// ============================================

// Estrutura principal do banco de dados
const db = {
    // Sabores disponíveis
    sabores: [
        { id: 1, nome: 'Frango com catupiry', icone: '🧀', quantidade: 50, preco: 5.00 },
        { id: 2, nome: 'Calabresa', icone: '🌶️', quantidade: 50, preco: 5.00 },
        { id: 3, nome: 'Carne moída', icone: '🥩', quantidade: 50, preco: 5.00 },
        { id: 4, nome: 'Presunto e queijo', icone: '🧀', quantidade: 0, preco: 5.00 }
    ],
    
    // Pedidos ativos
    pedidos: [
        { id: 1, cliente: 'João', saborId: 2, saborNome: 'Calabresa', quantidade: 5, status: 'pendente', data: new Date().toISOString() },
        { id: 2, cliente: 'Lás', saborId: 1, saborNome: 'Frango com catupiry', quantidade: 1, status: 'pendente', data: new Date().toISOString() },
        { id: 3, cliente: 'Emilly', saborId: 3, saborNome: 'Carne moída', quantidade: 2, status: 'pendente', data: new Date().toISOString() },
        { id: 4, cliente: 'Nicoly', saborId: 4, saborNome: 'Presunto e queijo', quantidade: 1, status: 'pendente', data: new Date().toISOString() }
    ],
    
    // Histórico de pedidos
    historicoPedidos: [],
    
    // Notificações do sistema
    notificacoes: [],
    
    // Configurações
    config: {
        precoUnitario: 5.00,
        expedienteAberto: true,
        ultimoFechamento: null
    },
    
    // ===== FUNÇÕES PRINCIPAIS =====
    
    // Buscar sabor por ID
    getSaborById(id) {
        return this.sabores.find(s => s.id === id);
    },
    
    // Buscar sabor por nome
    getSaborByNome(nome) {
        return this.sabores.find(s => s.nome === nome);
    },
    
    // Atualizar estoque
    updateEstoque(saborId, quantidade) {
        const sabor = this.getSaborById(saborId);
        if (sabor) {
            const novaQuantidade = sabor.quantidade + quantidade;
            if (novaQuantidade >= 0) {
                sabor.quantidade = novaQuantidade;
                this.addNotificacao(`Estoque de ${sabor.nome} atualizado: +${quantidade} unidades`, 'success');
                this.saveToLocalStorage();
                return true;
            }
        }
        return false;
    },
    
    // Verificar disponibilidade de estoque
    verificarDisponibilidade(saborId, quantidade) {
        const sabor = this.getSaborById(saborId);
        return sabor && sabor.quantidade >= quantidade;
    },
    
    // Adicionar novo pedido
    addPedido(pedido) {
        // Verificar estoque antes de adicionar
        if (!this.verificarDisponibilidade(pedido.saborId, pedido.quantidade)) {
            this.addNotificacao(`Estoque insuficiente para ${pedido.saborNome}!`, 'error');
            return false;
        }
        
        const novoPedido = {
            id: this.getNextPedidoId(),
            ...pedido,
            status: 'pendente',
            data: new Date().toISOString()
        };
        
        this.pedidos.push(novoPedido);
        this.addNotificacao(`Novo pedido de ${pedido.cliente}: ${pedido.quantidade}x ${pedido.saborNome}`, 'info');
        this.saveToLocalStorage();
        return true;
    },
    
    // Concluir pedido (entregar)
    concluirPedido(pedidoId) {
        const index = this.pedidos.findIndex(p => p.id === pedidoId);
        if (index === -1) return false;
        
        const pedido = this.pedidos[index];
        
        // Verificar estoque novamente
        if (!this.verificarDisponibilidade(pedido.saborId, pedido.quantidade)) {
            this.addNotificacao(`Estoque insuficiente para entregar ${pedido.saborNome}!`, 'error');
            return false;
        }
        
        // Dar baixa no estoque
        const sabor = this.getSaborById(pedido.saborId);
        sabor.quantidade -= pedido.quantidade;
        
        // Mover para histórico
        pedido.status = 'entregue';
        pedido.entregueEm = new Date().toISOString();
        this.historicoPedidos.push(pedido);
        this.pedidos.splice(index, 1);
        
        this.addNotificacao(`Pedido de ${pedido.cliente} foi entregue! ✅`, 'success');
        this.saveToLocalStorage();
        return true;
    },
    
    // Cancelar pedido
    cancelarPedido(pedidoId) {
        const index = this.pedidos.findIndex(p => p.id === pedidoId);
        if (index === -1) return false;
        
        const pedido = this.pedidos[index];
        pedido.status = 'cancelado';
        pedido.canceladoEm = new Date().toISOString();
        this.historicoPedidos.push(pedido);
        this.pedidos.splice(index, 1);
        
        this.addNotificacao(`Pedido de ${pedido.cliente} foi cancelado ❌`, 'warning');
        this.saveToLocalStorage();
        return true;
    },
    
    // Editar pedido
    editarPedido(pedidoId, novoSaborId, novaQuantidade) {
        const pedido = this.pedidos.find(p => p.id === pedidoId);
        if (!pedido) return false;
        
        const novoSabor = this.getSaborById(novoSaborId);
        if (!novoSabor) return false;
        
        // Verificar estoque para a nova quantidade
        if (!this.verificarDisponibilidade(novoSaborId, novaQuantidade)) {
            this.addNotificacao(`Estoque insuficiente para ${novaQuantidade}x ${novoSabor.nome}`, 'error');
            return false;
        }
        
        pedido.saborId = novoSaborId;
        pedido.saborNome = novoSabor.nome;
        pedido.quantidade = novaQuantidade;
        
        this.addNotificacao(`Pedido de ${pedido.cliente} foi editado`, 'info');
        this.saveToLocalStorage();
        return true;
    },
    
    // Adicionar notificação
    addNotificacao(mensagem, tipo = 'info') {
        this.notificacoes.unshift({
            id: Date.now(),
            mensagem,
            tipo,
            data: new Date().toISOString(),
            lida: false
        });
        
        // Manter apenas últimas 50 notificações
        if (this.notificacoes.length > 50) {
            this.notificacoes = this.notificacoes.slice(0, 50);
        }
        
        this.saveToLocalStorage();
    },
    
    // Buscar notificações não lidas
    getNotificacoesNaoLidas() {
        return this.notificacoes.filter(n => !n.lida);
    },
    
    // Marcar notificações como lidas
    marcarNotificacoesComoLidas() {
        this.notificacoes.forEach(n => n.lida = true);
        this.saveToLocalStorage();
    },
    
    // Marcar notificação específica como lida
    marcarNotificacaoComoLida(id) {
        const notif = this.notificacoes.find(n => n.id === id);
        if (notif) {
            notif.lida = true;
            this.saveToLocalStorage();
        }
    },
    
    // Encerrar expediente
    encerrarExpediente() {
        const resumo = {
            data: new Date().toISOString(),
            pedidosEntregues: this.historicoPedidos.filter(p => p.status === 'entregue').length,
            pedidosCancelados: this.pedidos.filter(p => p.status === 'pendente').length,
            totalEsfirrasVendidas: 0,
            vendasPorSabor: {},
            faturamentoTotal: 0
        };
        
        // Calcular estatísticas
        this.historicoPedidos.forEach(pedido => {
            if (pedido.status === 'entregue') {
                resumo.totalEsfirrasVendidas += pedido.quantidade;
                resumo.faturamentoTotal += pedido.quantidade * this.config.precoUnitario;
                
                if (!resumo.vendasPorSabor[pedido.saborNome]) {
                    resumo.vendasPorSabor[pedido.saborNome] = 0;
                }
                resumo.vendasPorSabor[pedido.saborNome] += pedido.quantidade;
            }
        });
        
        // Cancelar pedidos pendentes
        const pedidosPendentes = [...this.pedidos];
        pedidosPendentes.forEach(pedido => {
            this.cancelarPedido(pedido.id);
        });
        
        this.config.expedienteAberto = false;
        this.config.ultimoFechamento = new Date().toISOString();
        
        this.addNotificacao(`Expediente encerrado! Total de vendas: ${resumo.totalEsfirrasVendidas} esfirras`, 'success');
        this.saveToLocalStorage();
        
        return resumo;
    },
    
    // Abrir expediente (novo dia)
    abrirExpediente() {
        this.config.expedienteAberto = true;
        this.addNotificacao('Novo expediente iniciado!', 'success');
        this.saveToLocalStorage();
    },
    
    // Resetar sistema
    resetarSistema() {
        // Manter estrutura mas limpar dados
        this.pedidos = [];
        this.historicoPedidos = [];
        this.notificacoes = [];
        
        // Resetar estoque
        this.sabores.forEach(sabor => {
            sabor.quantidade = 50;
        });
        
        this.config.expedienteAberto = true;
        this.config.ultimoFechamento = null;
        
        this.addNotificacao('Sistema resetado!', 'info');
        this.saveToLocalStorage();
    },
    
    // ===== FUNÇÕES AUXILIARES =====
    
    // Gerar próximo ID de pedido
    getNextPedidoId() {
        const allPedidos = [...this.pedidos, ...this.historicoPedidos];
        return allPedidos.length > 0 ? Math.max(...allPedidos.map(p => p.id)) + 1 : 1;
    },
    
    // Buscar pedidos por cliente
    getPedidosByCliente(cliente) {
        return this.pedidos.filter(p => p.cliente === cliente);
    },
    
    // Buscar histórico por cliente
    getHistoricoByCliente(cliente) {
        return this.historicoPedidos.filter(p => p.cliente === cliente);
    },
    
    // Buscar todos os pedidos (ativos + histórico)
    getAllPedidos() {
        return [...this.pedidos, ...this.historicoPedidos];
    },
    
    // Gerar relatório completo
    getRelatorioCompleto() {
        const hoje = new Date().toLocaleDateString('pt-BR');
        const pedidosHoje = this.getAllPedidos().filter(p => {
            const dataPedido = new Date(p.data).toLocaleDateString('pt-BR');
            return dataPedido === hoje;
        });
        
        const entregues = pedidosHoje.filter(p => p.status === 'entregue');
        const cancelados = pedidosHoje.filter(p => p.status === 'cancelado');
        const pendentes = pedidosHoje.filter(p => p.status === 'pendente');
        
        return {
            data: hoje,
            totalPedidos: pedidosHoje.length,
            entregues: entregues.length,
            cancelados: cancelados.length,
            pendentes: pendentes.length,
            totalEsfirras: entregues.reduce((sum, p) => sum + p.quantidade, 0),
            faturamento: entregues.reduce((sum, p) => sum + (p.quantidade * this.config.precoUnitario), 0),
            pedicosPorSabor: this.getVendasPorSabor()
        };
    },
    
    // Calcular vendas por sabor
    getVendasPorSabor() {
        const vendas = {};
        this.historicoPedidos.forEach(pedido => {
            if (pedido.status === 'entregue') {
                if (!vendas[pedido.saborNome]) vendas[pedido.saborNome] = 0;
                vendas[pedido.saborNome] += pedido.quantidade;
            }
        });
        return vendas;
    },
    
    // ===== PERSISTÊNCIA =====
    
    // Salvar no localStorage
    saveToLocalStorage() {
        const dataToSave = {
            sabores: this.sabores,
            pedidos: this.pedidos,
            historicoPedidos: this.historicoPedidos,
            notificacoes: this.notificacoes,
            config: this.config
        };
        localStorage.setItem('bfBitesData', JSON.stringify(dataToSave));
    },
    
    // Carregar do localStorage
    loadFromLocalStorage() {
        const savedData = localStorage.getItem('bfBitesData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.sabores = data.sabores;
                this.pedidos = data.pedidos;
                this.historicoPedidos = data.historicoPedidos;
                this.notificacoes = data.notificacoes;
                this.config = data.config || this.config;
            } catch (e) {
                console.error('Erro ao carregar dados:', e);
            }
        }
    }
};

// Inicializar dados
db.loadFromLocalStorage();

// Salvar automaticamente a cada 10 segundos
setInterval(() => {
    db.saveToLocalStorage();
}, 10000);

// Exportar para uso global
window.db = db;

console.log('✅ Banco de dados inicializado!', db);
