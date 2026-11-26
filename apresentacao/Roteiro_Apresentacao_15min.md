# Roteiro de Apresentação — ÁudioLab SM (Máximo: 15 minutos)

**Integrantes:** Jonathas Oliveira (01710785) e Maverick Martins (01705485)  
**Tempo planejado:** ~13 minutos (deixando 2 minutos de margem para perguntas do professor)

---

## Parte 1 — Jonathas Oliveira (~6 minutos)

- **Slide 1 — Capa (0:30):** Apresentar a dupla, a disciplina e o nome do protótipo (*ÁudioLab SM*), focado no tema *Áudio digital para Sistemas Multimídia*.
- **Slide 2 — Proposta e Navegação Não-Linear (1:30):** Explicar que o sistema segue o modelo de Material Didático Interativo (EAD/DOL), com navegação totalmente não-linear (menu lateral + Hub de cards + glossário pesquisável) e funcionamento 100% offline.
- **Slide 3 — Ferramentas e Tecnologias (1:00):** Passar rapidamente pela stack (HTML5/CSS3/JS, Web Audio API, Canvas) e pelas ferramentas de cada mídia.
- **Slide 4 — Imagens Matriciais e Vetoriais (1:30):** Mostrar como a **foto real da mesa** (4:3, celular) foi recortada para 16:9, ajustada em exposição/contraste/cor e anotada apontando os equipamentos reais (fone over-ear, soundbar, dual-monitor e knob de volume); explicar a vantagem dos diagramas vetoriais em SVG (rascunho monocromático → versão final colorida sem perda no zoom).
- **Slide 5 — Animação e Vídeo (1:30):** Explicar a evolução do GIF (4 FPS → 20 FPS), a animação vetorial SVG do fluxo ADC/DAC, o simulador interativo de Aliasing em Canvas e o vídeo (captura crua com ruído → mini-aula editada com legendas e trilha).

---

## Parte 2 — Maverick Martins (~5 minutos)

- **Slide 6 — Áudio Digitalizado WAV (1:30):** Explicar a gravação da **narração real da equipe** (pico inicial alto e volume irregular no corpo da fala) e o tratamento aplicado (corte de silêncios, filtro passa-alta 85 Hz, realce 3,2 kHz, compressão 3:1 e normalização para -1 dBFS). Comentar o teste da própria voz em 44,1 kHz, 8 kHz (telefonia) e 4 bits (quantização) + calculadora de bitrate (WAV vs FLAC vs MP3).
- **Slide 7 — Música MIDI (1:30):** Mostrar a diferença prática entre áudio digitalizado e MIDI (partitura de eventos: `trilha_completa.mid` tem 3 faixas, 100 notas e ocupa só **1 KB** vs 352 KB de 4s de WAV) e destacar o player MIDI nativo com Piano Roll e controle de BPM ao vivo.
- **Slide 8 — QUIZ Interativo (1:00):** Explicar a base de **20 questões** (acima do mínimo de 15), o sorteio aleatório (Fisher-Yates) de 5+ questões por execução, a presença de questões com áudio e imagem, e a exibição do percentual de acerto com revisão comentada.
- **Slide 9 — Problemas e Soluções (1:00):** Citar os 4 desafios técnicos superados (bloqueio CORS em `file://`, reprodução de MIDI sem plugin no navegador, sincronia do slider em aba oculta e limpeza/nivelamento do áudio bruto).

---

## Parte 3 — Demonstração ao Vivo: Jonathas & Maverick juntos (~3 minutos)

Abrir `prototipo/index.html` (ou o link do GitHub Pages):
1. **Jonathas (1:30):**
   - Dar play breve na **narração de boas-vindas** no Hub e mostrar a navegação não-linear.
   - Módulo 1: arrastar o slider **Antes vs. Depois** da foto real da mesa e alternar o SVG Rascunho/Final.
   - Módulo 2: baixar a taxa de amostragem no **Simulador** para disparar o alerta vermelho de **Aliasing**, clicar em *Ouvir Som Quantizado* e dar play rápido no vídeo editado.
2. **Maverick (1:30):**
   - Módulo 3: dar play breve na **narração bruta vs. tratada** e na versão **4 bits** da voz.
   - Módulo 4: dar play no **MIDI**, mexer no slider de **Andamento (BPM)** ao vivo e desmarcar uma faixa (ex.: silenciar o Baixo).
   - **QUIZ:** iniciar uma rodada de 5 perguntas, responder rapidamente e mostrar a tela final com o **percentual de acerto (%)**.

---

## Lembrete para Entrega no Drive Virtual (SEM compactar!)
Subir as pastas/arquivos **separados e sem zipar**:
- `prototipo/` (arquivos do sistema funcionando + código-fonte)
- `midias_entrega/nao_editado/` (todos os arquivos brutos)
- `midias_entrega/editado/` (todos os arquivos tratados)
- `relatorio_tecnico/Relatorio_Tecnico_AudioLab_SM.pdf` (e `.docx`)
- `apresentacao/Apresentacao_AudioLab_SM.pptx`
