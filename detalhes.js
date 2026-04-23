document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const imdbId = params.get("id");
    const perfil = params.get("perfil") || localStorage.getItem("netflixPerfilAtual") || "visitante";
    const apiKey = window.OMDB_API_KEY;

    const linkSeries = document.getElementById("link-series");
    const linkFilmes = document.getElementById("link-filmes");
    const linkVoltar = document.getElementById("link-voltar");

    linkSeries.href = "series.html?perfil=" + encodeURIComponent(perfil);
    linkFilmes.href = "filmes.html?perfil=" + encodeURIComponent(perfil);
    linkVoltar.href = perfil === "visitante" ? "index.html" : perfil + ".html";

    if (!imdbId) {
        preencherErro("Nenhum título foi informado para a página de detalhes.");
        return;
    }

    if (!apiKey || apiKey === "SUA_CHAVE_OMDB_AQUI") {
        preencherErro("Adicione sua chave no arquivo config.js para carregar os detalhes.");
        return;
    }

    carregarDetalhes(imdbId, apiKey).catch(function (erro) {
        preencherErro(erro.message || "Não foi possível carregar os detalhes agora.");
    });
});

async function carregarDetalhes(imdbId, apiKey) {
    const url = new URL("https://www.omdbapi.com/");
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("i", imdbId);
    url.searchParams.set("plot", "full");

    const resposta = await fetch(url.toString());
    if (!resposta.ok) {
        throw new Error("Falha ao conectar com a OMDb.");
    }

    const dados = await resposta.json();
    if (dados.Response === "False") {
        throw new Error(dados.Error || "A OMDb não retornou detalhes.");
    }

    document.title = "Netflix - " + dados.Title;
    document.getElementById("titulo-detalhes").textContent = dados.Title;
    document.getElementById("meta-detalhes").textContent = [
        dados.Year,
        traduzirTipo(dados.Type),
        dados.Runtime,
        dados.Rated
    ].filter(Boolean).join(" • ");
    document.getElementById("plot-detalhes").textContent = dados.Plot || "Sem sinopse disponível.";
    document.getElementById("diretor-detalhes").textContent = dados.Director || "-";
    document.getElementById("elenco-detalhes").textContent = dados.Actors || "-";
    document.getElementById("premios-detalhes").textContent = dados.Awards || "-";
    document.getElementById("nota-detalhes").textContent = dados.imdbRating ? dados.imdbRating + "/10" : "-";

    const chips = document.getElementById("chips-detalhes");
    chips.innerHTML = "";
    [dados.Genre, dados.Language, dados.Country].filter(Boolean).forEach(function (valor) {
        const chip = document.createElement("span");
        chip.textContent = valor;
        chips.appendChild(chip);
    });

    const posterWrap = document.getElementById("poster-wrap");
    posterWrap.innerHTML = dados.Poster && dados.Poster !== "N/A"
        ? `<img src="${dados.Poster}" alt="Capa de ${dados.Title}">`
        : `<div class="poster-fallback">${dados.Title}</div>`;
}

function preencherErro(mensagem) {
    document.getElementById("titulo-detalhes").textContent = "Detalhes indisponíveis";
    document.getElementById("plot-detalhes").textContent = mensagem;
}

function traduzirTipo(tipo) {
    const tipos = {
        movie: "Filme",
        series: "Série",
        episode: "Episódio"
    };

    return tipos[tipo] || tipo;
}
