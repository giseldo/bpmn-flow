# ProcessFlow - Modelador de Processos BPMN

Plataforma profissional para modelagem, execução e gestão de processos BPMN 2.0. Transforme suas ideias em fluxos de trabalho eficientes com a tecnologia bpmn.io e inteligência artificial.

## ✨ Features

- **Editor BPMN 2.0**: Interface profissional powered by bpmn.io
- **Chat IA**: Geração inteligente de diagramas via DeepSeek AI
- **Execução de Processos**: Runtime para execução de workflows
- **Dashboard**: Visualização e gestão de processos
- **Autenticação**: Sistema de login com diferentes perfis
- **Responsivo**: Interface adaptável para desktop e mobile

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **BPMN**: bpmn.io (Camunda Modeler)
- **IA**: DeepSeek API (DeepSeek Chat, DeepSeek Coder)
- **Deploy**: Vercel

## 🤖 AI Integration

### DeepSeek AI
- **Provider**: DeepSeek API
- **Model**: DeepSeek Chat (padrão - mais rápido)
- **Features**: Intelligent BPMN generation, context awareness
- **Language**: Portuguese (Brazilian)
- **Performance**: 1-3 segundos de resposta

### Chat IA - Criar e Modificar Diagramas

O Chat IA permite criar e modificar diagramas BPMN através de conversação natural. Você pode:

#### 🎯 Funcionalidades Principais
- **Criar novos diagramas** com comandos simples
- **Modificar diagramas existentes** adicionando, removendo ou alterando elementos
- **Aplicar mudanças** com um clique
- **Usar botões de ação rápida** para tarefas comuns

#### 💬 Exemplos de Uso

**Criar novos processos:**
\`\`\`
"Crie um processo de aprovação de férias"
"Faça um fluxo de compras"
"Processo de onboarding de funcionários"
\`\`\`

**Modificar diagramas existentes:**
\`\`\`
"Adicione uma tarefa de validação"
"Modifique o gateway para ser exclusivo"
"Remova a tarefa de revisão"
"Simplifique o fluxo"
\`\`\`

#### 🎨 Interface do Chat
- **Botão "Aplicar"**: Aplica mudanças individuais
- **Botão "Aplicar Último Diagrama"**: Aplica o último diagrama gerado
- **Botões de ação rápida**: Para tarefas comuns
- **Feedback visual**: Bordas coloridas indicam sucesso/erro

#### 📖 Documentação Completa
Consulte [docs/CHAT_USAGE.md](./docs/CHAT_USAGE.md) para um guia detalhado de uso.

## 📚 Usage

### Creating Diagrams with AI
1. Open the process editor
2. Click the chat button (bottom right)
3. Describe your process in Portuguese
4. AI generates BPMN diagram automatically

### Example Prompts
\`\`\`
"Crie um processo de aprovação de compras"
"Adicione um gateway de decisão"
"Modifique o fluxo para incluir validação"
"Crie um processo de onboarding de funcionários"
\`\`\`

### Manual Editing
1. Use the bpmn.io palette (left sidebar)
2. Drag elements to the canvas
3. Connect elements by dragging between them
4. Double-click to edit properties

## 🔧 Configuration

### Environment Variables
Create `.env.local` for AI features:
\`\`\`bash
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_MODEL=deepseek-chat
\`\`\`

### Available Models
- `deepseek-chat` (default)
- `deepseek-coder`
- `deepseek-chat-33b`

## 📖 Documentation

- [Setup Guide](./SETUP.md) - Configuração da API DeepSeek
- [Chat Usage Guide](./docs/CHAT_USAGE.md) - Como usar o Chat IA para diagramas
- [BPMN.io Documentation](https://bpmn.io/) - Editor features
- [DeepSeek API Documentation](https://platform.deepseek.com/api-docs) - AI models

## 🚀 Deployment

Your project is live at:

**[https://vercel.com/giseldos-projects/v0-business-process-modeler](https://vercel.com/giseldos-projects/v0-business-process-modeler)**

## 🔄 Development

Continue building your app on:

**[https://v0.dev/chat/projects/ATjDivOFg16](https://v0.dev/chat/projects/ATjDivOFg16)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Configure your environment variables
4. Start building with AI-powered BPMN modeling

## 🎯 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- DeepSeek API key

### Installation
\`\`\`bash
# Clone the repository
git clone <repository-url>
cd bpmn-flow

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your DeepSeek API key

# Start development server
pnpm dev
\`\`\`

### API Key Setup
1. Visit [platform.deepseek.com](https://platform.deepseek.com)
2. Create an account and get your API key
3. Add `DEEPSEEK_API_KEY=your_key_here` to `.env.local`
4. Restart the development server

## 🏗️ Project Structure

\`\`\`
bpmn-flow/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── dashboard/         # Dashboard pages
│   ├── landing/           # Landing page
│   ├── process-editor/    # BPMN editor
│   └── process-execution/ # Process execution
├── components/            # Shared UI components
├── lib/                   # Utilities
└── public/               # Static assets
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the BPMN.io resources

---

**Built with ❤️ using Next.js, bpmn.io, and DeepSeek AI**
