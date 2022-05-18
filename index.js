const fs = require('fs');
const fastify = require('fastify')()
const port = +process.argv[2] || 3000

const cardsData = fs.readFileSync('./cards.json');
const cards = JSON.parse(cardsData);
const cardsLength = cards.length;

fastify.get('/card_add', async (req, reply) => {
    const key = `user_id:${req.query.id}`;
    const userCardCount = await client.incr(key);
    if (cardsLength < userCardCount) {
        return { id: "ALL CARDS" }
    }

    return cards[userCardCount-1];
})

fastify.get('/ready', async (req, reply) => {
    return { ready: true }
})

const client = require('redis').createClient()
client.on('error', (err) => console.log('Redis Client Error', err));

client.on('ready', async () => {
    try {
        await fastify.listen(port);
        console.log(`Example app listening at http://0.0.0.0:${port}`)
    } catch (error) {
        console.error(error)
    }
})

client.connect();
