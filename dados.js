// ============================================
// BF BITES - BANCO DE DADOS MOCKADO
// ============================================

const db = {
    sabores: [
        { id: 1, nome: 'Frango com catupiry', icone: '🧀', quantidade: 50, preco: 5.00 },
        { id: 2, nome: 'Calabresa', icone: '🌶️', quantidade: 50, preco: 5.00 },
        { id: 3, nome: 'Carne moída', icone: '🥩', quantidade: 50, preco: 5.00 },
        { id: 4, nome: 'Presunto e queijo', icone: '🧀', quantidade: 50, preco: 5.00 }
    ],
    
    pedidos: [],
    historicoPedidos: [],
    notificacoes: [],
    
    config: { precoUnitario: 5.00, expedienteAberto: true },
    
    getSaborById(id) { return this.sabores.find(s => s.id === id); },
    
    updateEstoque(saborId, quantidade) {
        const sabor = this.getSaborById(saborId);
        if (sabor) { sabor.quantidade += quantidade; this.addNotificacao(`Estoque de ${sabor.nome} atualizado: +${quantidade}`, 'success'); this.save(); return true; }
        return false;
    },
    
    addPedido(pedido) {
        const sabor = this.getSaborById(pedido.saborId);
        if (!sabor || sabor.quantidade < pedido.quantidade) return false;
        this.pedidos.push(pedido);
        this.addNotificacao(`Novo pedido: ${pedido.quantidade}x ${pedido.saborNome}`, 'info');
        this.save();
        return true;
    },
    
    concluirPedido(pedidoId) {
        const index = this.pedidos.findIndex(p => p.id === pedidoId);
        if (index === -1) return false;
        const pedido = this.pedidos[index];
        const sabor = this.getSaborById(pedido.saborId);
        if (!sabor || sabor.quantidade < pedido.quantidade) return false;
        sabor.quantidade -= pedido.quantidade;
        pedido.status = 'entregue';
        pedido.entregueEm = new Date().toISOString();
        this.historicoPedidos.push(pedido);
        this.pedidos.splice(index, 1);
        this.addNotificacao(`Pedido de ${pedido.cliente} entregue! ✅`, 'success');
        this.save();
        return true;
    },
    
    cancelarPedido(pedidoId) {
        const index = this.pedidos.findIndex(p => p.id === pedidoId);
        if (index === -1) return false;
        const pedido = this.pedidos[index];
        pedido.status = 'cancelado';
        this.historicoPedidos.push(pedido);
        this.pedidos.splice(index, 1);
        this.addNotificacao(`Pedido de ${pedido.cliente} cancelado ❌`, 'warning');
        this.save();
        return true;
    },
    
    addNotificacao(mensagem, tipo = 'info') {
        this.notificacoes.unshift({ id: Date.now(), mensagem, tipo, data: new Date().toISOString(), lida: false });
        if (this.notificacoes.length > 50) this.notificacoes = this.notificacoes.slice(0, 50);
        this.save();
    },
    
    getNotificacoesNaoLidas() { return this.notificacoes.filter(n => !n.lida); },
    marcarNotificacoesComoLidas() { this.notificacoes.forEach(n => n.lida = true); this.save(); },
    
    save() { localStorage.setItem('bfBitesData', JSON.stringify({ sabores: this.sabores, pedidos: this.pedidos, historicoPedidos: this.historicoPedidos, notificacoes: this.notificacoes, config: this.config })); },
    
    load() {
        const saved = localStorage.getItem('bfBitesData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.sabores = data.sabores;
                this.pedidos = data.pedidos;
                this.historicoPedidos = data.historicoPedidos;
                this.notificacoes = data.notificacoes;
                this.config = data.config;
            } catch(e) {}
        }
    },
    
    encerrarExpediente() {
        const pendentes = [...this.pedidos];
        pendentes.forEach(p => this.cancelarPedido(p.id));
        this.config.expedienteAberto = false;
        this.save();
        return { pedidosEntregues: this.historicoPedidos.filter(p => p.status === 'entregue').length };
    }
};

db.load();
window.db = db;
