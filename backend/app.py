import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client

#! LEITURA DO ARQUIVO .ENV POR FUNCAO ESPECIFICA
load_dotenv()

#! CARREGA AS VARIAVEIS DO ENV PARA O CODIGO MAIN DO app.py
url = os.getenv('SUPABASE_URL')
chave = os.getenv('SUPABASE_KEY')

#! Este e o cliente que fala com o Supabase
supabase = create_client(url, chave) 

#? Comando para Inicializar o servidor Flask
app = Flask(__name__)
CORS(app)

# Rota básica de teste
@app.route('/')
def home():
    return 'Bem vindo a API da LAB'

@app.route('/api/posts')
def listar_posts():
    resposta = supabase.table('posts').select('*').execute()
    return jsonify(resposta.data)

if __name__ == '__main__':
    app.run(debug=True)