const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const token = process.env.TOKEN;
const commands = [
    new SlashCommandBuilder()
        .setName('룰렛')
        .setDescription('이벤트를 생성합니다.')
        .addStringOption(option =>
            option.setName('시간')
                .setDescription('예: 1시간')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('인원')
                .setDescription('당첨 인원')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('상품이름')
                .setDescription('상품명')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('보유역할')
                .setDescription('참가에 필요한 역할')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('뽑기')
                .setDescription('뽑기를 진행합니다. (관리자 전용)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('종료')
        .setDescription('가장 최근 이벤트를 강제 종료합니다.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('슬래시 명령어 등록 중...');

        await rest.put(
            Routes.applicationGuildCommands(
                '1510195820073455646',
                '1456729030459134115'
            ),
            { body: commands },
        );

        console.log('등록 완료!');
    } catch (error) {
        console.error(error);
    }
})();
