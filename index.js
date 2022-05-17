const fs = require('fs');
const fastify = require('fastify')()
const port = +process.argv[2] || 3000

const cardsData = fs.readFileSync('./cards.json');
const cards = JSON.parse(cardsData);
const cardsStrings = cards.map(card => JSON.stringify(card));
const allCardsKey = 'all_cards';

let insertedCards = false;

async function upsertUser (userKey) {
    // This should have been during the initialization of the app, but the tests file flush redis after the app is ready :/
    // could have skipped this entire block
    if (!insertedCards) {
        await client.sAdd(allCardsKey, cardsStrings)
        insertedCards = true;
    }

    const result = await client.sAdd('all_users', userKey);
    if (1 === result) {
        // if the user was first created, add all available cards to this user
        await client.copy(allCardsKey, userKey);
    }
}

fastify.get('/card_add', async (req, reply) => {
    const  key = `user_id:${req.query.id}`;
    await upsertUser(key);
    const missingCard = await client.sPop(key);
    if (!missingCard) {
        return { id: "ALL CARDS" }
    }

    return missingCard;
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
