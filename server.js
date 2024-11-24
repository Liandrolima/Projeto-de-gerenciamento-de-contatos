const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let contatos = [];

// Caminho para o arquivo JSON
const contatosFilePath = path.join(__dirname, 'contatos.json');
console.log('Caminho do arquivo:', contatosFilePath);

// Função para carregar o catálogo do arquivo JSON
const carregarContatos = () => {
  try {
    if (fs.existsSync(contatosFilePath)) {
      const data = fs.readFileSync(contatosFilePath, 'utf8');
      contatos = JSON.parse(data) || [];
    } else {
      fs.writeFileSync(contatosFilePath, JSON.stringify([]), 'utf8');
      contatos = [];
    }
    console.log('contatos carregados:', contatos); // Verifique se os contatos estão sendo carregados corretamente
  } catch (error) {
    console.error('Erro ao carregar o arquivo:', error);
  }
};

// Função para salvar o catálogo no arquivo JSON
const salvarContatos = () => {
  try {
    console.log('Salvando alterações no arquivo...');
    fs.writeFileSync(contatosFilePath, JSON.stringify(contatos, null, 2), 'utf8');
    console.log('Arquivo atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar no arquivo:', error);
  }
};

// Carrega os contatos ao iniciar o servidor
carregarContatos();

// Rota para obter o catálogo de contatos
app.get('/contatos', (req, res) => {
  res.json(contatos);
});

// Rota para adicionar um novo contato com verificação de duplicidade
app.post('/contatos', (req, res) => {
  const { nome, email, telefone } = req.body;

  // Verifica se o contato já existe no catálogo
  const contatoExistente = contatos.find(contato => contato.nome === nome && contato.email === email && contato.telefone === telefone);

  if (contatoExistente) {
    return res.status(400).json({ message: 'Este contato já existe no catálogo.' });
  }

  // Adiciona um ID único ao novo contato
  const novocontato = { ...req.body, id: contatos.length > 0 ? Math.max(...contatos.map(contato => contato.id)) + 1 : 1 };

  contatos.push(novocontato);
  salvarContatos(); // Salva o catálogo no arquivo
  res.status(201).json({ message: 'contato adicionado com sucesso!' });
});

// Rota para atualizar um contato existente
app.put('/contatos/:id', (req, res) => {
  const contatoId = parseInt(req.params.id, 10);
  const contatoAtualizado = req.body;

  const index = contatos.findIndex(contato => contato.id === contatoId);

  if (index !== -1) {
    contatos[index] = { ...contatos[index], ...contatoAtualizado };
    salvarContatos(); // Salva o catálogo atualizado no arquivo
    res.status(200).json({ message: 'contato atualizado com sucesso!' });
  } else {
    res.status(404).json({ message: 'contato não encontrado!' });
  }
});

// Rota para excluir um contato
app.delete('/contatos/:id', (req, res) => {
  const contatoId = parseInt(req.params.id, 10);
  console.log('ID recebido para exclusão:', contatoId);

  const index = contatos.findIndex(contato => contato.id === contatoId);

  if (index !== -1) {
    console.log('contato antes da exclusão:', contatos);
    contatos.splice(index, 1);
    console.log('contato depois da exclusão:', contatos);
    salvarContatos(); // Salva o array atualizado no arquivo contatos.json
    res.status(200).json({ message: 'contato deletado com sucesso!' });
  } else {
    console.log('contato não encontrado!');
    res.status(404).json({ message: 'contato não encontrado!' });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
