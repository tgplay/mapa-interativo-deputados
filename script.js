// Dados de cada deputado (cada um com seus próprios municípios e valores)
const deputados = {
    carlos: {
        nome: "Carlos Silva (PT)",
        cor: "#2d5a3b",
        municipios: {
            "Maceió": {
                coordenadas: [-9.665, -35.735],
                recursos: [
                    { titulo: "Aquisição de Trator com grade aradora", valor: 267990, beneficiario: "Associação Sítio Serra do Pau Ferro", situacao: "Documentação enviada" },
                    { titulo: "Custeio de Serviços de Saúde", valor: 180000, beneficiario: "Prefeitura de Maceió", situacao: "Em execução" }
                ]
            },
            "Rio Largo": {
                coordenadas: [-9.462, -35.853],
                recursos: [
                    { titulo: "Kit Beneficiamento de Frutos", valor: 76900, beneficiario: "Associação Comunitária Sítio Lages", situacao: "Aguardando formalização" }
                ]
            }
        }
    },
    maria: {
        nome: "Maria Oliveira (PSDB)",
        cor: "#2874A6",
        municipios: {
            "Arapiraca": {
                coordenadas: [-9.754, -36.661],
                recursos: [
                    { titulo: "Kit Panificação", valor: 22000, beneficiario: "Ong Filhos do Patacho", situacao: "Pago" },
                    { titulo: "Equipamentos Hospitalares", valor: 250000, beneficiario: "Santa Casa de Arapiraca", situacao: "Em execução" }
                ]
            },
            "Palmeira dos Índios": {
                coordenadas: [-9.414, -36.629],
                recursos: [
                    { titulo: "Infraestrutura Urbana", valor: 450000, beneficiario: "Prefeitura Municipal", situacao: "Em licitação" }
                ]
            }
        }
    },
    jose: {
        nome: "José Santos (PL)",
        cor: "#E67E22",
        municipios: {
            "Viçosa": {
                coordenadas: [-9.368, -36.241],
                recursos: [
                    { titulo: "Pá Carregadeira", valor: 346713.50, beneficiario: "Prefeitura de Viçosa", situacao: "Entregue" }
                ]
            },
            "Paulo Jacinto": {
                coordenadas: [-9.367, -36.367],
                recursos: [
                    { titulo: "Custeio da Educação", valor: 200000, beneficiario: "Secretaria de Educação", situacao: "Pago" }
                ]
            }
        }
    },
    ana: {
        nome: "Ana Souza (PSD)",
        cor: "#8E44AD",
        municipios: {
            "Maceió": {
                coordenadas: [-9.665, -35.735],
                recursos: [
                    { titulo: "Projeto de Saneamento Básico", valor: 520000, beneficiario: "Casal", situacao: "Em licitação" }
                ]
            },
            "Arapiraca": {
                coordenadas: [-9.754, -36.661],
                recursos: [
                    { titulo: "Feira do Agricultor", valor: 95000, beneficiario: "Sindicato Rural", situacao: "Documentação enviada" }
                ]
            },
            "Palmeira dos Índios": {
                coordenadas: [-9.414, -36.629],
                recursos: [
                    { titulo: "Programa de Habitação", valor: 890000, beneficiario: "CDHU", situacao: "Em andamento" }
                ]
            }
        }
    }
};

let mapa;
let marcadores = [];
let deputadoAtual = "carlos";
let todosRecursos = [];

// Inicializar mapa
function initMap() {
    mapa = L.map('mapa').setView([-9.5, -36.5], 8);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> & CartoDB',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(mapa);

    carregarDeputado(deputadoAtual);
}

// Carregar dados do deputado selecionado
function carregarDeputado(deputadoId) {
    // Limpar marcadores existentes
    marcadores.forEach(m => mapa.removeLayer(m));
    marcadores = [];

    const deputado = deputados[deputadoId];
    if (!deputado) return;

    let totalGeral = 0;
    let qtdMunicipios = 0;
    let qtdProjetos = 0;

    // Adicionar marcadores para cada município
    for (let municipio in deputado.municipios) {
        const dados = deputado.municipios[municipio];
        const totalMunicipio = dados.recursos.reduce((sum, r) => sum + r.valor, 0);
        totalGeral += totalMunicipio;
        qtdMunicipios++;
        qtdProjetos += dados.recursos.length;

        // Criar marcador customizado
        const marcador = L.circleMarker(dados.coordenadas, {
            radius: Math.min(18, 12 + (totalMunicipio / 100000)),
            fillColor: deputado.cor,
            color: "#FFD700",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.75
        }).addTo(mapa);

        marcador.bindPopup(`
            <strong>${municipio}</strong><br>
            <strong>Total:</strong> ${formatarMoeda(totalMunicipio)}<br>
            <strong>Projetos:</strong> ${dados.recursos.length}<br>
            <em>Clique para detalhes</em>
        `);

        marcador.on('click', () => {
            mostrarInfoMunicipio(municipio, deputadoId);
            mapa.setView(dados.coordenadas, 10);
        });

        marcadores.push(marcador);
    }

    // Atualizar cards
    document.getElementById('total-municipios').innerHTML = qtdMunicipios;
    document.getElementById('total-geral').innerHTML = formatarMoeda(totalGeral);
    document.getElementById('total-projetos').innerHTML = qtdProjetos;

    // Atualizar lista de recursos
    carregarListaRecursos(deputadoId);
}

// Mostrar informações do município no painel
function mostrarInfoMunicipio(municipio, deputadoId) {
    const deputado = deputados[deputadoId];
    const dados = deputado.municipios[municipio];
    if (!dados) return;

    const totalMunicipio = dados.recursos.reduce((sum, r) => sum + r.valor, 0);
    const panel = document.getElementById('info-content');

    let html = `<div class="info-card">
        <h3><i class="fas fa-city"></i> ${municipio}</h3>
        <div class="total-municipio">
            <i class="fas fa-chart-line"></i> Total destinado: ${formatarMoeda(totalMunicipio)}
        </div>`;

    dados.recursos.forEach(recurso => {
        html += `
            <div class="recurso-detalhe">
                <div class="titulo"><i class="fas fa-file-alt"></i> ${recurso.titulo}</div>
                <div class="valor"><i class="fas fa-dollar-sign"></i> ${formatarMoeda(recurso.valor)}</div>
                <div class="beneficiario"><i class="fas fa-building"></i> ${recurso.beneficiario}</div>
                <div class="situacao"><i class="fas fa-chart-simple"></i> ${recurso.situacao}</div>
            </div>
        `;
    });

    html += `</div>`;
    panel.innerHTML = html;
}

// Carregar lista de recursos
function carregarListaRecursos(deputadoId) {
    const deputado = deputados[deputadoId];
    const container = document.getElementById('lista-recursos');
    container.innerHTML = '';
    todosRecursos = [];

    for (let municipio in deputado.municipios) {
        deputado.municipios[municipio].recursos.forEach(recurso => {
            todosRecursos.push({
                municipio: municipio,
                ...recurso,
                valorFormatado: formatarMoeda(recurso.valor)
            });
        });
    }

    exibirRecursos(todosRecursos);
}

// Exibir recursos na lista
function exibirRecursos(recursos) {
    const container = document.getElementById('lista-recursos');
    container.innerHTML = '';

    if (recursos.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Nenhum recurso encontrado</div>';
        return;
    }

    recursos.forEach(recurso => {
        const div = document.createElement('div');
        div.className = 'recurso-item';
        div.onclick = () => {
            mostrarInfoMunicipio(recurso.municipio, deputadoAtual);
            const coords = deputados[deputadoAtual].municipios[recurso.municipio].coordenadas;
            mapa.setView(coords, 12);
        };
        div.innerHTML = `
            <h3><i class="fas fa-map-pin"></i> ${recurso.municipio}</h3>
            <div class="valor-recurso"><i class="fas fa-dollar-sign"></i> ${recurso.valorFormatado}</div>
            <div class="beneficiario-recurso"><i class="fas fa-building"></i> ${recurso.beneficiario}</div>
            <div class="situacao-recurso"><i class="fas fa-chart-simple"></i> ${recurso.situacao}</div>
            <small style="display:block; margin-top:8px; color:#888;"><i class="fas fa-tag"></i> ${recurso.titulo}</small>
        `;
        container.appendChild(div);
    });
}

// Filtrar recursos
function filtrarRecursos() {
    const termo = document.getElementById('search-input').value.toLowerCase();
    const situacaoFiltro = document.getElementById('filtro-situacao').value;

    const filtrados = todosRecursos.filter(recurso => {
        const matchTexto = recurso.municipio.toLowerCase().includes(termo) ||
            recurso.titulo.toLowerCase().includes(termo) ||
            recurso.beneficiario.toLowerCase().includes(termo);

        const matchSituacao = !situacaoFiltro || recurso.situacao === situacaoFiltro;

        return matchTexto && matchSituacao;
    });

    exibirRecursos(filtrados);
}

// Limpar filtros
function limparFiltros() {
    document.getElementById('search-input').value = '';
    document.getElementById('filtro-situacao').value = '';
    exibirRecursos(todosRecursos);
}

// Formatar moeda
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
}

// Evento de troca de deputado
document.getElementById('select-deputado').addEventListener('change', (e) => {
    deputadoAtual = e.target.value;
    carregarDeputado(deputadoAtual);

    // Limpar painel
    document.getElementById('info-content').innerHTML = `
        <div class="placeholder">
            <i class="fas fa-hand-pointer"></i><br>
            Clique em qualquer município<br>
            para visualizar os recursos
        </div>
    `;
});

// Eventos de filtro
document.getElementById('search-input').addEventListener('keyup', filtrarRecursos);
document.getElementById('filtro-situacao').addEventListener('change', filtrarRecursos);
document.getElementById('btn-limpar').addEventListener('click', limparFiltros);

// Inicializar
window.onload = initMap;