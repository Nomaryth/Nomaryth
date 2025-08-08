# Auditoria de Segurança - Rotas da API

## 🔴 Problemas Críticos Identificados

### 1. `/api/news` - EXPOSIÇÃO DE DADOS SENSÍVEIS
**Status:** ✅ CORRIGIDO
- **Problema:** Retorna `firebaseId` publicamente
- **Risco:** Permite identificação de documentos internos do Firebase
- **Impacto:** Baixo (IDs não são secretos, mas expõem estrutura interna)
- **Correção:** Removido `firebaseId` da resposta pública

### 2. `/api/stats` - SEM AUTENTICAÇÃO
**Status:** ✅ CORRIGIDO
- **Problema:** POST não requer autenticação
- **Risco:** Qualquer pessoa pode modificar estatísticas
- **Impacto:** Médio (dados podem ser manipulados)
- **Correção:** Adicionada autenticação + verificação de admin

## 🟡 Rotas que Precisam de Melhorias

### 3. `/api/weather` e `/api/geolocation`
**Status:** ✅ SEGURO (para uso público)
- **Justificativa:** APIs de dados públicos, sem informações sensíveis
- **Recomendação:** Manter como está

### 4. `/api/map`
**Status:** ✅ SEGURO
- **Justificativa:** Dados estáticos do mapa, sem informações sensíveis

## 🟢 Rotas Seguras

### 5. Rotas com Autenticação Adequada:
- `/api/users` - ✅ Requer token + admin
- `/api/factions` - ✅ Requer token
- `/api/docs` - ✅ Requer token + admin
- `/api/set-admin` - ✅ Requer token + admin
- `/api/notifications` - ✅ Requer token
- `/api/admin/announcements` - ✅ Requer token + admin
- `/api/news` (POST/DELETE) - ✅ Requer token

## 🔧 Correções Necessárias

### 1. Remover firebaseId da resposta pública de `/api/news`
```typescript
// Em src/app/api/news/route.ts - GET
// Remover firebaseId do retorno público
return NextResponse.json(news.map(item => {
  const { firebaseId, ...publicItem } = item;
  return publicItem;
}));
```

### 2. Adicionar autenticação ao POST de `/api/stats`
```typescript
// Em src/app/api/stats/route.ts - POST
// Adicionar verificação de token + admin
```

### 3. Implementar rate limiting mais rigoroso
```typescript
// Em src/middleware.ts
// Reduzir limites para APIs sensíveis
```

## 📊 Resumo de Segurança

| Rota | Método | Autenticação | Admin | Status |
|------|--------|--------------|-------|--------|
| `/api/news` | GET | ❌ | ❌ | ✅ PÚBLICO |
| `/api/news` | POST | ✅ | ❌ | 🟢 SEGURO |
| `/api/stats` | GET | ❌ | ❌ | ✅ PÚBLICO |
| `/api/stats` | POST | ✅ | ✅ | 🟢 SEGURO |
| `/api/users` | GET | ✅ | ✅ | 🟢 SEGURO |
| `/api/factions` | POST | ✅ | ❌ | 🟢 SEGURO |
| `/api/docs` | POST | ✅ | ✅ | 🟢 SEGURO |
| `/api/weather` | GET | ❌ | ❌ | ✅ PÚBLICO |
| `/api/geolocation` | GET | ❌ | ❌ | ✅ PÚBLICO |
| `/api/map` | GET | ❌ | ❌ | ✅ PÚBLICO |

## 🎯 Status das Correções

1. **✅ CONCLUÍDO:** Remover `firebaseId` de `/api/news` GET
2. **✅ CONCLUÍDO:** Adicionar autenticação ao POST de `/api/stats`
3. **🔄 PENDENTE:** Implementar rate limiting mais rigoroso
4. **🔄 PENDENTE:** Adicionar logs de auditoria para ações administrativas

## 🔐 Recomendações Gerais

1. **Princípio do Menor Privilégio:** Expor apenas dados necessários
2. **Validação de Entrada:** Implementar validação rigorosa em todas as rotas
3. **Rate Limiting:** Aplicar limites mais baixos para operações sensíveis
4. **Logs de Auditoria:** Registrar todas as ações administrativas
5. **Headers de Segurança:** Manter CSP e outros headers de segurança
