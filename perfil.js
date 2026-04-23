document.addEventListener("DOMContentLoaded", function () {
    const perfil = document.body.dataset.profile;

    if (perfil) {
        localStorage.setItem("netflixPerfilAtual", perfil);
    }
});
