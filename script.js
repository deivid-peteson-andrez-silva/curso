
const CHAVE_USUARIOS = "pythonAcademyUsuarios";
const CHAVE_SESSAO = "pythonAcademySessao";

let usuarioAtual = null;
let perguntas = [];
let indicePergunta = 0;
let acertos = 0;
let respostaSelecionada = null;
let respostaConfirmada = false;

const apostilas = {
    1: {
        titulo: "01. Strings",
        descricao: "Strings são usadas para armazenar textos em Python.",
        codigo: 'nome = "Maria"\nprint(nome)\nprint(nome.upper())',
        explicacao: "Você pode usar aspas simples ou duplas para criar textos. O método upper() transforma as letras em maiúsculas.",
        exemplo: 'nome = "Python"\nprint("Olá, " + nome)'
    },
    2: {
        titulo: "02. Input",
        descricao: "A função input() permite receber informações digitadas pelo usuário.",
        codigo: 'nome = input("Digite seu nome: ")\nprint("Olá,", nome)',
        explicacao: "O valor retornado por input() é um texto. Para trabalhar com números inteiros, você pode usar int().",
        exemplo: 'idade = int(input("Digite sua idade: "))\nprint(idade)'
    },
    3: {
        titulo: "03. If / Else",
        descricao: "As estruturas if e else permitem executar códigos de acordo com uma condição.",
        codigo: 'idade = 18\n\nif idade >= 18:\n    print("Maior de idade")\nelse:\n    print("Menor de idade")',
        explicacao: "O Python usa a indentação para identificar os blocos de código. O operador >= significa maior ou igual.",
        exemplo: 'nota = 8\nif nota >= 7:\n    print("Aprovado")\nelse:\n    print("Reprovado")'
    },
    4: {
        titulo: "04. For",
        descricao: "O laço for permite repetir instruções para cada item de uma sequência.",
        codigo: 'for numero in range(1, 6):\n    print(numero)',
        explicacao: "range(1, 6) gera os números de 1 a 5. O valor final não é incluído.",
        exemplo: 'for i in range(3):\n    print("Estudando Python")'
    },
    5: {
        titulo: "05. Funções",
        descricao: "Funções agrupam instruções que podem ser reutilizadas.",
        codigo: 'def saudacao(nome):\n    print("Olá,", nome)\n\nsaudacao("Maria")',
        explicacao: "A palavra def define uma função. Os parâmetros recebem valores e a função pode ser chamada quantas vezes for necessário.",
        exemplo: 'def somar(a, b):\n    return a + b\n\nprint(somar(3, 4))'
    }
};

const bancoPerguntas = [
    {
        pergunta: "Qual função exibe uma mensagem na tela em Python?",
        alternativas: ["input()", "print()", "int()", "range()"],
        correta: 1
    },
    {
        pergunta: "Qual símbolo é usado para atribuir um valor a uma variável?",
        alternativas: ["==", "=>", "=", "!="],
        correta: 2
    },
    {
        pergunta: "Qual função recebe um texto digitado pelo usuário?",
        alternativas: ["print()", "input()", "str.upper()", "range()"],
        correta: 1
    },
    {
        pergunta: "Qual estrutura é usada para tomar decisões?",
        alternativas: ["for", "import", "if", "def"],
        correta: 2
    },
    {
        pergunta: "Qual laço pode repetir um bloco para cada item de uma sequência?",
        alternativas: ["for", "print", "input", "return"],
        correta: 0
    },
    {
        pergunta: "Qual palavra-chave define uma função em Python?",
        alternativas: ["function", "fun", "define", "def"],
        correta: 3
    },
    {
        pergunta: "Qual tipo de dado representa um número inteiro?",
        alternativas: ["str", "int", "list", "bool"],
        correta: 1
    },
    {
        pergunta: "Qual operador verifica se dois valores são iguais?",
        alternativas: ["=", "==", "!=", ">"],
        correta: 1
    },
    {
        pergunta: "Qual método transforma um texto em letras maiúsculas?",
        alternativas: ["lower()", "capitalize_all()", "upper()", "int()"],
        correta: 2
    },
    {
        pergunta: "Qual palavra-chave permite devolver um resultado de uma função?",
        alternativas: ["print", "input", "break", "return"],
        correta: 3
    }
];

function obterUsuarios() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
    } catch {
        return [];
    }
}

function salvarUsuarios(usuarios) {
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
}

function escaparHTML(valor) {
    return String(valor).replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}

function mostrarTela(id) {
    document.querySelectorAll("main > section.tela").forEach(tela => {
        tela.classList.add("escondida");
    });

    document.getElementById(id).classList.remove("escondida");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function mostrarAviso(mensagem) {
    const aviso = document.getElementById("aviso");
    aviso.textContent = mensagem;
    aviso.classList.remove("escondida");

    clearTimeout(mostrarAviso.timer);
    mostrarAviso.timer = setTimeout(() => {
        aviso.classList.add("escondida");
    }, 3000);
}

function mostrarLogin() {
    mostrarTela("tela-login");
}

function mostrarCadastro() {
    mostrarTela("tela-cadastro");
}

function atualizarCabecalho() {
    const elemento = document.getElementById("usuario-logado");
    elemento.textContent = usuarioAtual ? usuarioAtual.nome : "";
}

document.getElementById("form-cadastro").addEventListener("submit", event => {
    event.preventDefault();

    const nome = document.getElementById("cadastro-nome").value.trim();
    const idade = Number(document.getElementById("cadastro-idade").value);
    const email = document.getElementById("cadastro-email").value.trim().toLowerCase();
    const senha = document.getElementById("cadastro-senha").value;

    if (!nome || !email || !senha || !Number.isInteger(idade) || idade < 1) {
        mostrarAviso("Confira os dados preenchidos.");
        return;
    }

    if (senha.length < 6) {
        mostrarAviso("A senha deve ter pelo menos 6 caracteres.");
        return;
    }

    const usuarios = obterUsuarios();

    if (usuarios.some(usuario => usuario.email === email)) {
        mostrarAviso("Já existe uma conta com esse e-mail.");
        return;
    }

    usuarios.push({
        nome,
        idade,
        email,
        senha,
        provas: [],
        melhorNota: null
    });

    salvarUsuarios(usuarios);
    event.target.reset();

    mostrarLogin();
    document.getElementById("login-email").value = email;
    mostrarAviso("Conta criada! Entre com seu e-mail e senha.");
});

document.getElementById("form-login").addEventListener("submit", event => {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const senha = document.getElementById("login-senha").value;

    const usuario = obterUsuarios().find(
        item => item.email === email && item.senha === senha
    );

    if (!usuario) {
        mostrarAviso("E-mail ou senha incorretos.");
        return;
    }

    usuarioAtual = usuario;
    localStorage.setItem(CHAVE_SESSAO, usuario.email);
    event.target.reset();
    mostrarMenu();
});

function exigirLogin() {
    if (!usuarioAtual) {
        mostrarLogin();
        return false;
    }
    return true;
}

function mostrarMenu() {
    if (!exigirLogin()) return;

    atualizarCabecalho();

    document.getElementById("nome-aluno").textContent = usuarioAtual.nome.split(" ")[0];
    document.getElementById("total-provas").textContent = usuarioAtual.provas.length;
    document.getElementById("melhor-nota").textContent =
        usuarioAtual.melhorNota === null
            ? "--"
            : usuarioAtual.melhorNota.toFixed(1).replace(".", ",");

    mostrarTela("tela-menu");
}

function mostrarApostilas() {
    if (!exigirLogin()) return;
    mostrarTela("tela-apostilas");
    abrirApostila(1);
}

function abrirApostila(numero) {
    if (!apostilas[numero]) return;

    const apostila = apostilas[numero];
    const conteudo = document.getElementById("conteudo-apostila");

    conteudo.innerHTML = `
        <span class="etiqueta">MATERIAL DE ESTUDO</span>
        <h2>${escaparHTML(apostila.titulo)}</h2>
        <p>${escaparHTML(apostila.descricao)}</p>
        <h3>Exemplo de código</h3>
        <pre><code>${escaparHTML(apostila.codigo)}</code></pre>
        <h3>Explicação</h3>
        <p>${escaparHTML(apostila.explicacao)}</p>
        <h3>Outro exemplo</h3>
        <pre><code>${escaparHTML(apostila.exemplo)}</code></pre>
    `;

    document.querySelectorAll("#lista-apostilas button").forEach((botao, indice) => {
        botao.classList.toggle("ativo", indice + 1 === numero);
    });
}

function embaralhar(lista) {
    const copia = [...lista];

    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
}

function iniciarProva() {
    if (!exigirLogin()) return;

    perguntas = embaralhar(bancoPerguntas).slice(0, 5);
    indicePergunta = 0;
    acertos = 0;
    respostaSelecionada = null;
    respostaConfirmada = false;

    mostrarTela("tela-prova");
    exibirPergunta();
}

function exibirPergunta() {
    const pergunta = perguntas[indicePergunta];

    respostaSelecionada = null;
    respostaConfirmada = false;

    document.getElementById("progresso-prova").textContent =
        `Pergunta ${indicePergunta + 1} de ${perguntas.length}`;

    document.getElementById("progresso-preenchido").style.width =
        `${(indicePergunta / perguntas.length) * 100}%`;

    document.getElementById("pergunta-texto").textContent = pergunta.pergunta;
    document.getElementById("mensagem-prova").textContent = "";
    document.getElementById("botao-responder").textContent = "Confirmar resposta";

    const alternativas = document.getElementById("alternativas");
    alternativas.innerHTML = "";

    pergunta.alternativas.forEach((texto, indice) => {
        const label = document.createElement("label");
        label.className = "alternativa";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "resposta";
        radio.value = indice;

        radio.addEventListener("change", () => {
            if (respostaConfirmada) return;

            respostaSelecionada = indice;

            document.querySelectorAll(".alternativa").forEach(item => {
                item.classList.remove("selecionada");
            });

            label.classList.add("selecionada");
        });

        const span = document.createElement("span");
        span.textContent = `${String.fromCharCode(65 + indice)}. ${texto}`;

        label.append(radio, span);
        alternativas.appendChild(label);
    });
}

function responder() {
    if (respostaConfirmada) {
        indicePergunta++;

        if (indicePergunta >= perguntas.length) {
            finalizarProva();
        } else {
            exibirPergunta();
        }
        return;
    }

    if (respostaSelecionada === null) {
        mostrarAviso("Selecione uma alternativa.");
        return;
    }

    respostaConfirmada = true;

    const correta = perguntas[indicePergunta].correta;
    const mensagem = document.getElementById("mensagem-prova");

    if (respostaSelecionada === correta) {
        acertos++;
        mensagem.textContent = "Resposta correta!";
        mensagem.style.color = "#34d399";
    } else {
        mensagem.textContent =
            `Resposta incorreta. A resposta certa é: ${perguntas[indicePergunta].alternativas[correta]}.`;
        mensagem.style.color = "#fca5a5";
    }

    document.getElementById("progresso-preenchido").style.width =
        `${((indicePergunta + 1) / perguntas.length) * 100}%`;

    document.getElementById("botao-responder").textContent =
        indicePergunta === perguntas.length - 1 ? "Ver resultado" : "Próxima pergunta";
}

function finalizarProva() {
    const nota = (acertos / perguntas.length) * 10;

    const usuarios = obterUsuarios();
    const indiceUsuario = usuarios.findIndex(
        usuario => usuario.email === usuarioAtual.email
    );

    if (indiceUsuario !== -1) {
        usuarios[indiceUsuario].provas.push({
            nota,
            acertos,
            total: perguntas.length,
            data: new Date().toISOString()
        });

        const melhorAtual = usuarios[indiceUsuario].melhorNota;
        usuarios[indiceUsuario].melhorNota =
            melhorAtual === null ? nota : Math.max(melhorAtual, nota);

        salvarUsuarios(usuarios);
        usuarioAtual = usuarios[indiceUsuario];
    }

    document.getElementById("nota-final").textContent =
        nota.toFixed(1).replace(".", ",");

    document.getElementById("detalhe-resultado").textContent =
        `Você acertou ${acertos} de ${perguntas.length} perguntas.`;

    mostrarTela("tela-resultado");
}

function mostrarAtividade() {
    if (!exigirLogin()) return;

    document.getElementById("resposta-atividade").value = "";
    document.getElementById("resultado-atividade").textContent = "";
    mostrarTela("tela-atividade");
}

function verificarAtividade() {
    const codigo = document.getElementById("resposta-atividade").value;
    const resultado = document.getElementById("resultado-atividade");

    const temInput = /\binput\s*\(/.test(codigo);
    const temPrint = /\bprint\s*\(/.test(codigo);

    if (temInput && temPrint) {
        resultado.textContent =
            "Sua resposta contém input() e print(). Confira se o código está correto e se usa a variável do nome.";
        resultado.style.color = "#34d399";
    } else {
        resultado.textContent =
            "Dica: use input() para receber o nome e print() para mostrar a mensagem.";
        resultado.style.color = "#fbbf24";
    }
}

function mostrarConta() {
    if (!exigirLogin()) return;

    document.getElementById("perfil-nome").textContent = usuarioAtual.nome;
    document.getElementById("perfil-idade").textContent = usuarioAtual.idade;
    document.getElementById("perfil-email").textContent = usuarioAtual.email;
    document.getElementById("perfil-provas").textContent = usuarioAtual.provas.length;
    document.getElementById("perfil-nota").textContent =
        usuarioAtual.melhorNota === null
            ? "--"
            : usuarioAtual.melhorNota.toFixed(1).replace(".", ",");

    mostrarTela("tela-conta");
}

function sair() {
    usuarioAtual = null;
    localStorage.removeItem(CHAVE_SESSAO);
    atualizarCabecalho();
    mostrarLogin();
}

function restaurarSessao() {
    const email = localStorage.getItem(CHAVE_SESSAO);

    if (!email) return;

    usuarioAtual = obterUsuarios().find(usuario => usuario.email === email) || null;

    if (usuarioAtual) {
        mostrarMenu();
    } else {
        localStorage.removeItem(CHAVE_SESSAO);
    }
}

restaurarSessao();
