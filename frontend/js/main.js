// Pesquisa de artigos: filtra os cards pelo texto digitado
const formPesquisa = document.getElementById('form-pesquisa');

if (formPesquisa) {
    const campo = document.getElementById('campo-pesquisa');
    const cards = document.querySelectorAll('.cartao-artigo');
    const vazio = document.getElementById('artigos-vazio');

    // Remove acentos para "genetica" achar "Genética"
    const normalizar = (texto) =>
        texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    const filtrar = () => {
        const termo = normalizar(campo.value.trim());
        let visiveis = 0;

        cards.forEach((card) => {
            const combina = normalizar(card.textContent).includes(termo);
            card.hidden = !combina;
            if (combina) visiveis++;
        });

        vazio.hidden = visiveis > 0;
    };

    campo.addEventListener('input', filtrar);
    formPesquisa.addEventListener('submit', (evento) => {
        evento.preventDefault();
        filtrar();
    });
}
