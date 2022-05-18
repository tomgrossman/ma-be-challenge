const fs = require('fs');
const turbo = require('turbo-http')
const port = +process.argv[2] || 3000

const cardsData = fs.readFileSync('./cards.json');
const cards = JSON.parse(cardsData);
const cardsLength = cards.length;

async function handleRequests (req, res) {
    if ('/ready' === req.url) {
        res.setHeader('Content-Length', 19)
        return res.write('{ "ready": "true" }')
    }

    const userCardCount = await client.incr(req.url);
    if (cardsLength < userCardCount) {
        res.setHeader('Content-Length', 21)
        return res.write('{ "id": "ALL CARDS" }');
    }

    const card = cards[userCardCount-1];

    const response = `{ "id": "${card.id}", "name": "${card.name}"}`;
    res.setHeader('Content-Length', response.length)
    return res.write(response);
}

const client = require('redis').createClient()
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
