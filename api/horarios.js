const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json()); // Para interpretar JSON nas requisições

// Conectar ao MongoDB usando a variável de ambiente MONGO_URI
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado ao MongoDB'))
    .catch((err) => console.log('Erro ao conectar ao MongoDB:', err));

// Definir o schema do agendamento
const agendamentoSchema = new mongoose.Schema({
    profissional: String,
    data: String, // Exemplo de data: "2024-10-25"
    hora: String  // Exemplo de hora: "09:00"
});
const Agendamento = mongoose.model('Agendamento', agendamentoSchema);

// Endpoint para obter horários ocupados
app.get('/api/horariosOcupados', async (req, res) => {
    const { profissional, data } = req.query;
    const agendamentos = await Agendamento.find({ profissional, data });
    const horariosOcupados = agendamentos.map(a => a.hora);
    res.json(horariosOcupados);
});

// Endpoint para criar um novo agendamento
app.post('/api/agendar', async (req, res) => {
    const { profissional, data, hora } = req.body;

    // Verificar se o horário já está ocupado
    const existeAgendamento = await Agendamento.findOne({ profissional, data, hora });
    if (existeAgendamento) {
        return res.status(400).json({ error: 'Horário já ocupado' });
    }

    // Criar novo agendamento
    const novoAgendamento = new Agendamento({ profissional, data, hora });
    await novoAgendamento.save();
    res.status(201).json({ message: 'Agendamento criado com sucesso' });
});

module.exports = app;