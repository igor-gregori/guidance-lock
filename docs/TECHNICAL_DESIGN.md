# Guidance Lock — Design Técnico

## 1. Arquitetura Geral

```
┌──────────────────────────────────────────────────────────┐
│                        main.ts                           │
│  - Inicializa canvas fullscreen                          │
│  - Cria Simulation, Renderer, UI                         │
│  - Inicia o game loop                                    │
└──────────────┬───────────────────────────────────────────┘
               │
    ┌──────────▼──────────┐
    │    simulation.ts     │
    │  - Fixed timestep    │
    │  - Update entities   │
    │  - Detect hit/miss   │
    └──┬──────────┬────────┘
       │          │
┌──────▼───┐  ┌──▼─────────────┐
│ entities │  │   guidance/     │
│ missile  │  │ pure-pursuit    │
│ target   │  │ lead-pursuit    │
│          │  │ proportional-nav│
│          │  │ augmented-pn    │
└──────────┘  └─────────────────┘
       │
┌──────▼───┐
│ renderer │  ← lê estado das entidades, desenha no canvas
└──────────┘
       │
┌──────▼───┐
│    ui    │  ← controles HTML, emite eventos para Simulation
└──────────┘
```

Fluxo por frame:
1. `UI` captura inputs e repassa config para `Simulation`.
2. `Simulation.update(dt)` aplica guidance → física → detecção.
3. `Renderer.draw(state)` desenha tudo no canvas.

---

## 2. Módulo: math/vector.ts

```ts
interface Vec2 {
  x: number;
  y: number;
}

// Funções puras (sem classe):
add(a, b): Vec2
sub(a, b): Vec2
scale(v, s): Vec2
length(v): number
normalize(v): Vec2
dot(a, b): number
cross2D(a, b): number    // escalar: a.x*b.y - a.y*b.x
rotate(v, angle): Vec2
angle(v): number         // atan2
lerp(a, b, t): Vec2
distanceTo(a, b): number
```

Funções puras ao invés de classe — mais simples, sem mutação, tree-shakeable.

---

## 3. Módulo: entities/missile.ts

```ts
interface MissileState {
  pos: Vec2;
  vel: Vec2;
  acc: Vec2;
  speed: number;           // magnitude da velocidade (constante ou com aceleração)
  maxLateralG: number;     // G-limit (pixels/s²)
  alive: boolean;
  trail: Vec2[];           // histórico de posições para o rastro
  guidanceType: GuidanceType;
  color: string;
}
```

**Update por tick:**
1. Chama `guidance.computeAcceleration(missile, target)` → retorna aceleração desejada.
2. Limita magnitude da aceleração pelo `maxLateralG`.
3. Aplica: `vel += acc * dt`, normaliza vel e escala por `speed`.
4. Aplica: `pos += vel * dt`.
5. Registra `pos` no `trail` (a cada N frames para não estourar memória).

---

## 4. Módulo: entities/target.ts

```ts
type TargetMode = 'waypoints' | 'mouse';

interface Waypoint {
  pos: Vec2;
  speed: number;  // velocidade neste segmento
}

interface TargetState {
  pos: Vec2;
  vel: Vec2;
  speed: number;
  mode: TargetMode;
  waypoints: Waypoint[];
  currentWaypointIndex: number;
  trail: Vec2[];
  alive: boolean;
}
```

**Modo waypoints (default):**
- Move em direção ao próximo waypoint com velocidade configurada.
- Ao chegar (distância < threshold), avança para o próximo.
- Manobras evasivas = waypoints com curvas agressivas.

**Modo mouse:**
- `pos` do alvo interpola suavemente em direção à posição do mouse.
- Velocidade limitada para não teleportar.

---

## 5. Módulo: guidance/types.ts

```ts
type GuidanceType = 'pure-pursuit' | 'lead-pursuit' | 'proportional-nav' | 'augmented-pn';

interface GuidanceInput {
  missilePos: Vec2;
  missileVel: Vec2;
  targetPos: Vec2;
  targetVel: Vec2;
  dt: number;
}

interface GuidanceOutput {
  acceleration: Vec2;  // aceleração lateral comandada
}

type GuidanceFn = (input: GuidanceInput, params: GuidanceParams) => GuidanceOutput;

interface GuidanceParams {
  N?: number;  // constante de navegação (para PN/APN), default 3-5
}
```

---

## 6. Algoritmos de Guidance — Implementação

### Pure Pursuit
```
direção = normalize(targetPos - missilePos)
acceleration = direção perpendicular que alinha velocidade com essa direção
```
Simplesmente rotaciona o vetor velocidade em direção ao alvo.

### Lead Pursuit
```
tGo = distance / closingSpeed
predictedPos = targetPos + targetVel * tGo
direção = normalize(predictedPos - missilePos)
// mesma lógica do PP mas apontando para posição futura
```

### Proportional Navigation (PN)
```
LOS = targetPos - missilePos
LOSrate = cross2D(LOS, targetVel - missileVel) / |LOS|²
accCmd = N * |missileVel| * LOSrate
// aceleração perpendicular à velocidade do míssil
```
N = constante de navegação (tipicamente 3–5).

### Augmented PN (APN)
```
// Igual PN + termo de compensação:
accCmd = N * |missileVel| * LOSrate + (N/2) * targetAccNormal
```

---

## 7. Módulo: simulation.ts

```ts
interface SimConfig {
  missiles: MissileConfig[];   // um por algoritmo ativo
  target: TargetConfig;
  killRadius: number;          // distância de intercepção
  bounds: { width: number; height: number };
}

interface SimState {
  missiles: MissileState[];
  target: TargetState;
  time: number;
  running: boolean;
  results: SimResult[];        // preenchido quando míssil termina
}

interface SimResult {
  guidanceType: GuidanceType;
  hit: boolean;
  missDistance: number;
  timeToIntercept: number;
  totalAccUsed: number;        // integral da aceleração (esforço de manobra)
}
```

**Fixed timestep:**
```ts
const FIXED_DT = 1 / 120;  // 120 ticks/s para precisão
let accumulator = 0;

function loop(frameTime: number) {
  accumulator += frameTime;
  while (accumulator >= FIXED_DT) {
    simulation.update(FIXED_DT);
    accumulator -= FIXED_DT;
  }
  renderer.draw(simulation.state);
  requestAnimationFrame(loop);
}
```

**Detecção hit/miss:**
- **Hit:** `distance(missile, target) < killRadius`
- **Miss:** distância estava diminuindo e começou a aumentar (ponto de passagem mais próximo), ou saiu do canvas.

---

## 8. Módulo: renderer.ts

Responsabilidades:
- Limpar canvas.
- Desenhar grid de fundo (sutil, estilo minimalista).
- Desenhar trails (linhas com fade/opacidade decrescente).
- Desenhar mísseis (triângulo apontando na direção da velocidade, cor por algoritmo).
- Desenhar alvo (círculo ou forma distinta).
- Desenhar vetores de aceleração (linhas saindo das entidades) — toggle opcional.
- HUD: tempo, status (TRACKING / HIT / MISS).

**Cores por algoritmo:**
| Algoritmo | Cor |
|-----------|-----|
| Pure Pursuit | `#ff4444` (vermelho) |
| Lead Pursuit | `#44aaff` (azul) |
| Proportional Nav | `#44ff88` (verde) |
| Augmented PN | `#ffaa44` (laranja) |

**Alvo:** branco `#ffffff`.

---

## 9. Módulo: ui.ts

Controles como elementos HTML sobrepostos ao canvas (position absolute, canto inferior ou lateral).

```
Controles:
- [▶/⏸] Play/Pause
- [↺] Reset
- [Speed] 0.25x | 0.5x | 1x | 2x | 4x
- [Algoritmos] Checkboxes: PP / LP / PN / APN
- [Alvo] Toggle: Waypoints | Mouse
- [Cenário] Dropdown: Reto | Break Turn | Jinking | S-Curve
- [Míssil Speed] Slider
- [Alvo Speed] Slider
- [G-Limit] Slider
```

Painel de métricas (aparece após simulação terminar ou em tempo real):
```
| Algoritmo | Status | Miss Dist | Tempo | Esforço |
|-----------|--------|-----------|-------|---------|
| PP        | HIT    | 0.0 px    | 3.2s  | 4521    |
| PN        | HIT    | 0.0 px    | 2.8s  | 2103    |
```

---

## 10. Game Loop e Performance

- `requestAnimationFrame` para renderização.
- Fixed timestep de 120Hz para física (independente do framerate de render).
- Trails: armazenar no máximo ~500 pontos por entidade; descartar os mais antigos.
- Canvas resize via `ResizeObserver` para manter fullscreen.

---

## 11. Cenários Pré-definidos

| Nome | Descrição |
|------|-----------|
| **Reto** | Alvo voa em linha reta. Baseline. |
| **Break Turn** | Alvo faz curva de 90° agressiva no meio do caminho. |
| **Jinking** | Alvo faz zigue-zagues aleatórios. |
| **S-Curve** | Alvo faz curva suave em S. |
| **Circular** | Alvo voa em círculo. |
| **Head-On** | Alvo vem em direção ao míssil (closing speed alta). |

Cada cenário = conjunto de waypoints + velocidade.

---

## 12. Deploy (GitHub Pages)

```bash
# vite.config.ts
export default {
  base: '/guidance-lock/'  # path do repo no GitHub Pages
}
```

Deploy options:
- **GitHub Actions:** build no push para main → deploy para gh-pages branch.
- **Manual:** `npm run build` → push da pasta `dist/` para gh-pages.

Recomendo GitHub Actions para automação.

---

## 13. Ordem de Implementação (mapeada ao PLAN.md)

| Step | Arquivo(s) | Entrega |
|------|-----------|---------|
| 1 | `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html` | Projeto roda com canvas vazio fullscreen |
| 2 | `src/math/vector.ts` | Funções vetoriais testáveis |
| 3 | `src/entities/missile.ts`, `src/entities/target.ts` | Entidades com estado e update |
| 4 | `src/simulation.ts` | Loop de simulação com fixed timestep |
| 5 | `src/renderer.ts` | Desenha entidades e trails no canvas |
| 6 | `src/guidance/pure-pursuit.ts` | Primeiro algoritmo funcionando |
| 7 | `src/guidance/proportional-nav.ts` | PN funcionando |
| 8 | `src/ui.ts`, atualiza `index.html` e `style.css` | Controles básicos |
| 9 | Atualiza `simulation.ts` | Múltiplos mísseis simultâneos |
| 10 | `src/guidance/lead-pursuit.ts`, `src/guidance/augmented-pn.ts` | Todos os 4 algoritmos |
| 11 | Atualiza `missile.ts` | Restrições físicas (G-limit real, etc.) |
| 12 | Atualiza `target.ts` | Cenários com manobras evasivas |
| 13 | Atualiza `ui.ts` | Painel de métricas |
| 14 | `.github/workflows/deploy.yml` | CI/CD para GitHub Pages |

---

*Revise este design. Se estiver de acordo, começamos a implementação pelo Step 1.*
