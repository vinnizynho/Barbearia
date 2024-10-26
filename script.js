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

// Formata o telefone ao digitar
document.getElementById('userInput').addEventListener('input', (e) => {
    if (step === 1) {
        e.target.value = formatPhoneNumber(e.target.value);
    }
});

function formatPhoneNumber(value) {
    value = value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 6) {
        return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
        return `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else {
        return value;
    }
}

// Lida com a entrada do usuário
function handleUserInput() {
    let input = document.getElementById('userInput').value.trim();

    if (step === 1) {
        if (input.length === 15) {
            userData.telefone = input;
            document.getElementById('chatbot').innerHTML += `<div class="message user-message">${input}</div>`;
            document.getElementById('userInput').value = '';
            step++;
            processStep();
        } else {
            showTypingIndicator(() => addBotMessage("Por favor, digite um número válido no formato (xx) xxxxx-xxxx."));
        }
    } else {
        if (input) {
            document.getElementById('chatbot').innerHTML += `<div class="message user-message">${input}</div>`;
            document.getElementById('userInput').value = '';
            processStep(input);
        }
    }
}

// Processa cada etapa
function processStep(input) {
    switch (step) {
        case 0:
            userData.nome = input;
            showTypingIndicator(() => addBotMessage(`Olá ${userData.nome}! Qual é o seu número de telefone?`));
            step++;
            break;
        case 1:
            break;
        case 2:
            userData.servico = input;
            showTypingIndicator(() => addBotMessage("Escolha o profissional desejado:"), () => displayProfessionalOptions(professionals));
            step++;
            break;
        case 3:
            userData.profissional = input;
            showTypingIndicator(() => addBotMessage("Escolha o dia da semana:"), () => displayOptions(diasSemana));
            step++;
            break;
        case 4:
            userData.dia = input;
            showTypingIndicator(() => addBotMessage("Escolha o horário disponível:"), () => displayAvailableHours(userData.dia));
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

// Função para obter horários ocupados
async function fetchAvailableHours(profissional, data) {
    try {
        const response = await fetch(`https://alevembarbearia.vercel.app/api/horariosOcupados?profissional=${profissional}&data=${data}`);
        const horariosOcupados = await response.json();
        
        return horarios.filter(hour => !horariosOcupados.includes(hour));
    } catch (error) {
        console.error("Erro ao buscar horários ocupados:", error);
        return [];
    }
}

// Exibe horários disponíveis usando a API
async function displayAvailableHours(dia) {
    const availableHours = await fetchAvailableHours(userData.profissional, dia);
    displayOptions(availableHours);
}

// Função para criar um agendamento
async function saveBooking(profissional, data, hora) {
    try {
        const response = await fetch('https://alevembarbearia.vercel.app/api/agendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profissional, data, hora })
        });

        if (response.ok) {
            addBotMessage("Agendamento criado com sucesso!");
        } else {
            const error = await response.json();
            addBotMessage(`Erro: ${error.error}`);
        }
    } catch (error) {
        console.error("Erro ao criar agendamento:", error);
        addBotMessage("Ocorreu um erro ao tentar criar o agendamento. Tente novamente.");
    }
}

// Finaliza o agendamento e exibe o link de WhatsApp
async function finalizeBooking() {
    await saveBooking(userData.profissional, userData.dia, userData.horario);

    const chatbot = document.getElementById('chatbot');
    const message = `Olá! Eu sou ${userData.nome}. Gostaria de agendar o serviço de "${userData.servico}" com ${userData.profissional} na ${userData.dia} às ${userData.horario}. Meu telefone é ${userData.telefone}.`;

    const phoneNumber = userData.profissional === 'Alejandro José' ? '5544984288265' : 'NUMERO_DO_HECTOR_GIMENEZ';
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

// Exibe opções com fotos dos profissionais
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

// Exibe opções como botões de texto
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

// Seleciona uma opção e avança para a próxima etapa
function selectOption(option) {
    const chatbot = document.getElementById('chatbot');
    chatbot.innerHTML += `<div class="message user-message">${option}</div>`;
    document.querySelector('.options').remove();
    processStep(option);
}

// Exibe uma nova mensagem do bot
function addBotMessage(message) {
    const chatbot = document.getElementById('chatbot');
    chatbot.innerHTML += `<div class="message bot-message">${message}</div>`;
}

// Animação de digitação do bot
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
    }, 1000);
}
