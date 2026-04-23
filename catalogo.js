document.addEventListener("DOMContentLoaded", function () {
    const tipoPagina = document.body.dataset.tipo;
    const params = new URLSearchParams(window.location.search);
    const perfil = params.get("perfil") || localStorage.getItem("netflixPerfilAtual") || "visitante";
    const apiKey = window.OMDB_API_KEY;

    const perfis = {
        neves: "Neves",
        kessia: "Kessia",
        julia: "Julia",
        visitante: "Visitante"
    };

    const nomePerfil = perfis[perfil] || perfis.visitante;
    const configPorTipo = {
        filmes: {
            titulo: "Filmes",
            descricao: "Resultados carregados pela API OMDb.",
            subtitulo: "Filmes para " + nomePerfil,
            busca: "Batman",
            type: "movie"
        },
        series: {
            titulo: "Séries",
            descricao: "Resultados carregados pela API OMDb.",
            subtitulo: "Séries para " + nomePerfil,
            busca: "Dark",
            type: "series"
        }
    };

    const atual = configPorTipo[tipoPagina];
    if (!atual) {
        return;
    }

    const estado = {
        termo: params.get("q") || atual.busca,
        ano: params.get("ano") || "",
        tipo: params.get("tipo") || atual.type,
        pagina: Number(params.get("page") || "1"),
        totalPaginas: 1,
        perfil: perfil
    };

    const elementos = {
        titulo: document.getElementById("titulo-catalogo"),
        descricao: document.getElementById("descricao-catalogo"),
        subtitulo: document.getElementById("subtitulo-catalogo"),
        perfilCatalogo: document.getElementById("perfil-catalogo"),
        grid: document.getElementById("catalogo-grid"),
        voltar: document.querySelector(".voltar"),
        formBusca: document.getElementById("form-busca"),
        campoBusca: document.getElementById("campo-busca"),
        campoAno: document.getElementById("campo-ano"),
        campoTipo: document.getElementById("campo-tipo"),
        paginaAnterior: document.getElementById("pagina-anterior"),
        paginaProxima: document.getElementById("pagina-proxima"),
        paginaInfo: document.getElementById("pagina-info")
    };

    elementos.titulo.textContent = atual.titulo;
    elementos.descricao.textContent = atual.descricao;
    elementos.subtitulo.textContent = atual.subtitulo;
    elementos.perfilCatalogo.textContent = "Perfil atual: " + nomePerfil;
    elementos.voltar.setAttribute("href", perfil === "visitante" ? "index.html" : perfil + ".html");
    elementos.campoBusca.value = estado.termo;
    elementos.campoAno.value = estado.ano;
    elementos.campoTipo.value = estado.tipo;

    document.querySelectorAll(".catalogo-nav a").forEach(function (link) {
        const destino = new URL(link.getAttribute("href"), window.location.href);
        destino.searchParams.set("perfil", perfil);
        link.setAttribute("href", destino.pathname.split("/").pop() + destino.search);
    });

    if (!apiKey || apiKey === "SUA_CHAVE_OMDB_AQUI") {
        renderMensagem("Adicione sua chave no arquivo config.js para carregar os títulos da OMDb.");
        atualizarPaginacao(elementos, estado);
        return;
    }

    const debounceBusca = debounce(function () {
        const termo = elementos.campoBusca.value.trim();
        if (!termo) {
            return;
        }

        estado.termo = termo;
        estado.ano = elementos.campoAno.value.trim();
        estado.tipo = elementos.campoTipo.value;
        estado.pagina = 1;
        carregarCatalogo(estado, apiKey, elementos);
    }, 500);

    elementos.formBusca.addEventListener("submit", function (event) {
        event.preventDefault();
        const termo = elementos.campoBusca.value.trim();
        if (!termo) {
            renderMensagem("Digite um título para pesquisar.");
            return;
        }

        estado.termo = termo;
        estado.ano = elementos.campoAno.value.trim();
        estado.tipo = elementos.campoTipo.value;
        estado.pagina = 1;
        carregarCatalogo(estado, apiKey, elementos);
    });

    elementos.campoBusca.addEventListener("input", function () {
        if (elementos.campoBusca.value.trim().length >= 3) {
            debounceBusca();
        }
    });

    elementos.campoAno.addEventListener("input", debounceBusca);
    elementos.campoTipo.addEventListener("change", function () {
        estado.tipo = elementos.campoTipo.value;
        estado.pagina = 1;
        carregarCatalogo(estado, apiKey, elementos);
    });

    elementos.paginaAnterior.addEventListener("click", function () {
        if (estado.pagina > 1) {
            estado.pagina -= 1;
            carregarCatalogo(estado, apiKey, elementos);
        }
    });

    elementos.paginaProxima.addEventListener("click", function () {
        if (estado.pagina < estado.totalPaginas) {
            estado.pagina += 1;
            carregarCatalogo(estado, apiKey, elementos);
        }
    });

    carregarCatalogo(estado, apiKey, elementos);
});

async function carregarCatalogo(estado, apiKey, elementos) {
    renderMensagem("Carregando catálogo...");

    try {
        const dados = await buscarNaOmdb(estado, apiKey);
        estado.totalPaginas = Math.max(1, Math.ceil(Number(dados.totalResults || "1") / 10));

        if (!(dados.Search || []).length) {
            throw new Error("Nenhum resultado foi encontrado para essa busca.");
        }

        elementos.subtitulo.textContent = 'Resultados para "' + estado.termo + '"';
        elementos.grid.innerHTML = "";

        dados.Search.forEach(function (item) {
            elementos.grid.appendChild(criarCardCatalogo(item, estado.perfil));
        });

        atualizarPaginacao(elementos, estado);
        atualizarUrl(estado);
    } catch (erro) {
        renderMensagem(erro.message || "Não foi possível carregar a OMDb agora.");
        atualizarPaginacao(elementos, estado);
    }
}

async function buscarNaOmdb(estado, apiKey) {
    const url = new URL("https://www.omdbapi.com/");
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("s", estado.termo);
    url.searchParams.set("type", estado.tipo);
    url.searchParams.set("page", String(estado.pagina));

    if (estado.ano) {
        url.searchParams.set("y", estado.ano);
    }

    const resposta = await fetch(url.toString());
    if (!resposta.ok) {
        throw new Error("Falha ao conectar com a OMDb.");
    }

    const dados = await resposta.json();
    if (dados.Response === "False") {
        throw new Error(dados.Error || "A OMDb não retornou resultados.");
    }

    return dados;
}

function criarCardCatalogo(item, perfil) {
    const link = document.createElement("a");
    link.className = "catalogo-card";
    link.href = "detalhes.html?id=" + encodeURIComponent(item.imdbID) + "&perfil=" + encodeURIComponent(perfil);

    const posterHtml = item.Poster && item.Poster !== "N/A"
        ? `<img src="${item.Poster}" alt="Capa de ${item.Title}">`
        : `<div class="poster-placeholder">${item.Title}</div>`;

    link.innerHTML = `
        ${posterHtml}
        <div class="card-info">
            <h3>${item.Title}</h3>
            <p>${traduzirTipo(item.Type)} - ${item.Year}</p>
        </div>
    `;

    return link;
}

function atualizarPaginacao(elementos, estado) {
    elementos.paginaInfo.textContent = "Página " + estado.pagina + " de " + estado.totalPaginas;
    elementos.paginaAnterior.disabled = estado.pagina <= 1;
    elementos.paginaProxima.disabled = estado.pagina >= estado.totalPaginas;
}

function atualizarUrl(estado) {
    const params = new URLSearchParams();
    params.set("perfil", estado.perfil);
    params.set("q", estado.termo);
    params.set("tipo", estado.tipo);
    params.set("page", String(estado.pagina));

    if (estado.ano) {
        params.set("ano", estado.ano);
    }

    const novaUrl = window.location.pathname.split("/").pop() + "?" + params.toString();
    window.history.replaceState({}, "", novaUrl);
}

function renderMensagem(texto) {
    const grid = document.getElementById("catalogo-grid");
    grid.innerHTML = `<p class="catalogo-status">${texto}</p>`;
}

function traduzirTipo(tipo) {
    const tipos = {
        movie: "Filme",
        series: "Série",
        episode: "Episódio"
    };

    return tipos[tipo] || tipo;
}

function debounce(fn, espera) {
    let timer;

    return function () {
        const contexto = this;
        const args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(contexto, args);
        }, espera);
    };
}
