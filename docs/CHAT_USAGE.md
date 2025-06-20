# Como Usar o Chat IA para Diagramas BPMN

## 🚀 Visão Geral

O Chat IA permite criar e modificar diagramas BPMN através de conversação natural. Você pode pedir para criar novos processos ou modificar diagramas existentes.

## 📋 Funcionalidades Principais

### 1. Criar Novos Diagramas
- **Exemplo:** "Crie um processo de aprovação de férias"
- **Exemplo:** "Faça um fluxo de compras"
- **Exemplo:** "Processo de onboarding de funcionários"

### 2. Modificar Diagramas Existentes
- **Adicionar elementos:** "Adicione uma tarefa de validação"
- **Modificar elementos:** "Mude o gateway para ser exclusivo"
- **Remover elementos:** "Remova a tarefa de revisão"
- **Reorganizar:** "Simplifique o fluxo"

### 3. Botões de Ação Rápida
- **Criar:** Botões para criar processos comuns
- **Ações:** Botões para adicionar elementos específicos
- **Aplicar:** Botão para aplicar o último diagrama gerado

## 💬 Exemplos de Comandos

### Comandos de Criação
```
"Crie um processo simples de login"
"Faça um fluxo de aprovação de documentos"
"Processo de atendimento ao cliente"
"Fluxo de reembolso de despesas"
```

### Comandos de Modificação
```
"Adicione uma tarefa de validação após o login"
"Modifique o gateway para ter 3 caminhos"
"Adicione um evento de timeout"
"Remova a tarefa de notificação"
"Simplifique o processo removendo etapas desnecessárias"
```

### Comandos Específicos
```
"Adicione um gateway exclusivo"
"Conecte a tarefa de validação ao evento final"
"Mude o nome da tarefa para 'Aprovação Gerencial'"
"Adicione uma subprocesso para validação"
```

## 🎯 Como Aplicar Mudanças

### Método 1: Botão "Aplicar" Individual
1. Faça sua pergunta no chat
2. Aguarde a resposta da IA
3. Clique no botão "Aplicar" na resposta
4. O diagrama será atualizado automaticamente

### Método 2: Botão "Aplicar Último Diagrama"
1. Use este botão para aplicar o último diagrama gerado
2. Útil quando você quer revisar antes de aplicar

### Método 3: Aplicação Automática
- O sistema tenta aplicar automaticamente quando detecta XML válido
- Você verá uma notificação de sucesso ou erro

## 🔧 Configuração

### API Key do DeepSeek
1. Obtenha uma API Key em: https://platform.deepseek.com/
2. Configure a variável de ambiente: `DEEPSEEK_API_KEY`
3. Reinicie o servidor

### Verificação de Status
- O chat mostra o status da conexão
- Verde: Conectado e funcionando
- Vermelho: Erro de configuração
- Amarelo: Testando conexão

## 🎨 Interface do Chat

### Área Principal
- **Mensagens:** Histórico da conversa
- **Input:** Campo para digitar comandos
- **Botões:** Ações rápidas e aplicação

### Botões de Ação Rápida
- **Criar:** Processos comuns pré-definidos
- **Ações:** Modificações específicas
- **Aplicar:** Aplicar mudanças ao diagrama

### Feedback Visual
- **Sucesso:** Borda verde no modeler
- **Erro:** Borda vermelha no modeler
- **Status:** Notificações no chat

## 🚨 Solução de Problemas

### Chat não responde
1. Verifique se a API Key está configurada
2. Teste a conexão com o botão "Testar"
3. Verifique os logs do console

### Diagrama não atualiza
1. Clique no botão "Aplicar" na resposta
2. Verifique se o XML foi gerado corretamente
3. Tente o botão "Aplicar Último Diagrama"

### XML inválido
1. Reformule sua pergunta
2. Use comandos mais específicos
3. Verifique se o processo faz sentido

## 💡 Dicas de Uso

### Para Melhores Resultados
1. **Seja específico:** "Adicione uma tarefa de validação" em vez de "adiciona algo"
2. **Use termos BPMN:** "gateway", "tarefa", "evento", "subprocesso"
3. **Descreva o fluxo:** "Após a aprovação, notifique o usuário"
4. **Mantenha contexto:** O chat lembra do diagrama atual

### Comandos Avançados
```
"Crie um processo com subprocesso de validação"
"Adicione um gateway paralelo com 3 caminhos"
"Modifique o processo para incluir loop de aprovação"
"Adicione eventos de timer e mensagem"
```

## 🔄 Fluxo de Trabalho Recomendado

1. **Criar:** Use comandos de criação para iniciar
2. **Modificar:** Use comandos específicos para ajustar
3. **Aplicar:** Clique em "Aplicar" para ver as mudanças
4. **Iterar:** Continue modificando até ficar satisfeito
5. **Salvar:** Use o botão "Salvar Processo" no editor

## 📞 Suporte

Se você encontrar problemas:
1. Verifique os logs no console do navegador
2. Teste com comandos simples primeiro
3. Verifique a configuração da API Key
4. Consulte a documentação do bpmn.io para referência 