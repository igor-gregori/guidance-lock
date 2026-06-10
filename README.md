# Guidance Lock

Simulador interativo de algoritmos de guidance de mísseis perseguidores em 2D. Compare visualmente como diferentes "cérebros" de mísseis se comportam ao perseguir um alvo em manobra.

**[Demo ao vivo](https://igor-gregori.github.io/guidance-lock/)**

## Algoritmos

| Algoritmo | Descrição |
|-----------|-----------|
| **Pure Pursuit** | Aponta sempre para a posição atual do alvo. Simples mas ineficiente. |
| **Lead Pursuit** | Aponta para a posição futura estimada do alvo. |
| **Proportional Navigation** | Taxa de giro proporcional à rotação da linha de visada. Padrão real de mísseis. |
| **Augmented PN** | PN com compensação da aceleração do alvo. Melhor contra manobras evasivas. |

## Como usar

- Os 4 mísseis são lançados simultaneamente contra o mesmo alvo
- Use os checkboxes para ligar/desligar algoritmos
- Ajuste a velocidade da simulação com o slider
- ⏸ Pause | ↺ Reset

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Stack

- TypeScript
- Vite
- HTML Canvas 2D

## Licença

MIT
