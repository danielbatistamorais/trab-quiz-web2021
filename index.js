let jogo;
const proxy = "https://secret-ocean-49799.herokuapp.com";
const urlBase = "https://opentdb.com";

const elementos = {
  telas: {
    inicial: document.querySelector("#tela-inicial"),
    jogo: document.querySelector("#tela-jogo"),
    opcoes: document.querySelector("#tela-opcoes"),
    resultado: document.querySelector("#tela-resultado"),
    fimDeJogo: document.querySelector("#tela-fim-de-jogo"),
  },

  botoes: {
    dificuldade: document.querySelectorAll(".seletor-dificuldade"),
    iniciarJogo: document.querySelector("#iniciar-jogo"),
    armazenar: document.querySelector("#botao-armazenar"),
    confirmar: document.querySelector("#botao-confirmar"),
    cancelar: document.querySelector("#botao-cancelar"),
    alternativas: [],
    novaPergunta: document.querySelector("#nova-pergunta"),
    perguntaArmazenada: document.querySelector("#pergunta-armazenada"),
  },

  textoPontuacao: document.querySelector("#pontuacao"),
  textoPergunta: document.querySelector("#pergunta"),
  avisoDificuldade: document.querySelector(".aviso-dificuldade"),
  textoResultado: document.querySelector("#texto-resultado"),

  selecaoCategoria: document.querySelector("#seletor-categoria"),
};

elementos.botoes.perguntaArmazenada.addEventListener("click", (e) => {
  elementos.telas.resultado.classList.add("collapse");
  elementos.botoes.perguntaArmazenada.classList.add("collapse");
  jogo.responderArmazenada();
});

elementos.botoes.novaPergunta.addEventListener("click", (e) => {
  elementos.telas.resultado.classList.add("collapse");
  elementos.botoes.perguntaArmazenada.classList.add("collapse");

  carregarPergunta();
});

const novoJogo = () => {
  ///declaração do jogo atual
  jogo = {
    dificuldade: undefined,
    vidas: 3,
    pontos: 0,
    categoria: {
      id: 0,
      nome: undefined,
    },
    acertos: 0,
    perguntasRespondidas: 0,
    armazenada: undefined,
    pergunta: undefined,

    definirDificuldade: function (dificuldade) {
      this.dificuldade = dificuldade;
    },

    definirCategoria: function (nome, id) {
      this.categoria.nome = nome;
      this.categoria.id = id;
    },

    armazenarPergunta: function () {
      this.armazenada = this.pergunta;

      carregarPergunta();
    },

    responderArmazenada: function () {
      this.pergunta = this.armazenada;
      CarregaJogo();
    },

    atualizaPontuacao(x) {
      this.perguntasRespondidas++;
      if (x == true) {
        this.acertos++;
        if (this.pergunta === this.armazenada) {
          if (this.dificuldade == "easy") {
            this.pontos += 3;
          } else if (this.dificuldade == "medium") {
            this.pontos += 5;
          } else {
            this.pontos += 8;
          }
        } else {
          if (this.dificuldade == "easy") {
            this.pontos += 5;
          } else if (this.dificuldade == "medium") {
            this.pontos += 8;
          } else {
            this.pontos += 10;
          }
        }
      } else {
        if (this.dificuldade == "easy") {
          this.pontos += -5;
        } else if (this.dificuldade == "medium") {
          this.pontos += -8;
        } else {
          this.pontos += -10;
        }
        this.vidas--;
      }

      if (this.vidas == 0) {
        carregarFimDeJogo();
      }
    },
  };

  ///////AQUI MOSTRA A TELA DA DIFICULDADE E APAGA A DE NOVO JOGO
  elementos.telas.inicial.classList.remove("collapse");
  elementos.telas.fimDeJogo.classList.add("collapse");

  for (let i = 0; i < elementos.botoes.dificuldade.length; i++) {
    elementos.botoes.dificuldade[i].addEventListener("click", () => {
      jogo.definirDificuldade(
        `${elementos.botoes.dificuldade[i].textContent.toLowerCase()}`
      );
    });
  }

  carregarCategorias();

  elementos.botoes.iniciarJogo.addEventListener("click", () => {
    jogo.definirCategoria(
      elementos.selecaoCategoria.options[
        elementos.selecaoCategoria.selectedIndex
      ].textContent,

      elementos.selecaoCategoria.options[
        elementos.selecaoCategoria.selectedIndex
      ].value
    );

    if (jogo.dificuldade != undefined) {
      elementos.telas.inicial.classList.add("collapse");
      console.log("ta");

      carregarPergunta();
    } else {
      elementos.avisoDificuldade.classList.remove("collapse");
    }
  });
};

///CARREGA CATEGORIAS E PERGUNTAS
const carregarCategorias = () => {
  axios.get(`${proxy}/${urlBase}/api_category.php`).then((response) => {
    const categoria = response.data.trivia_categories;
    for (const c of categoria) {
      elementos.selecaoCategoria.innerHTML += `<option value="${c.id}">${c.name}</option>`;
    }
  });
};

const carregarPergunta = () => {
  axios
    .get(
      `${proxy}/${urlBase}/api.php?amount=1&category=${jogo.categoria.id}&difficulty=${jogo.dificuldade}`
    )
    .then((response) => {
      jogo.pergunta = response.data.results[0];
      CarregaJogo();
    });
};

///CARREGA FIM DE JOGO E INICIO DO JOGO
const carregarFimDeJogo = () => {
  elementos.telas.jogo.classList.add("collapse");
  elementos.telas.resultado.classList.add("collapse");
  elementos.telas.fimDeJogo.classList.remove("collapse");

  elementos.telas.fimDeJogo.innerHTML = "";

  elementos.telas.fimDeJogo.innerHTML += `
  <div class = "texto"><h3>Final Score: ${jogo.pontos}</h3></div>
  <div class = "texto"><h3>Questions answered: ${jogo.perguntasRespondidas}</h3></div>
  <div class = "texto"><h3>Correct answers: ${jogo.acertos}</h3></div>
  <div class = "texto"><h3>Dificult played: ${jogo.dificuldade}</h3></div>
  <div class = "texto"><h3>Category played: ${jogo.categoria.nome}</h3></div>
  <button class = "btn btn-outline-primary" id="botao-novo-jogo">New Game</button>`;
  const botaoNovoJogo = document.querySelector("#botao-novo-jogo");

  botaoNovoJogo.addEventListener("click", (e) => {
    novoJogo();
  });
};

const CarregaJogo = () => {
  elementos.telas.jogo.classList.remove("collapse");
  elementos.textoPontuacao.textContent = `Score: ${jogo.pontos}`;
  elementos.botoes.alternativas = [];
  console.log(jogo.pergunta.question);

  ///LISTENER ARMAZENAR

  ///→ ESTE IF SERVE PARA VERIFICAR SE A PERGUNTA QUE ESTA SENDO RESPONDIDA JÁ É A ARMAZENADA
  if (jogo.armazenada === undefined) {
    ///→ SE A PERGUNTA ARMAZENADA ESTIVER VAZIA ENTÃO O JOGADOR PODE CLICKAR NO BOTÃO DE ARMAZENAR
    ///→ O COMANDO ABAIXO DEFINE O BOTÃO DE ARMAZENAR COMO "UTILIZAVEL"
    elementos.botoes.armazenar.disabled = false;

    elementos.botoes.armazenar.addEventListener("click", () => {
      const botaoAntigo = document.querySelector("#confirm");

      if (botaoAntigo != null) {
        botaoAntigo.parentNode.removeChild(botaoAntigo);
      }

      const div = document.querySelector(`#div-armazenar`);
      const botaoConfirma = document.createElement("button");
      const text = document.createTextNode("Confirm");

      botaoConfirma.appendChild(text);
      botaoConfirma.classList.add("btn");
      botaoConfirma.classList.add("btn-secondary");
      botaoConfirma.classList.add("flex-fill");
      botaoConfirma.type = "button";
      botaoConfirma.id = `confirm`;

      div.appendChild(botaoConfirma);

      botaoConfirma.addEventListener("click", (e) => {
        ///→ QUANDO O JOGADOR DECIDE ARMAZENAR A PERGUNTA CLICANDO EM "CONFIRMAR", O BOTÃO DE ARMAZENAR SE TORNA INUTILIZAVEL,
        ///ATÉ QUE ELE DECIDA RESPONDER A ARMAZENADA
        ///→ O COMANDO ABAIXO DEFINE O BOTÃO DE ARMAZENAR COMO "INUTILIZAVEL"
        elementos.botoes.armazenar.disabled = true;

        botaoConfirma.parentNode.removeChild(botaoConfirma);
        jogo.armazenarPergunta();
      });
    });
    ///SE A PERGUNTA QUE ESTIVER SENDO FOR A ARMAZENADA, ENTÃO O JOGO ESVAZIA A PERGUNTA ARMAZENADA, PARA QUE O JOGADOR
    ///POSSA NOVAMENTE ARMAZENAR OUTRA PERGUNTA
  } else if (jogo.armazenada === jogo.pergunta) {
    jogo.armazenada = undefined;
  }

  elementos.textoPergunta.innerHTML = `<p> ${decodeHTMLEntities(
    jogo.pergunta.question
  )}</p>`;

  const respostas = jogo.pergunta.incorrect_answers.concat(
    jogo.pergunta.correct_answer
  );

  respostas.sort();

  elementos.telas.opcoes.innerHTML = "";

  for (let i = 0; i < respostas.length; i++) {
    elementos.telas.opcoes.innerHTML += `
        <div id="div-alternativa-${i}" class="div-alternativa d-flex justify-content-center ">
            <button id="alternativa-${i}" class="btn btn-outline-primary m-2 flex-fill " type="button">${respostas[i]}</button>
        </div>
    `;
  }

  for (let i = 0; i < respostas.length; i++) {
    const botaoAlternativa = document.querySelector(`#alternativa-${i}`);

    elementos.botoes.alternativas.push(botaoAlternativa);

    elementos.botoes.alternativas[i].addEventListener("click", (e) => {
      const botaoAntigo = document.querySelector("#confirm");

      if (botaoAntigo != null) {
        botaoAntigo.parentNode.removeChild(botaoAntigo);
      }

      const div = document.querySelector(`#div-alternativa-${i}`);
      const botaoConfirma = document.createElement("button");
      const text = document.createTextNode("confirm");

      botaoConfirma.appendChild(text);
      botaoConfirma.classList.add("btn");
      botaoConfirma.classList.add("btn-outline-success");
      botaoConfirma.classList.add("m-1");
      botaoConfirma.classList.add("flex-fill");
      botaoConfirma.type = "button";
      botaoConfirma.id = `confirm`;

      div.appendChild(botaoConfirma);

      ////CAPTA RESPOSTA DA QUESTÃO
      botaoConfirma.addEventListener("click", (e) => {
        verificaAcerto(elementos.botoes.alternativas[i].textContent);
      });
    });
  }
};

///Verifica acerto e pergunta se usuario quer responder nova pergunta ou armazenada
const verificaAcerto = (resposta) => {
  console.log(resposta);
  let result = undefined;

  elementos.botoes.perguntaArmazenada.addEventListener("click", (e) => {});

  if (resposta === jogo.pergunta.correct_answer) {
    elementos.telas.jogo.classList.add("collapse");
    elementos.textoResultado.textContent =
      "Congratulations, your answer is correct";
    elementos.telas.resultado.classList.remove("collapse");

    jogo.atualizaPontuacao(true);
  } else {
    elementos.telas.jogo.classList.add("collapse");

    elementos.textoResultado.innerHTML = `Oops, you missed the question<br>The correct answer was: ${jogo.pergunta.correct_answer}`;

    elementos.telas.resultado.classList.remove("collapse");

    jogo.atualizaPontuacao(false);
  }

  if (jogo.armazenada != undefined) {
    elementos.botoes.perguntaArmazenada.classList.remove("collapse");
  }
};

///NEGÓCIO PRA NN DAR ERRO NAS HTMLS
const decodeHTMLEntities = (text) => {
  var textArea = document.createElement("textarea");
  textArea.innerHTML = text;
  return textArea.value;
};

novoJogo();
