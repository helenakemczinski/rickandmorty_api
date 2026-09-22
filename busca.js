const API_URL = "https://rickandmortyapi.com/api";

const campoBusca = document.getElementById("campo-busca");
const botaoBusca = document.getElementById("botao-busca");
const mensagemErro = document.getElementById("mensagem-erro");
const resultados = document.getElementById("resultados");

function mostrarErro(texto) {
    mensagemErro.textContent = texto;
    mensagemErro.hidden = false;
}

function esconderErro() {
    mensagemErro.textContent = "";
    mensagemErro.hidden = true;
}

function linkDoPersonagem(id) {
    return `personagem.html?id=${id}`;
}

function mostrarResultados(personagens, total, digitado) {
    const titulo = document.getElementById("resultados-titulo");
    const lista = document.getElementById("lista-resultados");

    lista.innerHTML = "";
    titulo.textContent = total > personagens.length
        ? `Mostrando ${personagens.length} de ${total} resultados para "${digitado}"`
        : `${total} resultados para "${digitado}"`;

    personagens.forEach((personagem) => {
        const item = document.createElement("li");

        const link = document.createElement("a");
        link.classList.add("resultado", `status-${personagem.status.toLowerCase()}`);
        link.href = linkDoPersonagem(personagem.id);

        const foto = document.createElement("img");
        foto.src = personagem.image;
        foto.alt = "";
        foto.loading = "lazy";

        const nome = document.createElement("span");
        nome.classList.add("resultado-nome");
        nome.textContent = personagem.name;

        const especie = document.createElement("span");
        especie.classList.add("resultado-especie");
        especie.textContent = personagem.species;

        link.append(foto, nome, especie);
        item.appendChild(link);
        lista.appendChild(item);
    });

    resultados.hidden = false;
}

async function buscarPersonagem() {
    const digitado = campoBusca.value.trim();

    if (digitado === "") {
        mostrarErro("Digite o nome ou o número de um personagem.");
        campoBusca.focus();
        return;
    }

    esconderErro();

    if (/^\d+$/.test(digitado)) {
        window.location.href = linkDoPersonagem(Number(digitado));
        return;
    }

    botaoBusca.disabled = true;

    try {
        const resposta = await fetch(`${API_URL}/character/?name=${encodeURIComponent(digitado)}`);

        if (resposta.status === 404) {
            if (resultados) {
                resultados.hidden = true;
            }
            mostrarErro(`Nenhum personagem encontrado para "${digitado}".`);
            return;
        }

        if (!resposta.ok) {
            throw new Error(`Erro ${resposta.status}`);
        }

        const dados = await resposta.json();

        if (dados.results.length === 1 || !resultados) {
            window.location.href = linkDoPersonagem(dados.results[0].id);
            return;
        }

        mostrarResultados(dados.results, dados.info.count, digitado);
    } catch (erro) {
        mostrarErro("Não foi possível falar com a Rick and Morty API. Confira sua internet e tente de novo.");
    } finally {
        botaoBusca.disabled = false;
    }
}

botaoBusca.addEventListener("click", buscarPersonagem);

campoBusca.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        buscarPersonagem();
    }
});

document.querySelectorAll(".sugestao").forEach((botao) => {
    botao.addEventListener("click", () => {
        campoBusca.value = botao.dataset.busca;
        buscarPersonagem();
    });
});
