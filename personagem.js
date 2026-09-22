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

function formatarNumero(id) {
    return `Nº ${String(id).padStart(3, "0")}`;
}

function formatarData(texto) {
    const data = new Date(texto);

    if (Number.isNaN(data.getTime())) {
        return texto;
    }

    return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function idDaUrl(url) {
    return url.split("/").pop();
}

async function buscarEpisodios(urls) {
    const ids = urls.slice(0, MAXIMO_DE_EPISODIOS).map(idDaUrl);

    if (ids.length === 0) {
        return [];
    }

    try {
        const resposta = await fetch(`${API_URL}/episode/${ids.join(",")}`);

        if (!resposta.ok) {
            return null;
        }

        const dados = await resposta.json();

        // Com um id só a API devolve um objeto, com vários devolve uma lista
        return Array.isArray(dados) ? dados : [dados];
    } catch (erro) {
        return null;
    }
}

function preencherIdentidade(personagem) {
    const foto = document.getElementById("foto");

    foto.src = personagem.image;
    foto.alt = `Retrato de ${personagem.name}`;

    document.title = `${personagem.name} | Multiverso`;
    document.getElementById("numero").textContent = formatarNumero(personagem.id);
    document.getElementById("nome").textContent = personagem.name;
    document.getElementById("especie").textContent = personagem.type
        ? `${personagem.species} · ${personagem.type}`
        : personagem.species;
}

function preencherEtiquetas(personagem) {
    const status = personagem.status.toLowerCase();

    document.getElementById("status").textContent = NOMES_DOS_STATUS[status] ?? personagem.status;
    document.getElementById("genero").textContent = NOMES_DOS_GENEROS[personagem.gender.toLowerCase()] ?? personagem.gender;

    document.body.classList.add(`tema-${status}`);
}

function preencherLugares(personagem) {
    document.getElementById("origem").textContent = personagem.origin.name === "unknown" ? "—" : personagem.origin.name;
    document.getElementById("local").textContent = personagem.location.name === "unknown" ? "—" : personagem.location.name;
    document.getElementById("total-episodios").textContent = personagem.episode.length;
}

function preencherEpisodios(episodios, total) {
    const lista = document.getElementById("episodios");

    if (!episodios) {
        const item = document.createElement("li");
        item.classList.add("episodio-vazio");
        item.textContent = "Episódios indisponíveis no momento.";
        lista.appendChild(item);
        return;
    }

    episodios.forEach((episodio) => {
        const item = document.createElement("li");
        item.classList.add("episodio");

        const codigo = document.createElement("span");
        codigo.classList.add("episodio-codigo");
        codigo.textContent = episodio.episode;

        const nome = document.createElement("span");
        nome.classList.add("episodio-nome");
        nome.textContent = episodio.name;

        const data = document.createElement("span");
        data.classList.add("episodio-data");
        data.textContent = formatarData(episodio.air_date);

        item.append(codigo, nome, data);
        lista.appendChild(item);
    });

    if (total > episodios.length) {
        const resto = document.createElement("li");
        resto.classList.add("episodio-vazio");
        resto.textContent = `e mais ${total - episodios.length} episódio(s)`;
        lista.appendChild(resto);
    }
}

async function carregarPersonagem() {
    const id = new URLSearchParams(window.location.search).get("id");

    if (!id) {
        mostrarAviso("Nenhum personagem foi informado. Volte e faça uma busca.");
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/character/${encodeURIComponent(id)}`);

        if (resposta.status === 404) {
            mostrarAviso(`Não existe personagem com o número "${id}".`);
            return;
        }

        if (!resposta.ok) {
            throw new Error(`Erro ${resposta.status}`);
        }

        const personagem = await resposta.json();
        const episodios = await buscarEpisodios(personagem.episode);

        preencherIdentidade(personagem);
        preencherEtiquetas(personagem);
        preencherLugares(personagem);
        preencherEpisodios(episodios, personagem.episode.length);

        carregando.hidden = true;
        ficha.hidden = false;
    } catch (erro) {
        mostrarAviso("Não foi possível carregar os dados da Rick and Morty API. Confira sua internet e tente de novo.");
    }
}

carregarPersonagem();
