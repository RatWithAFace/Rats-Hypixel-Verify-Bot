const { Client, GatewayIntentBits, EmbedBuilder, IntentsBitField } = require('discord.js')
const { config } = require('process')
const { token, hypixelKey, memberRole } = require('./config.json')
const axios = require('axios').default

const client = new Client({ intents: 3276799 })

client.once('ready', () => {
	console.log('Ready!')
})

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return

	const { commandName } = interaction
    var uuid
    var username
    var embed
    var memrole

	if (commandName === 'ping') {
		await interaction.reply('Pong!')
	} else if (commandName === 'verify') {
        username = interaction.options.get('username').value
        console.log(username)
        axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`)
        .catch(async err => (
            console.log(`Unable to communicate with Mojang API:
            ${err}`)
        ))
        .then(async response => {

            async function nolink() {
                var embed = new EmbedBuilder()
                    .setColor('#fc3a3a')
                    .setTitle('Verification was unsuccessful!')
                    .setDescription(`Your Discord and Minecraft accounts have not been linked properly! Your current settings on Hypixel suggest that you do not have Discord. Please change this so you may be verified successfully!`)
                    await interaction.reply({embeds: [embed], ephemeral: true})
            }
            uuid = response.data.id
            axios.get(`https://api.hypixel.net/player?key=${hypixelKey}&uuid=${uuid}`)
            .catch(err => (
                console.log(`Unable to communicate with Hypixel API:
                ${err}`)
            ))
            .then(async response => {
                if (typeof response.data.player.socialMedia !== 'undefined') {
                    if (typeof response.data.player.socialMedia.links !== 'undefined') {
                        if (typeof response.data.player.socialMedia.links.DISCORD !== 'undefined') {
                            var dc = response.data.player.socialMedia.links.DISCORD
                            // HAS DC LINKED
                            if (interaction.member.user.tag == dc) {
                                // DC CORRECT
                                memrole = interaction.guild.roles.cache.find(r => r.id === memberRole)
                                if (interaction.member.kickable) {
                                    var embed = new EmbedBuilder()
                                    .setColor('#3afc6e')
                                    .setTitle('Verified User!')
                                    .setDescription('Your Discord and Minecraft accounts have been linked successfully! Your nickname has been changed to your Minecraft username.')
                                    interaction.member.roles.add(memrole)
                                    interaction.member.setNickname(username)
                                    await interaction.reply({embeds: [embed], ephemeral: true})
                                } else {
                                    var embed = new EmbedBuilder()
                                    .setColor('Blue')
                                    .setTitle('Verification was semi-successful!')
                                    .setDescription(`Your nickname cannot be changed! But don't worry, your account was linked!`)
                                    interaction.member.roles.add(memrole)
                                    await interaction.reply({ embeds: [embed], ephemeral: true})
                                }
                    } else {
                        // DC INCORRECT
                         var embed = new EmbedBuilder()
                            .setColor('#fc3a3a')
                            .setTitle('Verification was unsuccessful!')
                            .setDescription(`Your Discord and Minecraft accounts have not been linked properly! Your current settings on Hypixel suggest that you are ${dc}. Please change this so you may be verified successfully!`)
                        await interaction.reply({embeds: [embed], ephemeral: true})
                    }
                        } else {
                            nolink()
                        }
                    } else {
                        nolink()
                    }
                } else {
                    nolink()
                }

        })

        })
	}
})

client.login(token)