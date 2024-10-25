let step = 0;
let userData = {
    nome: '',
    telefone: '',
    servico: '',
    profissional: '',
    dia: '',
    horario: ''
};

// Opções para cada etapa
const services = [
    "Corte na tesoura", "Cabelo e barba + sobrancelha", "Corte com desenho",
    "Corte", "Barba", "Cabelo e barba", "Platinado + corte", "Cabelo + sobrancelha",
    "Luzes + corte", "Sobrancelha", "Pezinho", "Barba na maquininha",
    "Relaxamento + corte", "Limpeza de pele", "Cera quente nariz", "Desenhos", "Bigode"
];

// Informações dos profissionais, incluindo URL das fotos
const professionals = [
    { name: "Hector Gimenez", image: "https://s3.amazonaws.com/we-barber-chat-config/app_schedule/production/c85de031-3110-4e68-bdf9-b38e983158ca/profile/11725377f00b9b.png" },
    { name: "Alejandro José", image: "https://s3.amazonaws.com/we-barber-chat-config/app_schedule/production/c85de031-3110-4e68-bdf9-b38e983158ca/profile/108a4d5a3d3c73.png" }
];
const diasSemana = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const horarios = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
];

// Função para lidar com a entrada do usuário
function handleUserInput() {
    const input = document.getElementById('userInput').value.trim();
    if (input === '' && step < 2) return;

    document.getElementById('userInput').value = ''; // Limpa o campo de input

    const chatbot = document.getElementById('chatbot');
    chatbot.innerHTML += `<div class="message user-message">${input}</div>`;

    processStep(input);
}

// Função para processar cada etapa
function processStep(input) {
    switch (step) {
        case 0:
            userData.nome = input;
            showTypingIndicator(() => addBotMessage(`Olá ${userData.nome}! Qual é o seu número de telefone?`));
            step++;
            break;
        case 1:
            userData.telefone = input;
            showTypingIndicator(
                () => addBotMessage("Por qual serviço você está procurando?"),
                () => displayOptions(services)
            );
            step++;
            break;
        case 2:
            userData.servico = input;
            showTypingIndicator(
                () => addBotMessage("Escolha o profissional desejado:"),
                () => displayProfessionalOptions(professionals)
            );
            step++;
            break;
        case 3:
            userData.profissional = input;
            showTypingIndicator(
                () => addBotMessage("Escolha o dia da semana:"),
                () => displayOptions(diasSemana)
            );
            step++;
            break;
        case 4:
            userData.dia = input;
            showTypingIndicator(
                () => addBotMessage("Escolha o horário disponível:"),
                () => displayOptions(horarios)
            );
            step++;
            break;
        case 5:
            userData.horario = input;
            finalizeBooking();
            break;
        default:
            showTypingIndicator(() => addBotMessage("Algo deu errado, tente novamente."));
    }
}

// Função para exibir opções de profissionais com fotos
function displayProfessionalOptions(professionals) {
    const chatbot = document.getElementById('chatbot');
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options';

    professionals.forEach(professional => {
        const button = document.createElement('button');
        button.className = 'professional-option';
        button.onclick = () => selectOption(professional.name);

        const img = document.createElement('img');
        img.src = professional.image;
        img.alt = professional.name;
        img.className = 'professional-image';

        const name = document.createElement('span');
        name.textContent = professional.name;

        button.appendChild(img);
        button.appendChild(name);
        optionsContainer.appendChild(button);
    });

    chatbot.appendChild(optionsContainer);
}

// Função para exibir opções como botões de texto
function displayOptions(options) {
    const chatbot = document.getElementById('chatbot');
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options';

    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => selectOption(option);
        optionsContainer.appendChild(button);
    });

    chatbot.appendChild(optionsContainer);
}

// Função para selecionar uma opção sem duplicar mensagens
function selectOption(option) {
    const chatbot = document.getElementById('chatbot');
    chatbot.innerHTML += `<div class="message user-message">${option}</div>`;
    document.querySelector('.options').remove(); // Remove o container de opções
    processStep(option); // Passa o valor da opção diretamente para processar a etapa
}

// Função para adicionar uma nova mensagem do bot ao chat
function addBotMessage(message) {
    const chatbot = document.getElementById('chatbot');
    chatbot.innerHTML += `<div class="message bot-message">${message}</div>`;
}

// Função para exibir a animação de digitação
function showTypingIndicator(callback, postCallback) {
    const chatbot = document.getElementById('chatbot');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    chatbot.appendChild(typingIndicator);

    setTimeout(() => {
        typingIndicator.remove();
        callback();
        if (postCallback) {
            postCallback();
        }
    }, 1000); // Tempo de digitação ajustável
}

// Função final para exibir o link de agendamento no WhatsApp
function finalizeBooking() {
    const chatbot = document.getElementById('chatbot');
    const message = `Olá! Eu sou ${userData.nome}. Gostaria de agendar o serviço de "${userData.servico}" com ${userData.profissional} na ${userData.dia} às ${userData.horario}. Meu telefone é ${userData.telefone}.`;

    // Remove o campo de entrada e o botão de envio ao finalizar
    document.querySelector('.input-container').style.display = 'none';

    // Define o número do WhatsApp com base no profissional selecionado
    const phoneNumber = userData.profissional === 'Alejandro José' ? '5544984288265' : 'NUMERO_DO_HECTOR_GIMENEZ';
    
    // Cria o conteúdo final da mensagem com o botão de notificação
    const finalMessage = `
        <div class="final-notification">
            <p>Notifique <strong>${userData.profissional}</strong> sobre o seu agendamento:</p>
            <a href="https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}" target="_blank" class="notify-button">
                Enviar Agendamento no WhatsApp
            </a>
        </div>
    `;
    chatbot.innerHTML += finalMessage;
}
