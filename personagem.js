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

// Troca a ficha pelo aviso de erro na tela.
function mostrarAviso(texto) {
    carregando.hidden = true;
    ficha.hidden = true;
    avisoTexto.textContent = texto;
    aviso.hidden = false;
}

// Troca o "Abrindo portal..." pela ficha ja preenchida.
function mostrarFicha() {
    carregando.hidden = true;
    ficha.hidden = false;
}

// Escreve o numero do personagem com tres digitos, no formato Nº 001.
function formatarNumeroDoPersonagem(numero) {
    return `Nº ${String(numero).padStart(3, "0")}`;
}

// Passa a data de estreia do episodio para o formato brasileiro.
// Devolve o texto original se a API mandar algo que nao vira data.
function formatarData(dataIso) {
    const data = new Date(dataIso);

    if (Number.isNaN(data.getTime())) {
        return dataIso;
    }

    return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

// Tira o numero do fim de um endereco da API.
// A API manda os episodios como lista de URLs, nao de ids.
function idNoFinalDaUrl(url) {
    return url.split("/").pop();
}

// Escolhe quantos episodios cabem na ficha e devolve os ids deles.
// Usa idNoFinalDaUrl (deste arquivo).
function idsDosPrimeirosEpisodios(urls) {
    return urls.slice(0, MAXIMO_DE_EPISODIOS).map(idNoFinalDaUrl);
}

// Preenche foto, titulo da aba, numero, nome e especie.
// Usa formatarNumeroDoPersonagem (deste arquivo).
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

// Preenche as etiquetas de status e genero, traduzidas para portugues.
// Mantem o valor cru da API quando aparece um que a gente nao traduziu.
function preencherEtiquetas(personagem) {
    const status = personagem.status.toLowerCase();
    const genero = personagem.gender.toLowerCase();

    document.getElementById("status").textContent = NOMES_DOS_STATUS[status] ?? personagem.status;
    document.getElementById("genero").textContent = NOMES_DOS_GENEROS[genero] ?? personagem.gender;
}

// Pinta a pagina com a cor do status: verde vivo, vermelho morto, cinza desconhecido.
// As classes tema-alive, tema-dead e tema-unknown vivem no style.css.
function aplicarTemaDoStatus(status) {
    document.body.classList.add(`tema-${status}`);
}

// Preenche origem, ultimo local e quantos episodios o personagem tem no total.
// A API escreve "unknown" quando nao sabe, e ai a tabela mostra um traco.
function preencherLugares(personagem) {
    document.getElementById("origem").textContent = personagem.origin.name === "unknown" ? "—" : personagem.origin.name;
    document.getElementById("local").textContent = personagem.location.name === "unknown" ? "—" : personagem.location.name;
    document.getElementById("total-episodios").textContent = personagem.episode.length;
}

// Monta uma linha da lista de episodios: codigo, nome e data de estreia.
// Usa criarElemento (dom.js) e formatarData (deste arquivo).
function criarLinhaDeEpisodio(episodio) {
    const linha = criarElemento("li", "episodio");

    linha.append(
        criarElemento("span", "episodio-codigo", episodio.episode),
        criarElemento("span", "episodio-nome", episodio.name),
        criarElemento("span", "episodio-data", formatarData(episodio.air_date))
    );

    return linha;
}

// Preenche a lista de episodios e avisa quantos ficaram de fora do limite.
// Com episodios em null a busca falhou, e a ficha abre so com o aviso.
// Usa criarElemento (dom.js) e criarLinhaDeEpisodio (deste arquivo).
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

// Preenche a ficha inteira, bloco por bloco.
// Usa as quatro funcoes preencher* e aplicarTemaDoStatus (deste arquivo).
function preencherFicha(personagem, episodios) {
    preencherIdentidade(personagem);
    preencherEtiquetas(personagem);
    aplicarTemaDoStatus(personagem.status.toLowerCase());
    preencherLugares(personagem);
    preencherEpisodios(episodios, personagem.episode.length);
}

// Le o id que veio na query string da pagina, como em personagem.html?id=1.
function idDaPagina() {
    return new URLSearchParams(window.location.search).get("id");
}

// Ponto de entrada da tela: pega o id da URL, busca personagem e episodios,
// monta a ficha e trata o que der errado.
// Usa buscarPersonagemPorId, buscarEpisodios e PersonagemNaoEncontrado (rickandmorty.js).
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
