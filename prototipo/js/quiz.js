// =========================================================================
// QUIZ INTERATIVO - Base de 20 questões originais (mínimo exigido: 15)
// Sorteia no mínimo 5 questões a cada execução e exibe % de acerto final
// =========================================================================

const QUIZ_BANK = [
  {
    id: 1,
    type: 'Múltipla Escolha',
    question: 'Qual componente é responsável por converter o sinal elétrico analógico do microfone em uma sequência de números binários?',
    options: [
      'DAC (Conversor Digital-Analógico)',
      'ADC (Conversor Analógico-Digital)',
      'Amplificador de saída',
      'Equalizador gráfico'
    ],
    answer: 1,
    explanation: 'O ADC (Analog-to-Digital Converter) realiza a amostragem e a quantização do sinal elétrico contínuo, transformando-o em dados digitais.'
  },
  {
    id: 2,
    type: 'Múltipla Escolha',
    question: 'Segundo o Teorema de Nyquist-Shannon, qual deve ser a taxa de amostragem mínima (fs) para capturar corretamente um sinal de até 20 kHz?',
    options: [
      '10 kHz',
      '20 kHz',
      'Pelo menos 40 kHz',
      '8 kHz'
    ],
    answer: 2,
    explanation: 'O Teorema de Nyquist estabelece que fs ≥ 2 · fmáx. Para 20 kHz (limite da audição humana), é necessário no mínimo 40 kHz (daí o padrão de CD em 44,1 kHz).'
  },
  {
    id: 3,
    type: 'Questão Visual',
    media: { kind: 'img', src: 'midias/nyquist_final.svg', caption: 'Observe o painel direito do diagrama vetorial acima.' },
    question: 'Qual é o nome do fenômeno de distorção mostrado no painel direito, causado quando amostramos abaixo da frequência de Nyquist?',
    options: [
      'Clipping',
      'Aliasing',
      'Normalização',
      'Reverberação'
    ],
    answer: 1,
    explanation: 'Quando fs < 2 · fmáx, amostras insuficientes criam uma onda reconstruída falsa de frequência mais baixa — fenômeno chamado Aliasing.'
  },
  {
    id: 4,
    type: 'Questão Auditiva',
    media: { kind: 'audio', src: 'midias/comparacao_44khz_4bit.wav', caption: 'Ouça esta amostra de áudio e preste atenção ao chiado granulado de fundo.' },
    question: 'O ruído granulado/áspero audível nessa gravação foi provocado principalmente por:',
    options: [
      'Profundidade de bits muito baixa (4 bits — erro de quantização)',
      'Uso de formato MIDI sem instrumentos',
      'Compressão sem perdas (FLAC)',
      'Taxa de amostragem excessivamente alta (96 kHz)'
    ],
    answer: 0,
    explanation: 'Com apenas 4 bits (16 níveis possíveis de amplitude), o arredondamento entre a onda real e os degraus discretos gera forte ruído de quantização.'
  },
  {
    id: 5,
    type: 'Questão Auditiva',
    media: { kind: 'audio', src: 'midias/amostra_bruta_com_ruido.wav', caption: 'Escute o trecho bruto capturado antes do tratamento.' },
    question: 'Quais problemas típicos de gravação bruta estão presentes nesse arquivo não editado?',
    options: [
      'Apenas excesso de volume (clipping severo)',
      'Ruído de fundo/zumbido constante, ganho baixo e silêncio inicial sem corte',
      'Aceleração extrema do andamento',
      'Ausência total de dados de áudio'
    ],
    answer: 1,
    explanation: 'O áudio bruto apresenta zumbido de rede elétrica (60 Hz), chiado de fundo, nível baixo e trecho ocioso inicial — corrigidos com corte, redução de ruído e normalização.'
  },
  {
    id: 6,
    type: 'Verdadeiro ou Falso',
    question: 'Verdadeiro ou Falso: Um arquivo MIDI (.mid) armazena a gravação real da forma de onda sonora em amostras PCM, por isso costuma ser maior que um arquivo WAV.',
    options: ['Verdadeiro', 'Falso'],
    answer: 1,
    explanation: 'Falso! O MIDI armazena instruções musicais (notas, duração, intensidade/velocity, canal e instrumento), não a onda sonora gravada — por isso ocupa apenas alguns kilobytes.'
  },
  {
    id: 7,
    type: 'Múltipla Escolha',
    question: 'Quantos níveis discretos de amplitude podem ser representados em um áudio gravado com profundidade de 16 bits (padrão de CD)?',
    options: [
      '256 níveis',
      '1.024 níveis',
      '65.536 níveis',
      '16 níveis'
    ],
    answer: 2,
    explanation: 'A quantidade de níveis é 2^n. Para n = 16 bits, temos 2¹⁶ = 65.536 níveis discretos de amplitude.'
  },
  {
    id: 8,
    type: 'Múltipla Escolha',
    question: 'Qual dos formatos abaixo utiliza compressão SEM perdas (Lossless), reduzindo o tamanho do arquivo sem descartar nenhuma informação sonora?',
    options: [
      'MP3',
      'AAC',
      'FLAC',
      'OGG Vorbis'
    ],
    answer: 2,
    explanation: 'FLAC (Free Lossless Audio Codec) reduz o tamanho do arquivo em cerca de 40%–50% mantendo exatamente os mesmos dados PCM originais ao ser decodificado.'
  },
  {
    id: 9,
    type: 'Múltipla Escolha',
    question: 'Qual é a taxa de amostragem e profundidade de bits padrão de um CD de áudio (Red Book)?',
    options: [
      '8 kHz e 8 bits',
      '44,1 kHz e 16 bits',
      '22,05 kHz e 24 bits',
      '192 kHz e 8 bits'
    ],
    answer: 1,
    explanation: 'O padrão de CD de áudio é PCM estéreo (2 canais) a 44.100 Hz (44,1 kHz) e 16 bits por amostra, resultando em bitrate de 1.411 kbps.'
  },
  {
    id: 10,
    type: 'Questão Visual',
    media: { kind: 'img', src: 'midias/cadeia_audio_final.svg', caption: 'Analise a cadeia completa do áudio digital.' },
    question: 'Na etapa final (5. DAC e Saída), qual é o papel do conversor DAC?',
    options: [
      'Compactar o arquivo em MP3',
      'Transformar os dados digitais binários novamente em sinal elétrico analógico para o alto-falante',
      'Eliminar ruídos de microfone durante a gravação',
      'Converter partituras em código MIDI'
    ],
    answer: 1,
    explanation: 'O DAC (Digital-to-Analog Converter) reconstrói o sinal elétrico contínuo a partir das amostras digitais para movimentar o cone do alto-falante ou fone.'
  },
  {
    id: 11,
    type: 'Múltipla Escolha',
    question: 'No tratamento de áudio digital (como no Audacity), o que faz a operação de "Normalização"?',
    options: [
      'Converte o arquivo WAV em MIDI automaticamente',
      'Ajusta uniformemente o ganho para que o pico máximo atinja um nível-alvo (ex.: -1 dBFS) sem distorcer',
      'Diminui a taxa de amostragem para 8 kHz',
      'Apaga todos os graves abaixo de 500 Hz'
    ],
    answer: 1,
    explanation: 'A normalização eleva ou reduz o volume geral proporcionalmente até que o pico mais alto alcance o teto escolhido (como -1 dBFS), mantendo a dinâmica original.'
  },
  {
    id: 12,
    type: 'Verdadeiro ou Falso',
    question: 'Verdadeiro ou Falso: A compressão com perdas (como MP3 e AAC) usa modelos psicoacústicos para descartar frequências menos perceptíveis ao ouvido humano.',
    options: ['Verdadeiro', 'Falso'],
    answer: 0,
    explanation: 'Verdadeiro! Codecs lossy exploram o mascaramento auditivo (psicoacústica) para remover componentes sonoros que o ouvido humano dificilmente percebe.'
  },
  {
    id: 13,
    type: 'Múltipla Escolha',
    question: 'Qual é a principal função do acessório "Pop Filter" posicionado à frente de um microfone condensador?',
    options: [
      'Aumentar a taxa de amostragem do microfone',
      'Atenuar rajadas de ar de consoantes plosivas (como P, B e T)',
      'Converter sinal estéreo em mono',
      'Sintetizar instrumentos MIDI'
    ],
    answer: 1,
    explanation: 'O Pop Filter difunde o impacto de ar das sílabas plosivas antes que atinjam a cápsula do microfone, evitando estalos graves indesejados na gravação.'
  },
  {
    id: 14,
    type: 'Múltipla Escolha',
    question: 'Qual fórmula calcula corretamente a taxa de bits (Bitrate) de um áudio PCM sem compressão?',
    options: [
      'Taxa de Amostragem + Profundidade de Bits',
      'Taxa de Amostragem × Profundidade de Bits × Número de Canais',
      'Duração ÷ Profundidade de Bits',
      'Frequência Máxima × 2'
    ],
    answer: 1,
    explanation: 'Bitrate (bits/s) = fs × bit depth × canais. Exemplo de CD: 44.100 × 16 × 2 = 1.411.200 bps (~1.411 kbps).'
  },
  {
    id: 15,
    type: 'Questão Auditiva',
    media: { kind: 'audio', src: 'midias/comparacao_8khz_16bit.wav', caption: 'Ouça o trecho com taxa de amostragem reduzida (8 kHz).' },
    question: 'Ao reduzir a taxa de amostragem de 44,1 kHz para 8 kHz, qual efeito auditivo é mais evidente?',
    options: [
      'A música toca duas vezes mais rápido',
      'Perda de brilho/frequências agudas, deixando o som abafado (estilo telefone)',
      'Aumento extremo da nitidez dos agudos',
      'Nenhuma diferença perceptível em qualquer frequência'
    ],
    answer: 1,
    explanation: 'A 8 kHz, a frequência máxima representável (Nyquist) cai para 4 kHz, eliminando os harmônicos agudos e deixando o áudio abafado, típico da telefonia.'
  },
  {
    id: 16,
    type: 'Múltipla Escolha',
    question: 'Em um sistema multimídia, qual é uma grande vantagem prática do formato MIDI em comparação ao áudio digitalizado (WAV/MP3)?',
    options: [
      'Permite gravar fielmente a voz humana cantada',
      'Permite alterar andamento (BPM) e trocar instrumentos sem distorcer o timbre, ocupando pouquíssimos kilobytes',
      'Dispensa qualquer sintetizador ou placa de som para tocar',
      'Sempre produz o mesmo som exato em qualquer dispositivo sem depender de banco sonoro'
    ],
    answer: 1,
    explanation: 'Por armazenar eventos musicais simbólicos, o MIDI permite mudar BPM, transpor tom e trocar instrumentos dinamicamente com arquivos minúsculos.'
  },
  {
    id: 17,
    type: 'Verdadeiro ou Falso',
    question: 'Verdadeiro ou Falso: A quantização discretiza o eixo do TEMPO, enquanto a amostragem discretiza o eixo da AMPLITUDE.',
    options: ['Verdadeiro', 'Falso'],
    answer: 1,
    explanation: 'Falso — é o inverso! A amostragem (sampling) discretiza o tempo (quantas medições por segundo), enquanto a quantização discretiza a amplitude (em bits).'
  },
  {
    id: 18,
    type: 'Múltipla Escolha',
    question: 'Qual é a faixa aproximada de frequências audíveis pelo ser humano saudável?',
    options: [
      '1 Hz a 500 Hz',
      '20 Hz a 20.000 Hz (20 kHz)',
      '100 kHz a 500 kHz',
      '500 Hz a 4.000 Hz'
    ],
    answer: 1,
    explanation: 'O ouvido humano percebe vibrações entre cerca de 20 Hz (graves profundos) e 20 kHz (agudos muito finos).'
  },
  {
    id: 19,
    type: 'Múltipla Escolha',
    question: 'O que acontece quando um sinal de áudio digital ultrapassa o limite máximo de 0 dBFS durante a gravação ou edição?',
    options: [
      'Ocorre clipping (ceifamento dos picos da onda), gerando distorção agressiva',
      'O áudio fica automaticamente em formato FLAC',
      'A taxa de amostragem dobra automaticamente',
      'O som fica completamente silencioso'
    ],
    answer: 0,
    explanation: 'No domínio digital, 0 dBFS é o teto absoluto. Qualquer pico acima disso é cortado ("ceifado"), causando distorção severa chamada clipping.'
  },
  {
    id: 20,
    type: 'Múltipla Escolha',
    question: 'Por que a indústria de vídeo digital e cinema utiliza frequentemente a taxa de amostragem de 48 kHz em vez de 44,1 kHz?',
    options: [
      'Porque 48 kHz não funciona em computadores',
      'Porque 48.000 divide-se de forma inteira por taxas comuns de quadros de vídeo (24, 25 e 30 FPS), facilitando a sincronia áudio-vídeo',
      'Porque 48 kHz usa apenas 4 bits por amostra',
      'Porque arquivos de 48 kHz são menores que 8 kHz'
    ],
    answer: 1,
    explanation: '48.000 amostras/s divide-se exatamente em 2.000 amostras/quadro a 24 FPS e 1.600 amostras/quadro a 30 FPS, evitando desvios de sincronia em vídeo.'
  }
];

class InteractiveQuiz {
  constructor() {
    this.sessionQuestions = [];
    this.currentIdx = 0;
    this.answers = [];
    this.answeredCurrent = false;
  }

  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  start() {
    const count = Math.max(5, Number(document.getElementById('quiz-count')?.value || 5));
    this.sessionQuestions = this.shuffle(QUIZ_BANK).slice(0, count);
    this.currentIdx = 0;
    this.answers = [];
    this.answeredCurrent = false;
    document.getElementById('quiz-intro').style.display = 'none';
    document.getElementById('quiz-result').style.display = 'none';
    document.getElementById('quiz-stage').style.display = 'block';
    this.renderQuestion();
  }

  renderQuestion() {
    const q = this.sessionQuestions[this.currentIdx];
    const total = this.sessionQuestions.length;
    this.answeredCurrent = false;

    const stage = document.getElementById('quiz-stage');
    let mediaHtml = '';
    if (q.media) {
      if (q.media.kind === 'img') {
        mediaHtml = `<div class="quiz-media">
          <img src="${q.media.src}" alt="Ilustração da questão">
          <p style="font-size:0.82rem;color:var(--muted);margin:8px 0 0;text-align:center;">${q.media.caption}</p>
        </div>`;
      } else if (q.media.kind === 'audio') {
        mediaHtml = `<div class="quiz-media">
          <p style="font-size:0.86rem;color:var(--cyan);margin:0 0 6px;font-weight:600;">🎧 ${q.media.caption}</p>
          <audio controls src="${q.media.src}"></audio>
        </div>`;
      }
    }

    const letters = ['A', 'B', 'C', 'D'];
    stage.innerHTML = `
      <div class="quiz-question-box">
        <div class="quiz-meta">
          <span>Pergunta <strong>${this.currentIdx + 1}</strong> de <strong>${total}</strong> (sorteada da base de ${QUIZ_BANK.length} questões)</span>
          <span class="badge badge-info">${q.type}</span>
        </div>
        <div class="progress-track" style="margin-bottom:16px;">
          <div class="progress-fill" style="width:${((this.currentIdx) / total) * 100}%"></div>
        </div>
        <div class="quiz-q-text">${q.question}</div>
        ${mediaHtml}
        <div class="quiz-options">
          ${q.options.map((opt, idx) => `
            <button class="quiz-opt" data-idx="${idx}">
              <strong>${letters[idx]})</strong> ${opt}
            </button>
          `).join('')}
        </div>
        <div id="quiz-feedback" style="display:none;"></div>
        <div style="margin-top:16px;display:flex;justify-content:flex-end;">
          <button id="quiz-next-btn" class="btn btn-primary" style="display:none;">
            ${this.currentIdx + 1 < total ? 'Próxima Pergunta →' : 'Ver Resultado Final 🏆'}
          </button>
        </div>
      </div>
    `;

    stage.querySelectorAll('.quiz-opt').forEach((btn) => {
      btn.addEventListener('click', () => this.selectOption(Number(btn.dataset.idx)));
    });
    document.getElementById('quiz-next-btn').addEventListener('click', () => this.next());
  }

  selectOption(chosenIdx) {
    if (this.answeredCurrent) return;
    this.answeredCurrent = true;
    const q = this.sessionQuestions[this.currentIdx];
    const isCorrect = chosenIdx === q.answer;
    this.answers.push({ question: q, chosenIdx, isCorrect });

    const stage = document.getElementById('quiz-stage');
    stage.querySelectorAll('.quiz-opt').forEach((btn) => {
      const idx = Number(btn.dataset.idx);
      btn.disabled = true;
      if (idx === q.answer) btn.classList.add('correct');
      else if (idx === chosenIdx && !isCorrect) btn.classList.add('wrong');
    });

    const fb = document.getElementById('quiz-feedback');
    fb.style.display = 'block';
    fb.className = 'quiz-feedback ' + (isCorrect ? 'status-ok' : 'status-warn');
    fb.innerHTML = `<strong>${isCorrect ? '✅ Resposta correta!' : '❌ Resposta incorreta.'}</strong> ${q.explanation}`;

    document.getElementById('quiz-next-btn').style.display = 'inline-flex';
  }

  next() {
    if (this.currentIdx + 1 < this.sessionQuestions.length) {
      this.currentIdx++;
      this.renderQuestion();
    } else {
      this.showResult();
    }
  }

  showResult() {
    document.getElementById('quiz-stage').style.display = 'none';
    const resEl = document.getElementById('quiz-result');
    resEl.style.display = 'block';

    const total = this.answers.length;
    const correctCount = this.answers.filter((a) => a.isCorrect).length;
    const pct = Math.round((correctCount / total) * 100);

    let msg = 'Continue explorando os módulos interativos e tente novamente!';
    let color = '#fb7185';
    if (pct >= 80) { msg = 'Excelente domínio sobre Áudio Digital em Sistemas Multimídia!'; color = '#34d399'; }
    else if (pct >= 60) { msg = 'Bom desempenho! Vale revisar os pontos abaixo para gabaritar.'; color = '#38bdf8'; }

    resEl.innerHTML = `
      <div class="card" style="text-align:center;">
        <h2>Resultado do QUIZ Interativo</h2>
        <div class="score-circle" style="border-color:${color}">
          <span class="pct">${pct}%</span>
          <small>${correctCount} de ${total} acertos</small>
        </div>
        <p style="font-size:1.05rem;color:#f8fafc;font-weight:600;">${msg}</p>
        <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:16px;">
          <button id="quiz-retry-btn" class="btn btn-primary">🎲 Sortear Novo Quiz</button>
          <button id="quiz-back-home" class="btn">🏠 Voltar ao Hub Não-Linear</button>
        </div>
      </div>
      <div class="card">
        <h3>Revisão das Questões Sorteadas</h3>
        ${this.answers.map((a, i) => `
          <div class="review-item ${a.isCorrect ? '' : 'bad'}">
            <div style="font-weight:700;margin-bottom:4px;">${i + 1}. ${a.question.question}</div>
            <div style="font-size:0.86rem;color:#cbd5e1;">
              Sua resposta: <strong>${a.question.options[a.chosenIdx]}</strong>
              ${a.isCorrect ? ' ✅' : ` ❌ &nbsp;|&nbsp; Correta: <strong style="color:var(--emerald)">${a.question.options[a.question.answer]}</strong>`}
            </div>
            <div style="font-size:0.82rem;color:var(--muted);margin-top:4px;">${a.question.explanation}</div>
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('quiz-retry-btn').addEventListener('click', () => this.start());
    document.getElementById('quiz-back-home').addEventListener('click', () => window.goToModule('mod-home'));
  }
}

window.quizEngine = new InteractiveQuiz();
window.addEventListener('DOMContentLoaded', () => {
  const bankCountEl = document.getElementById('quiz-bank-count');
  if (bankCountEl) bankCountEl.textContent = QUIZ_BANK.length;
  document.getElementById('quiz-start-btn')?.addEventListener('click', () => window.quizEngine.start());
});
