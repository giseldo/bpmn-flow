# Configuração da API DeepSeek

Esta aplicação usa a API do DeepSeek para geração inteligente de diagramas BPMN.

## 🚀 Configuração Rápida

### 1. Obter API Key do DeepSeek

1. Acesse [platform.deepseek.com](https://platform.deepseek.com)
2. Crie uma conta ou faça login
3. Vá para "API Keys" no menu lateral
4. Clique em "Create API Key"
5. Copie a chave gerada

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# DeepSeek API Configuration
DEEPSEEK_API_KEY=sua_chave_api_aqui

# Model Configuration (opcional)
DEEPSEEK_MODEL=deepseek-chat
```

### 3. Reiniciar a Aplicação

```bash
npm run dev
# ou
pnpm dev
```

## 🎯 Modelos Disponíveis

- `deepseek-chat` (padrão - mais rápido)
- `deepseek-coder` (especializado em código)
- `deepseek-chat-33b` (mais preciso)

## 🔍 Verificação

A aplicação mostrará automaticamente:
- ✅ **DeepSeek**: Quando conectado à API do DeepSeek
- ❌ **Configurar API**: Quando a API key não está configurada

## 🛠️ Solução de Problemas

### Erro de API Key
```
❌ API Chat: API Key do DeepSeek não configurada
```
**Solução**: Verifique se a `DEEPSEEK_API_KEY` está correta no `.env.local`

### Erro de Conexão
```
❌ API Chat: Erro no DeepSeek: Network error
```
**Solução**: Verifique sua conexão com a internet

## 🔒 Segurança

- A API key nunca é exposta no frontend
- Todas as requisições passam pelo servidor Next.js
- O arquivo `.env.local` está no `.gitignore`

## 📈 Performance

- ⚡ Resposta em 1-3 segundos
- 🧠 Geração inteligente
- 🔄 Contexto mantido
- 📱 Requer internet

## 🎉 Pronto!

Após configurar a API key do DeepSeek, você terá acesso ao poder da IA para criar diagramas BPMN inteligentes e personalizados! 