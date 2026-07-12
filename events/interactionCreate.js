const {
    EmbedBuilder
} = require("discord.js");

const db = require("../utils/database");


module.exports = async (interaction) => {


    if (!interaction.isButton()) return;



    const vote =
        db.getVote(interaction.message.id);



    if (!vote) {

        return interaction.reply({

            content:
            "❌ Ce vote n'existe plus.",

            ephemeral:true

        });

    }



    if (vote.termine) {

        return interaction.reply({

            content:
            "❌ Le vote est terminé.",

            ephemeral:true

        });

    }



    const user =
    interaction.user.id;



    if (
        vote.pour.includes(user)
        ||
        vote.contre.includes(user)
    ) {

        return interaction.reply({

            content:
            "❌ Tu as déjà voté.",

            ephemeral:true

        });

    }




    if (interaction.customId === "vote_pour") {

        vote.pour.push(user);

    }



    if (interaction.customId === "vote_contre") {

        vote.contre.push(user);

    }



    db.saveVote(
        interaction.message.id,
        vote
    );



    await interaction.reply({

        content:
        "✅ Ton vote a été enregistré.",

        ephemeral:true

    });



    await mettreAJourMessage(
        interaction,
        vote
    );


};





async function mettreAJourMessage(interaction,vote){


    const embed =
    EmbedBuilder.from(
        interaction.message.embeds[0]
    );


    embed.setFields(

        {
            name:"🟢 Pour",

            value:
            `${vote.pour.length}`,

            inline:true
        },

        {
            name:"🔴 Contre",

            value:
            `${vote.contre.length}`,

            inline:true
        }

    );



    await interaction.message.edit({

        embeds:[
            embed
        ]

    });


}






// Vérification automatique des fins de votes

setInterval(async()=>{


    const fs = require("fs");


    const votes =
    JSON.parse(
        fs.readFileSync("./data/votes.json")
    );



    for(
        const id in votes
    ){


        const vote =
        votes[id];



        if(
            vote.termine
            ||
            Date.now() < vote.fin
        ){

            continue;

        }




        // Egalité

        if(
            vote.pour.length
            ===
            vote.contre.length
        ){


            vote.fin =
            Date.now() + 86400000;


            vote.prolongation = true;


            db.saveVote(
                id,
                vote
            );


            continue;

        }




        terminerVote(
            id,
            vote
        );


    }



},60000);







async function terminerVote(id,vote){


    vote.termine = true;


    db.saveVote(
        id,
        vote
    );



    const resultat =

    vote.pour.length >
    vote.contre.length

    ? "✅ Proposition acceptée"

    :

    "❌ Proposition refusée";





    const message =

`
🏛️ **Résultat de la proposition**

💡 ${vote.titre}


🟢 Pour :
${vote.pour.length}


🔴 Contre :
${vote.contre.length}


${resultat}
`;





    const channel =
    await global.client.channels.fetch(
        vote.salonId
    ).catch(()=>null);



    if(channel){


        await channel.send(message);


        setTimeout(()=>{

            channel.permissionOverwrites.edit(
                channel.guild.roles.everyone,
                {
                    SendMessages:false
                }
            );


        },5000);


    }




    // DM des votants

    const membres =
    [
        ...vote.pour,
        ...vote.contre
    ];



    for(
        const membre of membres
    ){


        const user =
        await global.client.users.fetch(membre)
        .catch(()=>null);



        if(user){

            user.send(message)
            .catch(()=>{});


        }


    }


}
