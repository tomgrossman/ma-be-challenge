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
cards.unshift(finalCard);
const readyCard = { card: '{ "ready": "true" }', length: 19 };

async function handleRequests (req, res) {
    switch (req.url[1]) { //slightly faster than charAt(1)
        case 'c': // /card_add
            const userCardCount = await client.incr(req.url.substring(13));
            const card = cards[userCardCount] ?? finalCard;
            res.setHeader('Content-Length', card.length);
            res.write(card.card);
            break;
        default: // /ready
            await client.configSet('save', '');
            for (const i of new Array(1000)) {
                await client.INCR('bla');
            }
            res.setHeader('Content-Length', readyCard.length);
            res.write(readyCard.card);
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
