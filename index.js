const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client, MessageMedia, Location, List, Buttons, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');

/**
 * Geramos um QRCODE para iniciar a sessão
 */
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false }
});

client.initialize();

// Geramos o QRCODE no Terminal
client.on('qr', qr => { qrcode.generate(qr, { small: true }); });
client.on('ready', () => console.log('Cliente está pronto!'));

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('message', async msg => {
    console.log(JSON.stringify(msg));

    // if (msg.body == '!ping') {
    //     msg.reply('pong');
    // }
});

/**
 * Enviamos uma mensagem simples (texto) ao nosso cliente
 * @param {*} number 
 */
const sendMessage = (number = null, text = null) => {
    number = number.replace('@c.us', '');
    number = `${number}@c.us`
    const message = text || `Olá, eu sou um BOT`;
    console.log([number, message])
    client.sendMessage(number, message);
}

/**
 * Enviamos arquivos multimídia para nosso cliente
 * @param {*} number
 * @param {*} file
 * @param {*} caption
 */
const sendMessageMedia = (number, file, caption) => {
    number = number.replace('@c.us', '');
    number = `${number}@c.us`
    const media = MessageMedia.fromFilePath(`${file}`)
    client.sendMessage(number, media, { caption: caption });
}

// API
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true }));

// Controllers
const sendText = (req, res) => {
    const { message, number } = req.body
    sendMessage(number, message)
    res.send({ status: 'Enviado mensagem!' })
}

const sendMidia = (req, res) => {
    const { number, fileName, caption } = req.body
    sendMessageMedia(number, fileName, caption)
    res.send({ status: 'Enviado mensagem multimidia!' })
}

// Rotas
app.post('/send', sendText);
app.post('/sendMedia', sendMidia);

// Ativar o Servidor
const port = process.env.PORT || 9000;
app.listen(port, () => console.log('Server ready on localhost:9000!'));
