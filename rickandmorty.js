const URL_DA_API = "https://rickandmortyapi.com/api";

class PersonagemNaoEncontrado extends Error {}

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

async function buscarPersonagemPorId(id) {
    return pedirAApi(`/character/${encodeURIComponent(id)}`);
}

async function buscarPersonagensPorNome(nome) {
    return pedirAApi(`/character/?name=${encodeURIComponent(nome)}`);
}

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
