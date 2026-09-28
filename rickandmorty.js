const URL_DA_API = "https://rickandmortyapi.com/api";

// Erro de 404 da API: o nome ou o numero pedido nao existe.
// As telas usam isso para separar "nao achei" de "a internet caiu".
class PersonagemNaoEncontrado extends Error {}

// Unico ponto do projeto que faz fetch na Rick and Morty API.
// Devolve o JSON pronto, transforma 404 em PersonagemNaoEncontrado e
// qualquer outro status ruim em erro comum.
async function pedirAApi(caminho) {
    const resposta = await fetch(`${URL_DA_API}${caminho}`);

    if (resposta.status === 404) {
        throw new PersonagemNaoEncontrado();
    }

    if (!resposta.ok) {
        throw new Error(`Erro ${resposta.status}`);
    }

    return resposta.json();
}

// Busca um personagem pelo numero. Usa pedirAApi (deste arquivo).
async function buscarPersonagemPorId(id) {
    return pedirAApi(`/character/${encodeURIComponent(id)}`);
}

// Busca personagens cujo nome contem o texto digitado.
// Devolve { results, info } como a API manda. Usa pedirAApi (deste arquivo).
async function buscarPersonagensPorNome(nome) {
    return pedirAApi(`/character/?name=${encodeURIComponent(nome)}`);
}

// Busca os episodios pedidos e devolve sempre uma lista.
// Com um id so a API devolve um objeto, com varios devolve uma lista.
// Devolve null se a busca falhar, porque a ficha abre sem os episodios.
// Usa pedirAApi (deste arquivo).
async function buscarEpisodios(ids) {
    if (ids.length === 0) {
        return [];
    }

    try {
        const dados = await pedirAApi(`/episode/${ids.join(",")}`);

        return Array.isArray(dados) ? dados : [dados];
    } catch {
        return null;
    }
}
