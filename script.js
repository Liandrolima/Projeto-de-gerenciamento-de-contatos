const contatoGeral = [];

async function carregarCatalogo() {
  try {
    const response = await fetch('http://localhost:3000/contatos');
    const contatos = await response.json();
    console.log(contatos);
    contatoGeral.push(...contatos);
  } catch (error) {
    console.error('Erro ao carregar os contatos:', error);
  }
}

document.querySelector('#contatoForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const nome = document.querySelector('#contatoNome').value;
  const email = document.querySelector('#contatoEmail').value;
  const telefone = document.querySelector('#contatoTelefone').value;
  

  const contato = { nome, email, telefone };

  try {
    // Enviar o contato para a API (backend)
    const response = await fetch('http://localhost:3000/contatos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contato),
    });

    if (response.ok) {
      alert('contato adicionado com sucesso!');
      // Atualiza o catálogo local com o contato recém-adicionado
      const contatoAdicionado = await response.json();
      contatoGeral.push(contatoAdicionado);
    } else {
      const errorData = await response.json();
      alert(errorData.message); // Exibe a mensagem de erro do backend
    }
  } catch (error) {
    console.error('Erro ao salvar o contato:', error);
  }

  document.querySelector('#contatoForm').reset(); // Limpar o formulário
});


async function buscarContato(filtro = '') {
  const contatoList = document.querySelector('#contatoList');
  contatoList.innerHTML = '';  // Limpa a lista de contatos

  if (!filtro.trim()) {
    alert('Por favor, digite o nome do contato ou do email para buscar')
    return;
  }

  // Verifique se o catálogo foi carregado corretamente
  if (contatoGeral.length === 0) {
    alert('Não há contatos carregados no catálogo')
    return;
  }

  // Cria uma expressão regular que busca a palavra completa no filtro
  const regex = new RegExp(`\\b${filtro.toLowerCase()}\\b`, 'i'); // 'i' para ignorar maiúsculas/minúsculas

  // Filtra os contatos com base no título ou email
  const contatosFiltrados = contatoGeral.filter(contato => 
    regex.test(contato.nome.toLowerCase()) || 
    regex.test(contato.email.toLowerCase())
  );

  // Se houver contatos filtrados, exibe-os
  if (contatosFiltrados.length > 0) {
    contatosFiltrados.forEach((contato, index) => {
      const listItem = document.createElement('li');
      listItem.innerHTML = ` 
        <li class="contato-item">
          <div class="contato-info">
            <span class="nome"><strong>NOME:</strong> <em>${contato.nome.toUpperCase()}</em></span>
            <span class="email"><strong>EMAIL:</strong> <em>${contato.email.toUpperCase()}</em></span>
            <span class="telefone"><strong>TELEFONE:</strong> <em>${contato.telefone.toUpperCase()}</em></span>
            
          </div>

          <div class="contato-actions">
            <select class="tarefa">
              <option value="status">Editar Campo</option>
              <option value="nome">Nome</option>
              <option value="email">Email</option>
              <option value="telefone">Telefone</option>
              
            </select>
            
            <button class="save">Salvar Alterações</button>
            <button class="delete">Excluir contato</button>
          </div>
        </li>
      `;

      // Eventos para editar e salvar alterações do contato
      listItem.querySelector('.tarefa').addEventListener('change', function() {
        const selectedStatus = this.value;
        let targetValue;
      
        switch (selectedStatus) {
          case 'nome':
            targetValue = contato.nome.toUpperCase();
            break;
          case 'email':
            targetValue = contato.email.toUpperCase();
            break;
          case 'telefone':
            targetValue = contato.telefone.toUpperCase();
            break;          
          default:
            return;
        }

        let newText;
        newText = prompt(`Edite ${selectedStatus}:`, targetValue);
        

        if (newText !== null && newText !== '') {
          switch (selectedStatus) {
            case 'nome':
              contato.nome = newText;
              break;
            case 'email':
              contato.email = newText;
              break;
            case 'telefone':
              contato.telefone = newText;
              break;
            
          }
        }
      });
      
      listItem.querySelector('.save').addEventListener('click', async function() {
        try {
          const contatoModificado = { ...contato }; 
          const response = await fetch(`http://localhost:3000/contatos/${contato.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(contatoModificado),
          });

          if (response.ok) {
            alert("Alterações salvas com sucesso!");
            contatoGeral[index] = { ...contatoModificado };
            buscarContato(filtro); // Atualiza a lista
          } else {
            console.error("Erro ao salvar as alterações");
          }
        } catch (error) {
          console.error("Erro ao salvar o contato:", error);
        }
      });

      listItem.querySelector('.delete').addEventListener('click', async function() {
        const confirmDelete = confirm("Tem certeza de que deseja excluir este contato?");
        if (confirmDelete) {
          try {
            const response = await fetch(`http://localhost:3000/contatos/${contato.id}`, {
              method: 'DELETE',
            });

            if (response.ok) {
              alert("contato excluído com sucesso!");
              contatoGeral.splice(index, 1);
              buscarContato(filtro); // Atualiza a lista
            } else {
              console.error("Erro ao excluir o contato");
            }
          } catch (error) {
            console.error('Erro ao excluir o contato:', error);
          }
        }
      });

      contatoList.appendChild(listItem);
    });
  } else {
    contatoList.innerHTML = '<p>Nenhum contato encontrado.</p>';
  }
}

document.querySelector('#buscarContatoBtn').addEventListener('click', async () => {
  const filtro = document.querySelector('#buscaInput').value;
  
  // Espera o catálogo ser carregado antes de buscar
  if (contatoGeral.length === 0) {
    await carregarCatalogo(); // Carrega os contatos se o catálogo estiver vazio
  }
  
  buscarContato(filtro); // Realiza a busca após o catálogo estar carregado
});



