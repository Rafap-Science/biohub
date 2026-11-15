Foi realizada a criação da página de login com frontend em HTML, CSS e JavaScript e backend Flask.

## ALTERAÇÕES

14/11/2026: 

Foi realizada as seguintes alterações na data referida

* Nova paleta de cores que foi enviada para se adequar ao que foi definido pelo pessoal de 
Biomed
* Adição do -btn no botão de ocultação e visualização de senha
* Mudança de logo

## COMO EXECUTAR O BACKEND

Na pasta principal do projeto, execute:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
python backend/app.py
```

Depois, acesse [http://127.0.0.1:8000](http://127.0.0.1:8000) no navegador.
Para parar o servidor, pressione `Ctrl+C` no terminal.

## CREDENCIAIS DE TESTE

| Matrícula | Senha |
| --- | --- |
| 2024001 | biohub123 |
| 2024002 | biohub456 |
| 2024003 | biohub789 |

## O QUE FOI FEITO

- Validação da matrícula e senha pelo backend.
- Botão para mostrar ou ocultar a senha.
- Indicador de carregamento e mensagens de resultado.

O botão de recuperação de senha informa que a funcionalidade não está
disponível nesta demonstração.

> **Aviso:** as credenciais estão fixas no código e são apenas para testes.
> Esta demonstração não deve ser usada para proteger contas reais.
