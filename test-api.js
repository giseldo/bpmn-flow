// Script de teste para verificar a API do chat
const testApi = async () => {
  console.log("🧪 Testando API do chat...")
  
  try {
    // Teste 1: Verificar se a API está rodando
    console.log("\n📡 Teste 1: Verificando status da API...")
    const statusResponse = await fetch('http://localhost:3000/api/chat', {
      method: 'GET'
    })
    
    if (statusResponse.ok) {
      const status = await statusResponse.json()
      console.log("✅ API está funcionando:", status)
    } else {
      console.error("❌ API não está respondendo")
      return
    }
    
    // Teste 2: Enviar uma mensagem de teste
    console.log("\n🤖 Teste 2: Enviando mensagem de teste...")
    const chatResponse = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Crie um processo simples de aprovação com uma tarefa'
          }
        ],
        currentBpmnXml: null
      })
    })
    
    if (chatResponse.ok) {
      console.log("✅ Resposta da API recebida")
      const responseText = await chatResponse.text()
      console.log("📄 Resposta completa:", responseText.substring(0, 500) + "...")
      
      // Verificar se contém XML
      if (responseText.includes('<BPMN_START>') && responseText.includes('<BPMN_END>')) {
        console.log("✅ XML BPMN encontrado na resposta")
      } else {
        console.log("⚠️ XML BPMN não encontrado na resposta")
      }
    } else {
      console.error("❌ Erro na resposta da API:", chatResponse.status, chatResponse.statusText)
      const errorText = await chatResponse.text()
      console.error("📄 Detalhes do erro:", errorText)
    }
    
  } catch (error) {
    console.error("❌ Erro no teste:", error)
  }
}

// Executar o teste
testApi()
