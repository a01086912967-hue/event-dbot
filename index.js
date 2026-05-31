const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Events
} = require('discord.js');

const ms = require('ms');

const TOKEN = process.env.TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

const events = new Map();

client.once(Events.ClientReady, () => {
    console.log(`${client.user.tag} 온라인!`);
});

client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isChatInputCommand()) {
if (interaction.commandName === '종료') {

    const lastEventId = Array.from(events.keys()).pop();

    if (!lastEventId) {
        return interaction.reply({
            content: '진행 중인 이벤트가 없습니다.',
            ephemeral: true
        });
    }

    events.delete(lastEventId);

    return interaction.reply({
        content: '✅ 가장 최근 이벤트를 강제 종료했습니다.',
        ephemeral: true
    });
}
        if (interaction.commandName === '룰렛') {

            const time = interaction.options.getString('시간');
            const winnersCount = interaction.options.getInteger('인원');
            const prize = interaction.options.getString('상품이름');
            const role = interaction.options.getRole('보유역할');
            const forcedWinner = interaction.options.getUser('뽑기');

            const eventId = Date.now().toString();

            events.set(eventId, {
    participants: [],
    winnersCount,
    prize,
    roleId: role.id,
    hostId: interaction.user.id,
    forcedWinnerId: forcedWinner?.id || null,
    endTime: Date.now() + ms(time)
});

            const embed = new EmbedBuilder()
    .setColor('Green')
    .setTitle(prize)
    .setDescription(
`호스트: <@${interaction.user.id}>

참가자: 0명

**당첨자: 추첨 전**

### 보유 역할
${role}`
);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`join_${eventId}`)
                        .setLabel('🎉 참가하기')
                        .setStyle(ButtonStyle.Success)
                );

            await interaction.reply({
    content: '✨ 이벤트 생성 완료!',
    ephemeral: true
});

const message = await interaction.channel.send({
    content: '@everyone',
    embeds: [embed],
    components: [row]
});

            setTimeout(async () => {
                const data = events.get(eventId);

                if (!data) return;

                const participants = data.participants;

if (participants.length === 0) {
                    interaction.channel.send('🎉 이벤트 종료!\n참가자가 없습니다.');
                    events.delete(eventId);
                    return;
                }

                let winners;

if (data.forcedWinnerId) {
    winners = [data.forcedWinnerId];
} else {
    const shuffled = [...participants]
        .sort(() => Math.random() - 0.5);

    winners = shuffled.slice(
        0,
        Math.min(data.winnersCount, participants.length)
    );
}
                let winnerList = '';
                const endedEmbed = EmbedBuilder.from(message.embeds[0])
.setColor('Red')
.setDescription(`
⛔ <t:${Math.floor(data.endTime / 1000)}:R> 종료됨

호스트: <@${data.hostId}>

참가자: ${participants.length}명

**당첨자: ${winners.map(id => `<@${id}>`).join(', ')}**
`);

await message.edit({
    embeds: [endedEmbed],
    components: []
});

                winners.forEach((id, index) => {
                    winnerList += `${index + 1}. <@${id}>\n`;
                });

                interaction.channel.send(`

-# ${winners.map(id => `<@${id}>`).join(', ')} 님, 당첨 축하드려요!

상품: ${data.prize}

당첨자

${winnerList}
`);

                events.delete(eventId);

            }, ms(time));
        }
    }

    if (interaction.isButton()) {
await interaction.deferUpdate();
        if (!interaction.customId.startsWith('join_')) return;

        const eventId = interaction.customId.split('_')[1];

        const data = events.get(eventId);

        if (!data) {
            return interaction.followUp({
                content: '이미 종료된 이벤트입니다.',
                ephemeral: true
            });
        }

        const member = await interaction.guild.members.fetch(
            interaction.user.id
        );

        if (!member.roles.cache.has(data.roleId)) {
            return interaction.followUp({
                content: '역할이 없어, 이벤트 참가가 불가능합니다! ❌',
                ephemeral: true
            });
        }

        if (data.participants.includes(interaction.user.id)) {
            return interaction.followUp({
                content: '이미 참가했습니다!',
                ephemeral: true
            });
        }

        data.participants.push(interaction.user.id);

const oldEmbed = interaction.message.embeds[0];

const newEmbed = EmbedBuilder.from(oldEmbed)
.setDescription(`
${Date.now() < data.endTime ? '🟢' : '⛔'} <t:${Math.floor(data.endTime / 1000)}:R> 종료됨

호스트: <@${data.hostId}>

참가자: ${data.participants.length}명

**당첨자: 추첨 전**

### 보유 역할
<@&${data.roleId}>
`)

await interaction.message.edit({
    embeds: [newEmbed]
});

interaction.reply({
    content: '🎉 참가 완료!',
    ephemeral: true
});
    }
});

client.login(TOKEN);
