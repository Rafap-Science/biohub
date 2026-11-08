import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const db = createClient(
  'https://fbtazspzewrgoadtxgnh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZidGF6c3B6ZXdyZ29hZHR4Z25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyODY0NTIsImV4cCI6MjEwODg2MjQ1Mn0.7X86tjZmM_6la-vthlNrGu0Wbdl7KsbrqPcBBXqM8tI'
);

const lista = document.getElementById('lista-artigos');
const pesquisa = document.getElementById('pesquisa')

let todos_artigos = [];




function criarCard(info_banco) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="artigo_intro">
      <h3></h3><p></p><a>Ler mais</a>
    </div>`;
  card.querySelector('h3').textContent = info_banco.titulo;
  card.querySelector('p').textContent = info_banco.sub_titulo ?? '';
  card.querySelector('a').href = info_banco.link_artigo ?? '#';
  return card;
}

async function carregarArtigos() {
  const { data, error } = await db
    .from('artigos')
    .select('titulo, sub_titulo, link_artigo')
    .order('id', { ascending: false });
  if (error) return console.error(error);

  todos_artigos = data;



  lista.replaceChildren(...data.map(criarCard));
}





// botão que adciona um tiulo lá no banco
document.getElementById('teste_button').addEventListener('click', async () => {
  const titulo = document.getElementById('titulo_input').value.trim();
  if (!titulo) return;
  const { error } = await db.from('artigos').insert({ titulo });
  if (error){
    console.error(error.code, error.message, error.hint);
    return;}

    titulo.value = '';
    carregarArtigos();
});


// Barra de Pesquisa




pesquisa.addEventListener("input", e => {
    const value = e.target.value.toLowerCase()
    todos_artigos.forEach(artigos => {
        const is_visible = 
            artigos.titulo.toLowerCase().includes(value)
        artigos.element.classList.toggle("hide", !is_visible)


    })


    

})

carregarArtigos();