const fs = require("fs");


const fichier = "./data/votes.json";



function charger(){

    return JSON.parse(
        fs.readFileSync(fichier)
    );

}



function sauvegarder(data){

    fs.writeFileSync(

        fichier,

        JSON.stringify(
            data,
            null,
            2
        )

    );

}



function createVote(data){

    const votes = charger();


    votes[data.messageId] = {

        ...data,

        pour: [],

        contre: [],

        termine:false

    };


    sauvegarder(votes);

}



function getVote(id){

    const votes = charger();

    return votes[id];

}



function saveVote(id,data){

    const votes = charger();

    votes[id] = data;

    sauvegarder(votes);

}



module.exports={

    createVote,

    getVote,

    saveVote

};
