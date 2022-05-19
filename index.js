const fs = require('fs');
const turbo = require('turbo-http')
const port = +process.argv[2] || 3000

const cardsData = fs.readFileSync('./cards.json');
const cards = JSON.parse(cardsData).map(card => {
    const str = `{ "id": "${card.id}", "name": "${card.name}"}`;
    return {
        card: str,
        length: str.length
    };
});
const finalCard = { card: '{ "id": "ALL CARDS" }', length: 21};
const readyCard = { card: '{ "ready": "true" }', length: 19 };

async function handleRequests (req, res) {
    switch (req.url) {
        case '/ready':
            res.setHeader('Content-Length', readyCard.length);
            res.write(readyCard.card);
            break;
        default:
            const userCardCount = await client.incr(req.url.substring(13));
            const card = cards[userCardCount-1] || finalCard;
            res.setHeader('Content-Length', card.length);
            res.write(card.card);
    }
}

const client = require('redis').createClient();
client.on('error', (err) => console.log('Redis Client Error', err));

client.on('ready', async () => {
    try {
        const server = turbo.createServer(handleRequests)
        server.listen(port)
        console.log(`Server is running on http://0.0.0.0:${port}`);
    } catch (error) {
        console.error(error)
    }
})

client.connect();
