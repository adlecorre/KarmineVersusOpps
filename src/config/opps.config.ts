type TeamConfig = {
  aliases: string[];
  games: string[];
};

type OppsConfig = {
  [key: string]: TeamConfig; // Utilisation d'une signature d'indexation pour permettre d'accéder à une équipe par son nom
};

export const oppsConfig: OppsConfig = {
  'GentleMates': {
    aliases: ['GentleMates', 'M8'],
    games: ['Rocket League', 'Valorant (VCT)', 'League of Legends (LFL)']
  },
  'Solary': {
    aliases: ['Solary', 'SLY'],
    games: ['League of Legends (LFL)']
  },
  'Vitality': {
    aliases: ['Vitality', 'VIT', 'VITB'],
    games: ['Rocket League', 'Valorant (VCT)', 'League of Legends (LEC)', 'League of Legends (LFL)']
  }
};
