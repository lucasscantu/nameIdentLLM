# Guia de Contribuição - DocSim

Primeiramente, obrigado por considerar contribuir com o DocSim! Este documento fornece diretrizes e informações sobre como contribuir de forma eficaz.

## Código de Conduta

Ao participar deste projeto, você concorda em manter um ambiente respeitoso e inclusivo. Seja cordial com todos os contribuidores, independentemente de seu nível de experiência.

## Como Posso Contribuir?

### 1. Reportando Bugs

Antes de criar uma issue para reportar um bug:

1. **Verifique se o bug já foi reportado** nas issues existentes
2. **Colete informações** sobre o bug:
   - Passos para reproduzir
   - Comportamento esperado vs. atual
   - Screenshots ou vídeos (se aplicável)
   - Ambiente (SO, navegador, versão do Node.js)
   - Logs de erro

3. **Crie uma issue** usando o template de bug report

### 2. Sugerindo Melhorias

Para sugerir novas funcionalidades ou melhorias:

1. **Verifique se já existe uma issue similar**
2. **Descreva claramente** a melhoria proposta
3. **Explique o benefício** para os usuários
4. **Forneça exemplos** de uso (se aplicável)

### 3. Contribuindo com Código

#### Configuração do Ambiente

```bash
# 1. Fork o repositório
# No GitHub, clique em "Fork"

# 2. Clone seu fork
git clone https://github.com/SEU_USUARIO/docsim.git
cd docsim

# 3. Instale dependências
npm install

# 4. Crie uma branch para sua feature
git checkout -b feature/nome-da-feature

# 5. Faça suas alterações
# ...

# 6. Rode os testes
npm test

# 7. Commit suas alterações
git commit -m "feat: descrição da feature"

# 8. Push para seu fork
git push origin feature/nome-da-feature

# 9. Crie um Pull Request
# No GitHub, vá para seu fork e clique em "New Pull Request"
```

#### Padrões de Código

##### TypeScript
- Use tipagem estática sempre que possível
- Evite `any` - use tipos específicos
- Documente funções públicas com JSDoc
- Siga o estilo do código existente

```typescript
// ✅ Bom
function calculateSimilarity(text1: string, text2: string): number {
  // implementação
}

// ❌ Ruim
function calculateSimilarity(text1: any, text2: any): any {
  // implementação
}
```

##### React
- Use componentes funcionais com hooks
- Nomeie componentes com PascalCase
- Nomeie arquivos de componentes com PascalCase
- Mantenha componentes pequenos e focados

```typescript
// ✅ Bom
export function DocumentCard({ document }: DocumentCardProps) {
  return <div>...</div>;
}

// ❌ Ruim
export default function documentcard(props: any) {
  return <div>...</div>;
}
```

##### CSS/Tailwind
- Use classes do Tailwind CSS
- Evite CSS inline
- Mantenha consistência visual
- Use componentes reutilizáveis

```typescript
// ✅ Bom
<div className="flex items-center gap-3 p-4 rounded-xl bg-white shadow-md">
  ...
</div>

// ❌ Ruim
<div style={{ display: 'flex', padding: '16px', background: 'white' }}>
  ...
</div>
```

##### Testes
- Escreva testes para novas funcionalidades
- Mantenha cobertura de código > 80%
- Use nomes descritivos para testes
- Teste casos de borda

```typescript
// ✅ Bom
it('deve retornar 100 para strings idênticas', () => {
  expect(levenshteinSimilarity('hello', 'hello')).toBe(100);
});

// ❌ Ruim
it('funciona', () => {
  expect(levenshteinSimilarity('a', 'a')).toBe(100);
});
```

#### Mensagens de Commit

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(escopo): <descrição>

[corpo opcional]

[rodapé opcional]
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Formatação, ponto e vírgula, etc.
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Atualizações de build, dependências, etc.

**Exemplos:**
```
feat(algorithms): adicionar algoritmo de Cosine Similarity
fix(ui): corrigir alinhamento do sidebar em mobile
docs(readme): atualizar instruções de instalação
test(storage): adicionar testes para função de tags
refactor(ollama): simplificar lógica de conexão
```

### 4. Melhorando a Documentação

A documentação é crucial! Você pode contribuir:

- Corrigindo erros de digitação
- Clarificando seções confusas
- Adicionando exemplos
- Traduzindo para outros idiomas
- Atualizando informações desatualizadas

### 5. Revisando Pull Requests

Se você tem experiência, pode ajudar revisando PRs de outros contribuidores:

- Verifique se o código segue os padrões
- Teste as mudanças localmente
- Forneça feedback construtivo
- Aprove quando estiver tudo correto

## Áreas que Precisam de Ajuda

### Alta Prioridade
- [ ] Implementar modo escuro
- [ ] Adicionar suporte a mais idiomas
- [ ] Melhorar performance para documentos longos
- [ ] Adicionar testes E2E (Cypress/Playwright)

### Média Prioridade
- [ ] Exportação em PDF
- [ ] Suporte a mais formatos (ODT, EPUB)
- [ ] Integração com LMS (Moodle, Blackboard)
- [ ] Análise de código-fonte

### Baixa Prioridade
- [ ] Plugin system
- [ ] API pública
- [ ] Sincronização em nuvem (opcional)
- [ ] Marketplace de algoritmos

## Processo de Pull Request

1. **Crie uma branch** para sua feature/fix
2. **Faça commits** seguindo os padrões
3. **Rode os testes** localmente
4. **Atualize a documentação** se necessário
5. **Crie o Pull Request** com descrição clara
6. **Aguarde revisão** de mantenedores
7. **Faça ajustes** se solicitado
8. **Aguarde merge**

### Template de Pull Request

```markdown
## Descrição
Descreva suas mudanças de forma clara e concisa.

## Tipo de Mudança
- [ ] Bug fix (mudança que corrige um problema)
- [ ] Nova feature (mudança que adiciona funcionalidade)
- [ ] Breaking change (mudança que quebra compatibilidade)
- [ ] Documentação (mudanças apenas na documentação)

## Checklist
- [ ] Meu código segue os padrões do projeto
- [ ] Adicionei testes para minhas mudanças
- [ ] Todos os testes passam localmente
- [ ] Atualizei a documentação relevante
- [ ] Minhas mudanças não geram novos warnings

## Screenshots (se aplicável)
Adicione screenshots para mudanças visuais.

## Issues Relacionadas
Closes #123
Relates to #456
```

## Estilo de Código

### TypeScript
- **Estrito**: `strict: true` no tsconfig
- **Sem `any`**: Use tipos específicos
- **Interfaces**: Prefira interfaces a types para objetos
- **Enums**: Use const enums quando possível

### React
- **Hooks**: Use hooks para estado e efeitos
- **Context**: Use para estado global (quando necessário)
- **Props**: Tipagem explícita com interfaces
- **Keys**: Sempre use keys únicas em listas

### Testes
- **Vitest**: Framework de testes
- **RTL**: React Testing Library para componentes
- **Cobertura**: Mínimo 80%
- **Nomes**: Descritivos e em português

### Commits
- **Conventional Commits**: Siga o padrão
- **Atomicidade**: Um commit por mudança lógica
- **Mensagens**: Claras e descritivas

## Ambiente de Desenvolvimento

### Requisitos
- Node.js 18+
- npm ou yarn
- Git
- Editor de código (VS Code recomendado)

### Extensões Recomendadas (VS Code)
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Error Lens

### Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build

# Testes
npm test             # Roda testes uma vez
npm run test:watch   # Roda testes em modo watch
npm run test:coverage # Gera relatório de cobertura

# Qualidade
npm run typecheck    # Verificação de tipos
npm run lint         # Linting do código
```

## Dúvidas?

Se tiver dúvidas sobre como contribuir:

1. **Verifique a documentação** existente
2. **Busque nas issues** se já foi discutido
3. **Crie uma issue** com sua pergunta
4. **Entre em contato** com os mantenedores

## Reconhecimento

Todos os contribuidores são reconhecidos no:
- README.md (seção de contribuidores)
- CHANGELOG.md (menção nas mudanças)
- GitHub (lista de contribuidores)

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto (MIT).

---

**Obrigado por contribuir com o DocSim!** 🎉

Sua ajuda é fundamental para tornar este projeto melhor para toda a comunidade acadêmica.
