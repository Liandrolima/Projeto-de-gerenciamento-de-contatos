async function listarContatos() {
    try {
      const response = await fetch('http://localhost:3000/contatos');
      const contatos = await response.json();
  
      const contatoList = document.getElementById('contatoList');
      contatoList.innerHTML = ''; // Limpa a lista antes de exibir
  
      contatos.forEach(contato => {
        const li = document.createElement('li');
        li.innerHTML = `
         
          <div class="contato-item">
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
              
              <button class="save" style="display: none;">Salvar Alterações</button>
              <button class="delete">Excluir contato</button>
            </div>
          </div>
        `;
  
        const select = li.querySelector('.tarefa');
        const saveButton = li.querySelector('.save');
        const deleteButton = li.querySelector('.delete');
  
        // Mostrar o campo de entrada e o botão de salvar quando um campo for selecionado
        select.addEventListener('change', function() {
          const selectedStatus = this.value;
          let targetValue;
  
          // Define o valor correspondente com base no campo selecionado
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
              return; // Caso nenhum valor válido seja selecionado
          }
  
          let newText;
  
          newText = prompt(`Edite ${selectedStatus}:`, targetValue);
  
          // Atualiza o valor do contato com o que foi editado
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
  
            saveButton.style.display = 'inline'; // Mostra o botão de salvar
          }
        });
  
        // Função para salvar alterações
        saveButton.addEventListener('click', async function() {
          try {
            // Atualiza o objeto `contato` com os novos valores
            const contatoModificado = { ...contato };
  
            const response = await fetch(`http://localhost:3000/contatos/${contato.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(contatoModificado), // Envia o objeto contato atualizado
            });
  
            if (response.ok) {
              alert("Alterações salvas com sucesso!");
              listarContatos(); // Atualiza a lista para refletir as mudanças
            } else {
              alert("Erro ao salvar as alterações.");
            }
          } catch (error) {
            console.error("Erro ao salvar o contato:", error);
          }
        });
  
        // Função para excluir contato
        deleteButton.addEventListener('click', async () => {
          if (confirm('Tem certeza que deseja excluir este contato?')) {
            try {
              await fetch(`http://localhost:3000/contatos/${contato.id}`, {
                method: 'DELETE'
              });
              alert('contato excluído com sucesso!');
              listarContatos(); // Atualiza a lista após a exclusão
            } catch (error) {
              console.error('Erro ao excluir o contato:', error);
            }
          }
        });
  
        contatoList.appendChild(li);
      });
    } catch (error) {
      console.error('Erro ao buscar os contatos:', error);
    }
  }
  
  // Executa a função quando a página for carregada
  listarContatos();
  