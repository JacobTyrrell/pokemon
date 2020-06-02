var Eris = require('eris')
var client = new Eris(process.env.token)
var { MessageCollector } = require('eris-collector')
var fs = require('fs')
var counter = 0;

function randomPokemonObj() {
    var rData = fs.readFileSync('pokedex.json');
    var pokemonParse = JSON.parse(rData);
    var index = Math.floor(Math.random() * (150 -1 ) + 1)
    var pokemonObj = pokemonParse["pokemon"][[index]]
    var pokeObject = {
        name: pokemonObj["name"],
        img: pokemonObj["img"]
    }
    return pokeObject
}

function write(userID, pokemon) {
    const uID = userID.toString()
    const contents = fs.readFileSync('storage.json', { encoding: 'utf8' });
    const storage = JSON.parse(contents);
  
    if (!storage.hasOwnProperty(userID)) {
      storage[uID] = {
        pokemonCaught: [pokemon]
      };
      fs.writeFileSync('storage.json', JSON.stringify(storage, null, 2));
    } else {
      storage[userID].pokemonCaught.push(pokemon);
      fs.writeFileSync('storage.json', JSON.stringify(storage, null, 2));
    }
}

function resetUserPokemon(userID) {
    const uID = userID.toString()
    const contents = fs.readFileSync('storage.json', { encoding: 'utf8' });
    const storage = JSON.parse(contents);
    storage[uID] = {
        pokemonCaught: []
    };
    fs.writeFileSync('storage.json', JSON.stringify(storage, null, 2));
}

function getUserPokemon(userID) {
    const contents = fs.readFileSync('storage.json', { encoding: 'utf8' });
    const storage = JSON.parse(contents);

    if (storage.hasOwnProperty(userID)) {
        return storage[userID].pokemonCaught
    } else { 
        return
    }
}


client.on('messageCreate', async function(message) {
    if (message.author.bot) return;
    var whatPokemon = randomPokemonObj()
    counter += 1
    if (counter == 25) {
        counter = 0
        const data = { 
            embed: {
                title: "Who is this Pokemon?",
                image: {
                    url: whatPokemon.img
                }
            }
        };
        console.log(`${whatPokemon.name}`)
        let msg = await message.channel.createMessage(data)

        let filter = (m) => m.content === `pls catch ${whatPokemon.name}`;
        let collector = new MessageCollector(client, msg.channel, filter, {
            time: 1000 * 20
        });

        collector.on("collect", (m) => {
            message.channel.createMessage(`${m.author.mention}, you caught ${whatPokemon.name}!`)
            if (!getUserPokemon(m.author.id).includes(whatPokemon.name)) {
                write(m.author.id, whatPokemon.name)
            }
            counter = 0
        })
    }

    if (message.content == "pls pokemon") {
        if (getUserPokemon(message.author.id).length >= 1 ) {
            message.channel.createMessage(`You have: \`\`\`prolog\n${getUserPokemon(message.author.id).join('\n')}\`\`\`You caught **${getUserPokemon(message.author.id).length}** pokémon`)
        } else {
            message.channel.createMessage(`You haven't caught any Pokémon!`)
        }
    }

    if (message.content == "pls pokemon reset") {
        resetUserPokemon(message.author.id)
        message.channel.createMessage(`You have just reset your collection of Pokémon!`)
    }
})

client.connect()