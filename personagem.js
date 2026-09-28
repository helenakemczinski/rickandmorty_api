const MAXIMO_DE_EPISODIOS = 12;

const NOMES_DOS_STATUS = {
    alive: "Vivo",
    dead: "Morto",
    unknown: "Desconhecido"
};

const NOMES_DOS_GENEROS = {
    female: "Feminino",
    male: "Masculino",
    genderless: "Sem gênero",
    unknown: "Gênero desconhecido"
};

const carregando = document.getElementById("carregando");
const aviso = document.getElementById("aviso");
const avisoTexto = document.getElementById("aviso-texto");
const ficha = document.getElementById("ficha");

function mostrarAviso(texto) {
    carregando.hidden = true;
    ficha.hidden = true;
    avisoTexto.textContent = texto;
    aviso.hidden = false;
}

function mostrarFicha() {
    carregando.hidden = true;
    ficha.hidden = false;
}

function formatarNumeroDoPersonagem(numero) {
    return `Nº ${String(numero).padStart(3, "0")}`;
}

function formatarData(dataIso) {
    const data = new Date(dataIso);

    if (Number.isNaN(data.getTime())) {
        return dataIso;
    }

    return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function idNoFinalDaUrl(url) {
    return url.split("/").pop();
}

function idsDosPrimeirosEpisodios(urls) {
    return urls.slice(0, MAXIMO_DE_EPISODIOS).map(idNoFinalDaUrl);
}

function preencherIdentidade(personagem) {
    const foto = document.getElementById("foto");

    foto.src = personagem.image;
    foto.alt = `Retrato de ${personagem.name}`;

    document.title = `${personagem.name} | Multiverso`;
    document.getElementById("numero").textContent = formatarNumeroDoPersonagem(personagem.id);
    document.getElementById("nome").textContent = personagem.name;
    document.getElementById("especie").textContent = personagem.type
        ? `${personagem.species} · ${personagem.type}`
        : personagem.species;
}

function preencherEtiquetas(personagem) {
    const status = personagem.status.toLowerCase();
    const genero = personagem.gender.toLowerCase();

    document.getElementById("status").textContent = NOMES_DOS_STATUS[status] ?? personagem.status;
    document.getElementById("genero").textContent = NOMES_DOS_GENEROS[genero] ?? personagem.gender;
}

function aplicarTemaDoStatus(status) {
    document.body.classList.add(`tema-${status}`);
}

function preencherLugares(personagem) {
    document.getElementById("origem").textContent = personagem.origin.name === "unknown" ? "—" : personagem.origin.name;
    document.getElementById("local").textContent = personagem.location.name === "unknown" ? "—" : personagem.location.name;
    document.getElementById("total-episodios").textContent = personagem.episode.length;
}

function criarLinhaDeEpisodio(episodio) {
    const linha = criarElemento("li", "episodio");

    linha.append(
        criarElemento("span", "episodio-codigo", episodio.episode),
        criarElemento("span", "episodio-nome", episodio.name),
        criarElemento("span", "episodio-data", formatarData(episodio.air_date))
    );

    return linha;
}

function preencherEpisodios(episodios, total) {
    const listaEpisodios = document.getElementById("episodios");

    if (!episodios) {
        listaEpisodios.appendChild(criarElemento("li", "episodio-vazio", "Episódios indisponíveis no momento."));
        return;
    }

    episodios.forEach((episodio) => {
        listaEpisodios.appendChild(criarLinhaDeEpisodio(episodio));
    });

    const episodiosDeFora = total - episodios.length;

    if (episodiosDeFora > 0) {
        listaEpisodios.appendChild(criarElemento("li", "episodio-vazio", `e mais ${episodiosDeFora} episódio(s)`));
    }
}

function preencherFicha(personagem, episodios) {
    preencherIdentidade(personagem);
    preencherEtiquetas(personagem);
    aplicarTemaDoStatus(personagem.status.toLowerCase());
    preencherLugares(personagem);
    preencherEpisodios(episodios, personagem.episode.length);
}

function idDaPagina() {
    return new URLSearchParams(window.location.search).get("id");
}

async function carregarPersonagem() {
    const id = idDaPagina();

    if (!id) {
        mostrarAviso("Nenhum personagem foi informado. Volte e faça uma busca.");
        return;
    }

    try {
        const personagem = await buscarPersonagemPorId(id);
        const episodios = await buscarEpisodios(idsDosPrimeirosEpisodios(personagem.episode));

        preencherFicha(personagem, episodios);
        mostrarFicha();
    } catch (erro) {
        if (erro instanceof PersonagemNaoEncontrado) {
            mostrarAviso(`Não existe personagem com o número "${id}".`);
        } else {
            mostrarAviso("Não foi possível carregar os dados da Rick and Morty API. Confira sua internet e tente de novo.");
        }
    }
}

carregarPersonagem();
