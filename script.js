document.addEventListener("DOMContentLoaded", function () {
    const perfis = [
        { nome: "Neves", pagina: "neves.html" },
        { nome: "Kessia", pagina: "kessia.html" },
        { nome: "Julia", pagina: "julia.html" }
    ];

    const perfilesArticles = document.querySelectorAll("article.perfile");

    perfilesArticles.forEach((perfil, index) => {
        perfil.style.cursor = "pointer";
        perfil.setAttribute("tabindex", "0");
        perfil.setAttribute("role", "button");
        perfil.setAttribute("aria-label", `Ir para o perfil de ${perfis[index].nome}`);

        const abrirPerfil = function () {
            if (perfis[index]) {
                localStorage.setItem("netflixPerfilAtual", perfis[index].pagina.replace(".html", ""));
                window.location.href = perfis[index].pagina;
            }
        };

        perfil.addEventListener("click", abrirPerfil);
        perfil.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                abrirPerfil();
            }
        });
    });
});
