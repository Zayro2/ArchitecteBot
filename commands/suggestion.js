const {
    SlashCommandBuilder,
    ChannelType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

const db = require("../utils/database");


module.exports = {

    data: new SlashCommandBuilder()
        .setName("suggestion")
        .setDescription("Créer une proposition pour le serveur")
        .addStringOption(option =>
            option
                .setName("titre")
                .setDescription("Titre de la proposition")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("description")
                .setDescription("Description de la proposition")
                .setRequired(true)
        ),


    async execute(interaction) {

        const titre =
            interaction.options.getString("titre");

        const description =
            interaction.options.getString("description");


        const salon =
            await interaction.guild.channels.create({

                name: `📜-proposition-${Date.now().toString().slice(-5)}`,

                type: ChannelType.GuildText,

                permissionOverwrites: [

                    {
                        id: interaction.guild.roles.everyone.id,

                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages
                        ]

                    }

                ]

            });



        const embed = new EmbedBuilder()

            .setTitle("🏛️ Nouvelle proposition")

            .setDescription(
`
👤 **Auteur :**
${interaction.user}

💡 **Titre :**
${titre}

📝 **Description :**
${description}


🗳️ Vote ouvert pendant 24 heures.
`
            )

            .setColor("Blue")

            .addFields(

                {
                    name: "🟢 Pour",
                    value: "0",
                    inline: true
                },

                {
                    name: "🔴 Contre",
                    value: "0",
                    inline: true
                }

            );



        const boutons =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()

                        .setCustomId("vote_pour")

                        .setLabel("🟢 Pour")

                        .setStyle(ButtonStyle.Success),



                    new ButtonBuilder()

                        .setCustomId("vote_contre")

                        .setLabel("🔴 Contre")

                        .setStyle(ButtonStyle.Danger)

                );



        const message =
            await salon.send({

                content:
                "@everyone",

                embeds:[
                    embed
                ],

                components:[
                    boutons
                ]

            });



        db.createVote({

            messageId: message.id,

            salonId: salon.id,

            auteur: interaction.user.id,

            titre,

            description,

            fin:
            Date.now() + 86400000

        });



        await interaction.reply({

            content:
            `✅ Ta proposition a été créée : ${salon}`,

            ephemeral:true

        });



    }

};
