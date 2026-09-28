const campoBusca = document.getElementById("campo-busca");
const botaoBusca = document.getElementById("botao-busca");
const mensagemErro = document.getElementById("mensagem-erro");
const resultados = document.getElementById("resultados");

// Mostra a mensagem de erro abaixo do campo de busca.
function mostrarErro(texto) {
    mensagemErro.textContent = texto;
    mensagemErro.hidden = false;
}

// Limpa e esconde a mensagem de erro.
function esconderErro() {
    mensagemErro.textContent = "";
    mensagemErro.hidden = true;
}

// Esconde a lista de resultados.
// So a index.html tem essa secao, entao na personagem.html nao ha o que esconder.
function esconderResultados() {
    if (!resultados) {
        return;
    }

    resultados.hidden = true;
}

// Monta o endereco da ficha de um personagem.
function linkDoPersonagem(id) {
    return `personagem.html?id=${id}`;
}

// Escolhe o texto do erro conforme a falha: nome inexistente ou API fora do ar.
// Reconhece PersonagemNaoEncontrado (rickandmorty.js).
function textoDaFalha(erro, digitado) {
    if (erro instanceof PersonagemNaoEncontrado) {
        return `Nenhum personagem encontrado para "${digitado}".`;
    }

    return "Não foi possível falar com a Rick and Morty API. Confira sua internet e tente de novo.";
}

// Escreve quantos resultados apareceram de quantos existem no total.
function tituloDosResultados(mostrados, total, digitado) {
    if (total > mostrados) {
        return `Mostrando ${mostrados} de ${total} resultados para "${digitado}"`;
    }

    return `${total} resultados para "${digitado}"`;
}

// Monta um item da lista de resultados: foto, nome e especie, tudo dentro do link.
// Usa criarElemento (dom.js) e linkDoPersonagem (deste arquivo).
function criarCartaoDeResultado(personagem) {
    const item = criarElemento("li", "");
    const link = criarElemento("a", `resultado status-${personagem.status.toLowerCase()}`);
    const foto = criarElemento("img", "");

    link.href = linkDoPersonagem(personagem.id);
    foto.src = personagem.image;
    foto.alt = "";
    foto.loading = "lazy";

    link.append(
        foto,
        criarElemento("span", "resultado-nome", personagem.name),
        criarElemento("span", "resultado-especie", personagem.species)
    );
    item.appendChild(link);

    return item;
}

// Preenche a lista de resultados na tela e a revela.
// Usa tituloDosResultados e criarCartaoDeResultado (deste arquivo).
function mostrarResultados(personagens, total, digitado) {
    const titulo = document.getElementById("resultados-titulo");
    const lista = document.getElementById("lista-resultados");

    lista.innerHTML = "";
    titulo.textContent = tituloDosResultados(personagens.length, total, digitado);

    personagens.forEach((personagem) => {
        lista.appendChild(criarCartaoDeResultado(personagem));
    });

    resultados.hidden = false;
}

// Busca pelo nome e decide o que fazer com a resposta: com um unico resultado
// abre a ficha direto, com varios lista na tela.
// Na personagem.html nao existe lista, entao sempre abre a ficha do primeiro.
// Usa buscarPersonagensPorNome (rickandmorty.js).
async function listarPersonagensComNome(digitado) {
    botaoBusca.disabled = true;

    try {
        const encontrados = await buscarPersonagensPorNome(digitado);
        const abrirFichaDireto = encontrados.results.length === 1 || !resultados;

        if (abrirFichaDireto) {
            window.location.href = linkDoPersonagem(encontrados.results[0].id);
            return;
        }

        mostrarResultados(encontrados.results, encontrados.info.count, digitado);
    } catch (erro) {
        if (erro instanceof PersonagemNaoEncontrado) {
            esconderResultados();
        }

        mostrarErro(textoDaFalha(erro, digitado));
    } finally {
        botaoBusca.disabled = false;
    }
}

// Le o campo de busca e decide o caminho: numero vai direto para a ficha,
// nome passa pela API.
// Usa listarPersonagensComNome e linkDoPersonagem (deste arquivo).
async function buscarPersonagemDigitado() {
    const digitado = campoBusca.value.trim();

    if (digitado === "") {
        mostrarErro("Digite o nome ou o número de um personagem.");
        campoBusca.focus();
        return;
    }

    esconderErro();

    const buscaPorNumero = /^\d+$/.test(digitado);

    if (buscaPorNumero) {
        window.location.href = linkDoPersonagem(Number(digitado));
        return;
    }

    await listarPersonagensComNome(digitado);
}

botaoBusca.addEventListener("click", buscarPersonagemDigitado);

campoBusca.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        buscarPersonagemDigitado();
    }
});

document.querySelectorAll(".sugestao").forEach((botao) => {
    botao.addEventListener("click", () => {
        campoBusca.value = botao.dataset.busca;
        buscarPersonagemDigitado();
    });
});
