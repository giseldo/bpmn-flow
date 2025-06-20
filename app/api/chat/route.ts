export async function POST(req: Request) {
  try {
    console.log("🚀 API Chat: Iniciando requisição")

    const body = await req.json()
    console.log("📝 API Chat: Body recebido:", {
      messagesCount: body.messages?.length || 0,
      hasCurrentBpmnXml: !!body.currentBpmnXml,
    })

    const { messages, currentBpmnXml } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("❌ API Chat: Messages inválidas")
      return new Response(
        JSON.stringify({
          error: "Messages são obrigatórias",
          details: "O array de mensagens deve conter pelo menos uma mensagem",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Log da estrutura das mensagens para debug
    console.log("🔍 API Chat: Estrutura das mensagens recebidas:", messages.map(msg => ({
      role: msg.role,
      hasContent: !!msg.content,
      contentLength: msg.content?.length || 0
    })))

    // Verificar se a API key do DeepSeek está configurada
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY
    const deepseekModel = process.env.DEEPSEEK_MODEL || 'deepseek-chat'
    
    if (!deepseekApiKey || deepseekApiKey === 'your_deepseek_api_key_here') {
      console.error("❌ API Chat: API Key do DeepSeek não configurada")
      return new Response(
        JSON.stringify({
          error: "API Key do DeepSeek não configurada",
          details: "Configure a variável de ambiente DEEPSEEK_API_KEY para usar o chat IA",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log("🤖 API Chat: Usando DeepSeek AI")
    console.log(`🎯 Modelo configurado: ${deepseekModel}`)
    
    // Preparar o payload da requisição
    const requestPayload = {
      model: deepseekModel,
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em BPMN (Business Process Model and Notation) que ajuda usuários a criar e modificar diagramas de processos de negócio.

Suas respostas devem:
1. Ser em português brasileiro
2. Gerar XML BPMN válido e bem formatado
3. Usar a estrutura <BPMN_START>XML_AQUI<BPMN_END> para delimitar o XML
4. SEMPRE incluir o XML BPMN na resposta quando o resultado for um diagrama.

${currentBpmnXml ? `DIAGRAMA ATUAL:\n${currentBpmnXml}` : 'Nenhum diagrama BPMN foi fornecido. Comece um novo.'}

INSTRUÇÕES IMPORTANTES:
- Se o usuário pedir para criar um NOVO diagrama (ex: "crie um processo do zero", "faça um diagrama simples"): IGNORE o diagrama atual (se existir) e gere um XML BPMN completamente novo a partir do pedido.
- Se o usuário pedir para MODIFICAR o diagrama atual (ex: "adicione uma tarefa", "remova o evento"): use o DIAGRAMA ATUAL como base e aplique as modificações.
- SEMPRE responda com o XML BPMN completo e válido, não apenas fragmentos.

EXEMPLOS DE RESPOSTAS:
- "Crie um processo de aprovação" (com diagrama em branco) → XML completo do processo de aprovação.
- "Adicione uma tarefa de revisão" (com diagrama existente) → XML completo do diagrama existente COM a nova tarefa.
- "Comece de novo com um processo de compras" (com diagrama existente) → XML completo do processo de compras, ignorando o anterior.

Lembre-se: demarque o início e o fim do código XML com <BPMN_START> e <BPMN_END>.`
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }

    console.log("📤 API Chat: Enviando requisição para DeepSeek:", {
      model: deepseekModel,
      messagesCount: requestPayload.messages.length,
      temperature: requestPayload.temperature,
      maxTokens: requestPayload.max_tokens
    })

    // Log detalhado do payload para debug
    console.log("🔍 API Chat: Payload detalhado:", JSON.stringify(requestPayload, null, 2))

    // Usar DeepSeek via API REST
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    })

    console.log("📥 API Chat: Resposta do DeepSeek recebida:", {
      status: deepseekResponse.status,
      statusText: deepseekResponse.statusText,
      ok: deepseekResponse.ok
    })

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text()
      console.error("❌ API Chat: Erro detalhado do DeepSeek:", {
        status: deepseekResponse.status,
        statusText: deepseekResponse.statusText,
        errorText: errorText.substring(0, 500) // Limitar o tamanho do log
      })
      throw new Error(`DeepSeek API error: ${deepseekResponse.status} ${deepseekResponse.statusText} - ${errorText}`)
    }

    const data = await deepseekResponse.json()
    const aiResponse = data.choices[0]?.message?.content || ''
    
    // Log detalhado da resposta da IA
    console.log("🤖 API Chat: Resposta completa da IA recebida:")
    console.log("📄 Conteúdo da resposta:", aiResponse)
    console.log("📊 Estatísticas da resposta:", {
      totalLength: aiResponse.length,
      hasBpmnStart: aiResponse.includes('<BPMN_START>'),
      hasBpmnEnd: aiResponse.includes('<BPMN_END>'),
      bpmnStartIndex: aiResponse.indexOf('<BPMN_START>'),
      bpmnEndIndex: aiResponse.indexOf('<BPMN_END>')
    })
    
    console.log("✅ API Chat: Resposta do DeepSeek processada")

    // Extrair XML BPMN da resposta da IA
    const xmlMatch = aiResponse.match(/<BPMN_START>([\s\S]*?)<BPMN_END>/)
    let bpmnXml = ""
    let response = aiResponse

    if (xmlMatch && xmlMatch[1]) {
      bpmnXml = xmlMatch[1].trim()
      response = aiResponse.replace(/<BPMN_START>[\s\S]*?<BPMN_END>/, '').trim()
      
      // Log detalhado do XML extraído
      console.log("✅ API Chat: XML BPMN extraído com sucesso")
      console.log("📋 XML extraído:", bpmnXml)
      console.log("📏 Tamanho do XML:", bpmnXml.length)
      console.log("🔍 Verificações do XML:", {
        hasXmlDeclaration: bpmnXml.includes('<?xml'),
        hasBpmnNamespace: bpmnXml.includes('xmlns:bpmn'),
        hasDefinitions: bpmnXml.includes('<bpmn:definitions'),
        hasProcess: bpmnXml.includes('<bpmn:process'),
        hasStartEvent: bpmnXml.includes('<bpmn:startEvent'),
        hasEndEvent: bpmnXml.includes('<bpmn:endEvent'),
        hasTask: bpmnXml.includes('<bpmn:task'),
        hasGateway: bpmnXml.includes('<bpmn:gateway')
      })
    } else {
      // Se não encontrou XML, retornar erro
      console.log("⚠️ API Chat: XML não encontrado na resposta da IA")
      console.log("🔍 Tentativa de extração falhou. Conteúdo da resposta:")
      console.log(aiResponse.substring(0, 1000)) // Primeiros 1000 caracteres
      response = "Desculpe, não consegui gerar um diagrama BPMN válido. Tente reformular sua solicitação."
      bpmnXml = ""
    }

    // Log final antes do retorno
    console.log("📤 API Chat: Preparando resposta final:", {
      responseLength: response.length,
      bpmnXmlLength: bpmnXml.length,
      hasBpmnXml: !!bpmnXml
    })

    // Retornar resposta JSON simples (sem stream)
    return new Response(
      JSON.stringify({
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        bpmnXml: bpmnXml
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    )

  } catch (error) {
    console.error("❌ API Chat: Erro geral:", error)
    return new Response(
      JSON.stringify({
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

// Handler para GET (teste)
export async function GET() {
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY
  const deepseekModel = process.env.DEEPSEEK_MODEL || 'deepseek-chat'
  const hasDeepseekKey = deepseekApiKey && deepseekApiKey !== 'your_deepseek_api_key_here'
  
  return new Response(
    JSON.stringify({
      status: "API Chat funcionando",
      mode: hasDeepseekKey ? "DeepSeek AI" : "API Key não configurada",
      deepseekConfigured: hasDeepseekKey,
      model: hasDeepseekKey ? deepseekModel : "N/A",
      timestamp: new Date().toISOString(),
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  )
}
