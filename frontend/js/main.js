import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const db = createClient(
  'https://fbtazspzewrgoadtxgnh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZidGF6c3B6ZXdyZ29hZHR4Z25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyODY0NTIsImV4cCI6MjEwODg2MjQ1Mn0.7X86tjZmM_6la-vthlNrGu0Wbdl7KsbrqPcBBXqM8tI'
);

const lista = document.getElementById('lista-artigos');
const pesquisa_input = document.getElementById("titulo_pesquisa");


const checkboxSereia = document.querySelector('.sereia');
const checkboxElefante = document.querySelector('.elefante');
const checkboxPeixe = document.querySelector('.peixe');


let artigosCache = [];

function filtro_pesquisa(){

  const pesquisa = pesquisa_input.value.toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '');


  const categoriasAtivas = [];
  if (checkboxSereia.checked) categoriasAtivas.push('genética');
  if (checkboxElefante.checked) categoriasAtivas.push('meio ambiente');
  if (checkboxPeixe.checked) categoriasAtivas.push('oncologia');

 
      
      artigosCache.forEach(artigo => {
        
        const tituloMatch = artigo.titulo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(pesquisa);
        const subtituloMatch = artigo.sub_titulo ? artigo.sub_titulo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(pesquisa) : false;
        const texto_mach = tituloMatch || subtituloMatch;


        //Provavelmente vou ter que puxar do banco ainda
        const matchCategoria = categoriasAtivas.length === 0 || categoriasAtivas.includes(artigo.categoria);
        
        const isVisible = texto_mach && matchCategoria
        
        // Alterna a classe 'hide' no elemento do card[cite: 1]
        artigo.element.classList.toggle("hide", !isVisible);
      });
  }

pesquisa_input.addEventListener("input", filtro_pesquisa);
checkboxSereia.addEventListener("change", filtro_pesquisa);
checkboxElefante.addEventListener("change", filtro_pesquisa);
checkboxPeixe.addEventListener("change", filtro_pesquisa);


function formatarData(timestamp) {
  if (!timestamp) return '';
  const data = new Date(String(timestamp).replace(' ', 'T'));
  if (Number.isNaN(data.getTime())) return '';

  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
    .format(data)
    .replace(/ de (\d{4})$/, ' $1'); // "14 de novembro 2026"
}


function criarCard(info_banco) {
  const card = document.createElement('article');
  card.className = 'cartao-artigo';
  card.innerHTML = `
    <a href="" class="cartao-artigo-link">
      <div class="cartao-artigo-capa">
                            <img src="" alt="....">
                            
      </div>
      <div class="cartao-artigo-info">
                            
        <div>
          <h3></h3>
          <p></p>
          <p class="cartao-artigo-autor">Profissional convidado</p>
          <p class="cartao-artigo-meta">
            <span>&middot;</span>
            <time datetime=""></time>
          </p>
        </div>
      </div>
    </a>
    `
  card.querySelector('h3').textContent = info_banco.titulo;
  card.querySelector('p').textContent = info_banco.sub_titulo ?? '';
  card.querySelector('a').href = info_banco.link_artigo ?? '#';
  card.querySelector('img').src = info_banco.imagem;
  card.querySelector  ('span').textContent = info_banco.categoria + " · ";
  
  const timeEl = card.querySelector('time');
  timeEl.textContent = formatarData(info_banco.created_at);
  if (info_banco.created_at) {
    timeEl.setAttribute('datetime', info_banco.created_at);
  }

  return card;
}

async function carregarArtigos() {
  const { data, error } = await db
    .from('artigos')
    .select('titulo, sub_titulo, link_artigo,imagem, categoria,cliques,created_at')
    .order('id', { ascending: false });
  if (error) return console.error(error);

  artigosCache = data.map(item => {
    const cardElement = criarCard(item);
    return {
      titulo: item.titulo,
      sub_titulo: item.sub_titulo,
      element: cardElement,
      categoria: item.categoria ? item.categoria.toLowerCase().trim() : '',};});

  lista.replaceChildren(...artigosCache.map(item => item.element));
}


// botão que adciona um tiulo lá no banco
document.getElementById('teste_button').addEventListener('click', async () => {
  const titulo_inp = document.getElementById('titulo_input');
  const subtitulo_inp = document.getElementById('subtitulo_input');
  const img_inp = document.getElementById('img_input');
  const link_inp = document.getElementById('link_input');

  const titulo = titulo_inp.value.trim();
  if (!titulo) return;


  const { error } = await db.from('artigos').insert({ 
    titulo,
    sub_titulo: subtitulo_inp.value.trim() || null,
    link_artigo: link_inp.value.trim() || null,
    imagem: img_inp.value.trim() || null,
   });



  if (error){
    console.error(error.code, error.message, error.hint);
    return;}

  [titulo_inp, subtitulo_inp, img_inp, link_inp].forEach(i => i.value = '');
  carregarArtigos();
});


carregarArtigos();