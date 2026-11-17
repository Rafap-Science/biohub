import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const db = createClient(
  'https://fbtazspzewrgoadtxgnh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZidGF6c3B6ZXdyZ29hZHR4Z25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyODY0NTIsImV4cCI6MjEwODg2MjQ1Mn0.7X86tjZmM_6la-vthlNrGu0Wbdl7KsbrqPcBBXqM8tI'
);

const lista = document.getElementById('lista-artigos');






function criarCard(info_banco) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <a>
      <div class="card_imagem">
        <img src="" alt="EXEMPLO" class="imagem_cortada" >
      </div>
    
      <div class="artigo_intro">
        <h3></h3><p></p>
      </div>
    </a>`
  card.querySelector('h3').textContent = info_banco.titulo;
  card.querySelector('p').textContent = info_banco.sub_titulo ?? '';
  card.querySelector('a').href = info_banco.link_artigo ?? '#';
  card.querySelector('img').src = info_banco.imagem;
  return card;
}

async function carregarArtigos() {
  const { data, error } = await db
    .from('artigos')
    .select('titulo, sub_titulo, link_artigo,imagem')
    .order('id', { ascending: false });
  if (error) return console.error(error);

  lista.replaceChildren(...data.map(criarCard));
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