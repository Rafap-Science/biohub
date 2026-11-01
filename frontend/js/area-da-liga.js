/* ==========================================================
   BioHub - area-da-liga.js
   Troca de telas (login, painel, nova postagem) sem recarregar.
   JavaScript puro, sem bibliotecas.

   CONEXÃO COM O SERVIDOR:
   Todas as chamadas de dados estão no objeto `servidor` logo abaixo.
   Hoje elas SIMULAM respostas. Para ligar ao back-end, troque só o
   conteúdo dessas funções (mantendo o que cada uma devolve).

   Para ver os estados de erro: abra a página com ?demo=erro
   ========================================================== */

(() => {
    'use strict';

    const DEMO_ERRO = new URLSearchParams(window.location.search).get('demo') === 'erro';

    const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));


    /* ---------- Servidor (SIMULADO - substituir depois) ---------- */

    const servidor = {
        /** Deve devolver { nome, matricula } ou lançar um erro. */
        async entrar(matricula, senha) {
            await esperar(1200);
            if (DEMO_ERRO || senha.length < 4) {
                throw new Error('credenciais');
            }
            return { nome: 'Ana Beatriz Lima', matricula };
        },

        async sair() {
            await esperar(150);
        },

        /** Deve devolver a lista de postagens. */
        async listarPostagens() {
            return [
                {
                    id: 'p1',
                    tipo: 'noticia',
                    titulo: 'Inscrições abertas para o III Congresso de Biomedicina',
                    texto: 'Submissão de trabalhos científicos até 20 de novembro.',
                    data: '2026-10-10',
                    autor: 'Ana Beatriz Lima',
                    foto: 'img/Congresso de Biomedicina UniALFA.png'
                },
                {
                    id: 'p2',
                    tipo: 'encontro',
                    titulo: 'Biomarcadores no diagnóstico precoce do câncer',
                    texto: 'Palestra com a Profa. Dra. Ana Paula Souza. Bloco C, Sala 12, às 19h.',
                    data: '2026-10-08',
                    autor: 'Lucas Ferreira',
                    foto: 'img/Gemini_Generated_Image_n9bl7xn9bl7xn9bl.jpg'
                },
                {
                    id: 'p3',
                    tipo: 'artigo',
                    titulo: 'Resultado do processo seletivo para novos membros 2026.2',
                    texto: 'Confira a lista de aprovados.',
                    data: '2026-09-15',
                    autor: 'Ana Beatriz Lima',
                    foto: 'img/Resultado do Processo Seletivo UniALFA 2026.2.png'
                }
            ];
        },

        /**
         * Envia a postagem. `dados.foto` é um Blob (já reduzido) ou null ao editar sem trocar.
         * Chame aoProgredir(0 a 100) para atualizar a barra.
         * Deve devolver a postagem salva.
         */
        async publicar(dados, aoProgredir) {
            for (let p = 0; p <= 100; p += 10) {
                aoProgredir(p);
                await esperar(140);
                if (DEMO_ERRO && p === 60) throw new Error('envio');
            }
            return {
                ...dados,
                id: dados.id || 'p' + Date.now(),
                data: dados.data || new Date().toISOString().slice(0, 10),
                foto: dados.foto ? URL.createObjectURL(dados.foto) : dados.fotoAtual
            };
        },

        async excluir(id) {
            await esperar(300);
            return id;
        }
    };


    /* ---------- Estado da página ---------- */

    const estado = {
        usuario: null,
        postagens: [],
        filtro: 'todas',
        editandoId: null,
        fotoReduzida: null,   // Blob da foto nova
        fotoAtual: null,      // endereço da foto ao editar
        excluindoId: null
    };

    const NOMES_TIPO = { noticia: 'Notícia', artigo: 'Artigo', encontro: 'Encontro' };
    const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

    const $ = (id) => document.getElementById(id);

    const telas = {
        login: $('tela-login'),
        painel: $('tela-painel'),
        'nova-postagem': $('tela-nova-postagem')
    };

    const titulosTela = {
        login: $('titulo-login'),
        painel: $('titulo-painel'),
        'nova-postagem': $('titulo-nova-postagem')
    };


    /* ---------- Troca de telas ---------- */

    function mostrarTela(nome, { historico = 'empurrar' } = {}) {
        Object.entries(telas).forEach(([chave, tela]) => {
            tela.hidden = chave !== nome;
        });

        if (historico === 'empurrar') {
            history.pushState({ tela: nome }, '', '#' + nome);
        } else if (historico === 'trocar') {
            history.replaceState({ tela: nome }, '', '#' + nome);
        }

        window.scrollTo({ top: 0, behavior: 'auto' });
        titulosTela[nome].focus({ preventScroll: true });
    }

    // Botão "voltar" do celular
    window.addEventListener('popstate', (evento) => {
        const nome = evento.state && evento.state.tela;
        if (!estado.usuario) {
            mostrarTela('login', { historico: 'trocar' });
        } else if (nome === 'nova-postagem' || nome === 'painel') {
            mostrarTela(nome, { historico: 'nenhum' });
        } else {
            mostrarTela('painel', { historico: 'trocar' });
        }
    });


    /* ---------- Botões com "carregando" ---------- */

    function definirCarregando(botao, carregando, textoCarregando) {
        const texto = botao.querySelector('.botao-texto');
        if (!botao.dataset.textoOriginal) botao.dataset.textoOriginal = texto.textContent;
        botao.disabled = carregando;
        botao.classList.toggle('esta-carregando', carregando);
        botao.setAttribute('aria-busy', String(carregando));
        texto.textContent = carregando ? textoCarregando : botao.dataset.textoOriginal;
    }


    /* ==========================================================
       TELA 1 - LOGIN
       ========================================================== */

    const formularioLogin = $('formulario-login');
    const entradaMatricula = $('entrada-matricula');
    const entradaSenha = $('entrada-senha');
    const botaoEntrar = $('botao-entrar');
    const avisoErroLogin = $('aviso-erro-login');
    const textoErroLogin = $('texto-erro-login');
    const botaoMostrarSenha = $('botao-mostrar-senha');

    botaoMostrarSenha.addEventListener('click', () => {
        const mostrar = entradaSenha.type === 'password';
        entradaSenha.type = mostrar ? 'text' : 'password';
        botaoMostrarSenha.setAttribute('aria-pressed', String(mostrar));
        botaoMostrarSenha.querySelector('.botao-mostrar-senha-texto').textContent = mostrar ? 'Ocultar' : 'Mostrar';
    });

    function mostrarErroLogin(mensagem, campos) {
        textoErroLogin.textContent = mensagem;
        avisoErroLogin.hidden = false;
        [entradaMatricula, entradaSenha].forEach((campo) => {
            campo.setAttribute('aria-invalid', String(campos.includes(campo)));
        });
    }

    function limparErroLogin() {
        avisoErroLogin.hidden = true;
        entradaMatricula.removeAttribute('aria-invalid');
        entradaSenha.removeAttribute('aria-invalid');
    }

    [entradaMatricula, entradaSenha].forEach((campo) => {
        campo.addEventListener('input', () => {
            if (!avisoErroLogin.hidden) limparErroLogin();
        });
    });

    formularioLogin.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        limparErroLogin();

        const matricula = entradaMatricula.value.trim();
        const senha = entradaSenha.value;

        if (!matricula || !senha) {
            const vazios = [!matricula && entradaMatricula, !senha && entradaSenha].filter(Boolean);
            mostrarErroLogin('Preencha a matrícula e a senha.', vazios);
            vazios[0].focus();
            return;
        }

        definirCarregando(botaoEntrar, true, 'Entrando...');
        try {
            estado.usuario = await servidor.entrar(matricula, senha);
            estado.postagens = await servidor.listarPostagens();
            formularioLogin.reset();
            preencherUsuario();
            desenharLista();
            mostrarTela('painel', { historico: 'trocar' });
        } catch (erro) {
            mostrarErroLogin('Matrícula ou senha incorretos.', [entradaMatricula, entradaSenha]);
            entradaSenha.select();
            entradaSenha.focus();
        } finally {
            definirCarregando(botaoEntrar, false);
        }
    });


    /* ==========================================================
       TELA 2 - PAINEL
       ========================================================== */

    const listaPostagens = $('lista-postagens');
    const moldeCartao = $('molde-cartao-postagem');
    const estadoVazio = $('estado-vazio');
    const avisoPainel = $('aviso-painel');
    let temporizadorAviso;

    function iniciais(nome) {
        return nome.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
    }

    function preencherUsuario() {
        $('usuario-nome').textContent = estado.usuario.nome;
        $('usuario-matricula').textContent = estado.usuario.matricula;
        $('usuario-avatar').textContent = iniciais(estado.usuario.nome);
    }

    function formatarData(iso) {
        const [ano, mes, dia] = iso.split('-');
        return `${dia} ${MESES[Number(mes) - 1]} ${ano}`;
    }

    function mostrarAvisoPainel(mensagem) {
        $('texto-aviso-painel').textContent = mensagem;
        avisoPainel.hidden = false;
        clearTimeout(temporizadorAviso);
        temporizadorAviso = setTimeout(() => { avisoPainel.hidden = true; }, 5000);
    }

    function atualizarContagens() {
        const contar = (tipo) => estado.postagens.filter((p) => tipo === 'todas' || p.tipo === tipo).length;
        document.querySelectorAll('[data-contagem]').forEach((el) => {
            el.textContent = contar(el.dataset.contagem);
        });
    }

    function desenharLista() {
        atualizarContagens();

        const visiveis = estado.postagens
            .filter((p) => estado.filtro === 'todas' || p.tipo === estado.filtro)
            .sort((a, b) => b.data.localeCompare(a.data));

        listaPostagens.replaceChildren();

        visiveis.forEach((postagem) => {
            const cartao = moldeCartao.content.firstElementChild.cloneNode(true);
            cartao.dataset.id = postagem.id;

            const foto = cartao.querySelector('.miniatura-foto');
            foto.src = postagem.foto;
            foto.alt = '';

            const etiqueta = cartao.querySelector('.etiqueta-tipo');
            etiqueta.textContent = NOMES_TIPO[postagem.tipo];
            etiqueta.classList.add('etiqueta-' + postagem.tipo);

            cartao.querySelector('.cartao-postagem-titulo').textContent = postagem.titulo;

            const data = cartao.querySelector('.meta-data');
            data.dateTime = postagem.data;
            data.textContent = formatarData(postagem.data);

            cartao.querySelector('.meta-autor').textContent = postagem.autor;

            cartao.querySelectorAll('[data-acao]').forEach((botao) => {
                botao.setAttribute('aria-label', `${botao.textContent.trim()}: ${postagem.titulo}`);
            });

            listaPostagens.appendChild(cartao);
        });

        const vazio = visiveis.length === 0;
        estadoVazio.hidden = !vazio;
        listaPostagens.hidden = vazio;

        if (vazio) {
            const semNada = estado.postagens.length === 0;
            const nomeFiltro = { noticia: 'notícia', artigo: 'artigo', encontro: 'encontro' }[estado.filtro];
            $('estado-vazio-titulo').textContent = semNada || !nomeFiltro
                ? 'Nenhuma postagem ainda.'
                : `Nenhum${estado.filtro === 'noticia' ? 'a' : ''} ${nomeFiltro} ainda.`;
            $('estado-vazio-texto').textContent = 'Crie a primeira!';
        }
    }

    // Filtro por tipo
    $('filtro-tipos').addEventListener('click', (evento) => {
        const botao = evento.target.closest('[data-filtro]');
        if (!botao) return;
        estado.filtro = botao.dataset.filtro;
        document.querySelectorAll('[data-filtro]').forEach((b) => {
            b.setAttribute('aria-pressed', String(b === botao));
        });
        desenharLista();
    });

    // Editar / Excluir
    listaPostagens.addEventListener('click', (evento) => {
        const botao = evento.target.closest('[data-acao]');
        if (!botao) return;
        const id = botao.closest('.cartao-postagem').dataset.id;
        if (botao.dataset.acao === 'editar') abrirFormulario(id);
        if (botao.dataset.acao === 'excluir') pedirExclusao(id);
    });

    $('botao-nova-postagem').addEventListener('click', () => abrirFormulario(null));
    $('botao-criar-primeira').addEventListener('click', () => abrirFormulario(null));

    $('botao-sair').addEventListener('click', async () => {
        await servidor.sair();
        estado.usuario = null;
        estado.postagens = [];
        avisoPainel.hidden = true;
        mostrarTela('login', { historico: 'trocar' });
    });

    // Janela de exclusão
    const janelaExcluir = $('janela-excluir');

    function pedirExclusao(id) {
        const postagem = estado.postagens.find((p) => p.id === id);
        estado.excluindoId = id;
        $('janela-excluir-texto').textContent = `"${postagem.titulo}" vai sair do site e não dá para desfazer.`;
        janelaExcluir.showModal();
        $('botao-manter').focus();
    }

    $('botao-manter').addEventListener('click', () => janelaExcluir.close());

    $('botao-confirmar-excluir').addEventListener('click', async () => {
        const id = estado.excluindoId;
        janelaExcluir.close();
        await servidor.excluir(id);
        estado.postagens = estado.postagens.filter((p) => p.id !== id);
        desenharLista();
        mostrarAvisoPainel('Postagem excluída.');
    });


    /* ==========================================================
       TELA 3 - NOVA POSTAGEM
       ========================================================== */

    const formularioPostagem = $('formulario-postagem');
    const entradaTitulo = $('entrada-titulo');
    const entradaTexto = $('entrada-texto');
    const entradaFoto = $('entrada-foto');
    const areaFotoVazia = $('botao-escolher-foto');
    const previaFoto = $('previa-foto');
    const previaImagem = $('previa-foto-imagem');
    const botaoPublicar = $('botao-publicar');
    const botaoCancelar = $('botao-cancelar');
    const envioProgresso = $('envio-progresso');
    const barraProgresso = $('barra-progresso');
    const avisoErroPostagem = $('aviso-erro-postagem');
    const envioSucesso = $('envio-sucesso');

    const erros = {
        tipo: { campo: $('campo-tipo'), msg: $('erro-tipo') },
        titulo: { campo: entradaTitulo, msg: $('erro-titulo') },
        texto: { campo: entradaTexto, msg: $('erro-texto') },
        foto: { campo: $('campo-foto'), msg: $('erro-foto') }
    };

    function marcarErro(nome, temErro) {
        erros[nome].msg.hidden = !temErro;
        if (temErro) erros[nome].campo.setAttribute('aria-invalid', 'true');
        else erros[nome].campo.removeAttribute('aria-invalid');
    }

    function mostrarFoto(endereco) {
        previaImagem.src = endereco;
        previaFoto.hidden = !endereco;
        areaFotoVazia.hidden = Boolean(endereco);
    }

    function abrirFormulario(id) {
        const postagem = id ? estado.postagens.find((p) => p.id === id) : null;

        formularioPostagem.reset();
        Object.keys(erros).forEach((nome) => marcarErro(nome, false));
        avisoErroPostagem.hidden = true;
        envioProgresso.hidden = true;
        envioSucesso.hidden = true;
        formularioPostagem.hidden = false;

        estado.editandoId = id;
        estado.fotoReduzida = null;
        estado.fotoAtual = postagem ? postagem.foto : null;

        $('titulo-nova-postagem').textContent = postagem ? 'Editar postagem' : 'Nova postagem';
        botaoPublicar.dataset.textoOriginal = postagem ? 'Salvar mudanças' : 'Publicar';
        botaoPublicar.querySelector('.botao-texto').textContent = botaoPublicar.dataset.textoOriginal;

        if (postagem) {
            formularioPostagem.elements.tipo.value = postagem.tipo;
            entradaTitulo.value = postagem.titulo;
            entradaTexto.value = postagem.texto || '';
        }
        mostrarFoto(estado.fotoAtual);

        mostrarTela('nova-postagem');
    }

    function voltarAoPainel() {
        if (history.state && history.state.tela === 'nova-postagem') {
            history.back(); // o "popstate" mostra o painel
        } else {
            mostrarTela('painel', { historico: 'trocar' });
        }
    }

    /**
     * Reduz a foto no próprio celular antes de enviar:
     * lado maior com no máximo 1600px, em JPEG.
     */
    function reduzirFoto(arquivo, ladoMaximo = 1600, qualidade = 0.82) {
        return new Promise((resolver, rejeitar) => {
            const endereco = URL.createObjectURL(arquivo);
            const imagem = new Image();
            imagem.onload = () => {
                const escala = Math.min(1, ladoMaximo / Math.max(imagem.width, imagem.height));
                const tela = document.createElement('canvas');
                tela.width = Math.round(imagem.width * escala);
                tela.height = Math.round(imagem.height * escala);
                tela.getContext('2d').drawImage(imagem, 0, 0, tela.width, tela.height);
                URL.revokeObjectURL(endereco);
                tela.toBlob((blob) => (blob ? resolver(blob) : rejeitar(new Error('foto'))), 'image/jpeg', qualidade);
            };
            imagem.onerror = () => {
                URL.revokeObjectURL(endereco);
                rejeitar(new Error('foto'));
            };
            imagem.src = endereco;
        });
    }

    entradaFoto.addEventListener('change', async () => {
        const arquivo = entradaFoto.files && entradaFoto.files[0];
        if (!arquivo) return;
        try {
            estado.fotoReduzida = await reduzirFoto(arquivo);
            mostrarFoto(URL.createObjectURL(estado.fotoReduzida));
            marcarErro('foto', false);
        } catch (erro) {
            erros.foto.msg.textContent = 'Não foi possível abrir esta foto. Tente outra.';
            marcarErro('foto', true);
        }
        entradaFoto.value = '';
    });

    formularioPostagem.addEventListener('change', (evento) => {
        if (evento.target.name === 'tipo') marcarErro('tipo', false);
    });
    entradaTitulo.addEventListener('input', () => marcarErro('titulo', false));
    entradaTexto.addEventListener('input', () => marcarErro('texto', false));

    function validar() {
        const tipo = formularioPostagem.elements.tipo.value;
        const problemas = {
            tipo: !tipo,
            titulo: !entradaTitulo.value.trim(),
            texto: !entradaTexto.value.trim(),
            foto: !estado.fotoReduzida && !estado.fotoAtual
        };
        erros.foto.msg.textContent = 'Escolha uma foto.';
        Object.entries(problemas).forEach(([nome, temErro]) => marcarErro(nome, temErro));

        const primeiro = Object.keys(problemas).find((nome) => problemas[nome]);
        if (primeiro) {
            const alvo = primeiro === 'tipo'
                ? formularioPostagem.querySelector('input[name="tipo"]')
                : primeiro === 'foto' ? entradaFoto : erros[primeiro].campo;
            erros[primeiro].campo.scrollIntoView({ behavior: 'smooth', block: 'center' });
            alvo.focus({ preventScroll: true });
            return null;
        }
        return { tipo, titulo: entradaTitulo.value.trim(), texto: entradaTexto.value.trim() };
    }

    function atualizarProgresso(porcentagem) {
        barraProgresso.setAttribute('aria-valuenow', String(porcentagem));
        $('barra-progresso-preenchimento').style.width = porcentagem + '%';
        $('envio-porcentagem').textContent = porcentagem + '%';
    }

    formularioPostagem.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        avisoErroPostagem.hidden = true;

        const dados = validar();
        if (!dados) return;

        const anterior = estado.postagens.find((p) => p.id === estado.editandoId);

        atualizarProgresso(0);
        envioProgresso.hidden = false;
        botaoCancelar.disabled = true;
        definirCarregando(botaoPublicar, true, 'Enviando...');

        try {
            const salva = await servidor.publicar({
                ...dados,
                id: estado.editandoId,
                data: anterior ? anterior.data : null,
                autor: anterior ? anterior.autor : estado.usuario.nome,
                foto: estado.fotoReduzida,
                fotoAtual: estado.fotoAtual
            }, atualizarProgresso);

            if (anterior) {
                estado.postagens = estado.postagens.map((p) => (p.id === salva.id ? salva : p));
            } else {
                estado.postagens.unshift(salva);
            }
            desenharLista();

            formularioPostagem.hidden = true;
            $('envio-sucesso-titulo').textContent = anterior ? 'Mudanças salvas!' : 'Publicado!';
            envioSucesso.hidden = false;
            $('envio-sucesso-titulo').focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (erro) {
            avisoErroPostagem.hidden = false;
            avisoErroPostagem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } finally {
            envioProgresso.hidden = true;
            botaoCancelar.disabled = false;
            definirCarregando(botaoPublicar, false);
        }
    });

    botaoCancelar.addEventListener('click', voltarAoPainel);
    $('botao-voltar-painel').addEventListener('click', voltarAoPainel);
    $('botao-ver-painel').addEventListener('click', voltarAoPainel);


    /* ---------- Início ---------- */

    history.replaceState({ tela: 'login' }, '', window.location.pathname + window.location.search);
})();
