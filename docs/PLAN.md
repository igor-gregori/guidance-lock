# Guidance Lock — Simulador de Guidance de Mísseis

## Visão Geral

Aplicação web interativa que simula e compara algoritmos de guidance de mísseis perseguidores em 2D. O usuário pode visualizar em tempo real como diferentes "cérebros" de mísseis se comportam ao perseguir um alvo que executa manobras evasivas.

Deploy via GitHub Pages.

---

## Objetivos

1. Implementar múltiplos algoritmos de guidance clássicos.
2. Visualizar a simulação em tempo real com canvas 2D.
3. Permitir comparação lado a lado dos algoritmos no mesmo cenário.
4. Permitir configuração de parâmetros (velocidades, G-limit, manobras do alvo).
5. Exibir métricas de desempenho (miss distance, tempo até intercepção, consumo de energia de manobra).

---

## Algoritmos de Guidance

| # | Nome | Descrição |
|---|------|-----------|
| 1 | **Pure Pursuit (PP)** | Míssil aponta sempre diretamente para a posição atual do alvo. Simples mas ineficiente — gera curvas longas. |
| 2 | **Lead Pursuit (LP)** | Míssil aponta para uma posição estimada à frente do alvo, baseado na velocidade atual dele. |
| 3 | **Proportional Navigation (PN)** | Taxa de giro do míssil é proporcional à taxa de rotação da Line of Sight (LOS). Padrão real de mísseis. |
| 4 | **Augmented Proportional Navigation (APN)** | PN com termo adicional que compensa a aceleração do alvo. Melhor contra alvos manobrando. |

---

## Funcionalidades

### Fase 1 — Core
- Simulação 2D com canvas (posição, velocidade, aceleração).
- Implementação do Pure Pursuit e Proportional Navigation.
- Alvo com trajetória reta e controle manual (mouse/teclado).
- Trail visual (rastro) do míssil e do alvo.
- Indicador de hit/miss.

### Fase 2 — Comparação
- Múltiplos mísseis simultâneos (um por algoritmo, cores diferentes).
- Painel de métricas: miss distance, tempo, aceleração total gasta.
- Replay do cenário com diferentes algoritmos.

### Fase 3 — Realismo
- G-limit (aceleração lateral máxima do míssil).
- Velocidade máxima e aceleração finita.
- Campo de visão do seeker (cone frontal limitado).
- Atraso de sensor (latência na atualização da posição do alvo).

### Fase 4 — Manobras Evasivas
- Alvo com manobras pré-programadas: break turn, jinking, barrel roll (2D equivalent).
- Alvo controlado por IA simples (foge na direção ótima).
- Seleção de cenários predefinidos.

### Fase 5 — Análise (Bônus)
- Monte Carlo: rodar N simulações com variações aleatórias.
- Gráficos de miss distance por cenário/algoritmo.
- Zona de engajamento: visualizar envelope de sucesso (ângulo vs distância).

---

## Stack Técnica

| Componente | Escolha | Justificativa |
|------------|---------|---------------|
| Linguagem | TypeScript | Type safety, melhor DX. |
| Build | Vite | Rápido, zero-config para TS, output estático para GitHub Pages. |
| Rendering | HTML Canvas 2D (nativo) | Leve, sem dependências, controle total. |
| UI/Controles | HTML/CSS nativo | Sliders, botões — não precisa de framework UI pra isso. |
| Gráficos/Métricas | Chart.js ou similar | Para gráficos de análise na Fase 5. |
| Deploy | GitHub Pages (via `gh-pages` branch ou GitHub Actions) | Gratuito, simples. |

> **Nota:** Sem React/Vue/framework de UI. A aplicação é fundamentalmente um canvas com controles simples — frameworks adicionariam complexidade sem benefício.

---

## Estrutura de Arquivos (proposta)

```
guidance-lock/
├── docs/
│   └── PLAN.md
├── src/
│   ├── main.ts              # Entry point, setup canvas e loop
│   ├── simulation.ts        # Loop de simulação (tick, update, render)
│   ├── entities/
│   │   ├── missile.ts       # Estado e física do míssil
│   │   └── target.ts        # Estado e física do alvo
│   ├── guidance/
│   │   ├── types.ts         # Interface GuidanceAlgorithm
│   │   ├── pure-pursuit.ts
│   │   ├── lead-pursuit.ts
│   │   ├── proportional-nav.ts
│   │   └── augmented-pn.ts
│   ├── math/
│   │   └── vector.ts        # Classe/funções de vetor 2D
│   ├── renderer.ts          # Desenho no canvas (trails, entidades, HUD)
│   └── ui.ts                # Controles HTML (sliders, botões, métricas)
├── index.html
├── style.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Física da Simulação

- **Timestep fixo** (ex: dt = 1/60s) com acumulador para desacoplar do framerate.
- **Modelo cinemático simplificado:**
  - Posição += Velocidade × dt
  - Velocidade += Aceleração × dt
  - Aceleração determinada pelo algoritmo de guidance (limitada pelo G-limit).
- **Detecção de intercepção:** distância míssil-alvo < raio de kill.
- **Condição de miss:** míssil ultrapassou o alvo (distância começou a aumentar) ou saiu da área.

---

## Interface do Usuário

```
┌─────────────────────────────────────────────────┐
│  [Canvas de Simulação]                          │
│                                                 │
│    ★ alvo                                       │
│         ·····                                   │
│              ····  ← trail                      │
│                  🚀 míssil                      │
│                                                 │
├─────────────────────────────────────────────────┤
│  Controles:                                     │
│  [▶ Play] [⏸ Pause] [↺ Reset] [Speed: 1x ▾]  │
│  Algoritmo: [PP] [LP] [PN] [APN] [Todos]       │
│  Velocidade míssil: ├────●────┤ 300 m/s        │
│  Velocidade alvo:   ├──●──────┤ 200 m/s        │
│  G-limit:           ├──────●──┤ 30g            │
│  Manobra do alvo:   [Reto ▾]                    │
├─────────────────────────────────────────────────┤
│  Métricas:                                      │
│  Miss Distance: 0.3m | Tempo: 4.2s | ΔV: 120   │
└─────────────────────────────────────────────────┘
```

---

## Plano de Execução (passo a passo)

| Step | Entrega | Dependência |
|------|---------|-------------|
| 1 | Setup do projeto (Vite + TS + canvas básico) | — |
| 2 | Classe Vector2D + testes manuais | — |
| 3 | Entidades (Missile, Target) com física básica | Step 2 |
| 4 | Game loop com timestep fixo | Step 1 |
| 5 | Renderer: desenhar entidades + trails | Step 3, 4 |
| 6 | Pure Pursuit guidance | Step 3 |
| 7 | Proportional Navigation guidance | Step 3 |
| 8 | UI básica: play/pause/reset + seleção de algoritmo | Step 5, 6, 7 |
| 9 | Múltiplos mísseis simultâneos (comparação visual) | Step 8 |
| 10 | Lead Pursuit + Augmented PN | Step 7 |
| 11 | G-limit, velocidade máxima, restrições físicas | Step 9 |
| 12 | Manobras evasivas do alvo | Step 9 |
| 13 | Painel de métricas (miss distance, tempo, etc.) | Step 9 |
| 14 | Deploy GitHub Pages | Step 8+ |
| 15 | Monte Carlo + gráficos de análise (bônus) | Step 13 |

---

## Referências

- Zarchan, P. — *Tactical and Strategic Missile Guidance* (livro referência da área)
- Proportional Navigation: `ω_missile = N × ω_LOS` onde N é a constante de navegação (tipicamente 3–5)
- [Wikipedia: Proportional Navigation](https://en.wikipedia.org/wiki/Proportional_navigation)

---

## Decisões Tomadas

1. **Controle do alvo:** Ambos — waypoints pré-definidos (default) e controle por mouse em tempo real. O usuário escolhe qual modo usar.
2. **Estilo visual:** Minimalista (linhas, pontos, formas geométricas simples).
3. **Responsividade:** Canvas fullscreen.
4. **Unidades:** Arbitrárias (pixels) — o que for mais simples de implementar.
