// Configurar redirecionamento dos perfis
document.addEventListener('DOMContentLoaded', function() {
    // Array com os dados dos perfis e suas páginas respectivas
    const perfis = [
        {
            nome: 'Neves',
            pagina: 'pages/neves.html' // Página de Neves
        },
        {
            nome: 'Kessia',
            pagina: 'pages/kessia.html' // Página de Kessia
        },
        {
            nome: 'Julia',
            pagina: 'pages/julia.html' // Página de Julia
        }
    ];

    // Selecionar todos os artigos de perfil
    const perfilesArticles = document.querySelectorAll('article.perfile');

    // Adicionar evento de clique a cada perfil
    perfilesArticles.forEach((perfil, index) => {
        // Adicionar cursor pointer para indicar que é clicável
        perfil.style.cursor = 'pointer';

        // Adicionar evento de clique
        perfil.addEventListener('click', function() {
            // Redirecionar para a página do perfil
            if (perfis[index]) {
                window.location.href = perfis[index].pagina;
            }
        });

        // Adicionar evento de teclado para acessibilidade (Enter ou Space)
        perfil.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                if (perfis[index]) {
                    window.location.href = perfis[index].pagina;
                }
            }
        });

        // Tornar o perfil focável com tab (acessibilidade)
        perfil.setAttribute('tabindex', '0');
        perfil.setAttribute('role', 'button');
        perfil.setAttribute('aria-label', `Ir para o perfil de ${perfis[index].nome}`);
    });

    // Efeito adicional: adicionar feedback visual ao clicar
    perfilesArticles.forEach((perfil) => {
        perfil.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98)'; // Pequeno encolhimento ao clicar
        });

        perfil.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1.05)'; // Volta ao hover normal
        });

        perfil.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)'; // Volta ao normal se sair
        });
    });

    console.log('Script de perfis ativado!');
});
