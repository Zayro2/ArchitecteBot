require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    REST,
    Routes
} = require("discord.js");


const suggestion = require("./commands/suggestion");
const interactionEvent = require("./events/interactionCreate");


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});



client.once("ready", async () => {

    console.log(`🏛️ Architecte connecté : ${client.user.tag}`);


    const rest = new REST({
        version: "10"
    }).setToken(process.env.TOKEN);



    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        {
            body: [
                suggestion.data
            ]
        }
    );


    console.log("✅ Commandes installées");

});



client.on(
    "interactionCreate",
    interactionEvent
);



client.login(process.env.TOKEN);
