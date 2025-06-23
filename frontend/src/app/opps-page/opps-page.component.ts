import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { oppsConfig } from '../../config/opps.config';
import { gameMappings } from '../../config/gameMapping'; // Importez le fichier de mappage
import { animate, style, transition, trigger } from '@angular/animations';
import { YouTubeService } from '../youtube.service';
import { MatchService } from '../match.service';

@Component({
  selector: 'app-opps-page',
  templateUrl: './opps-page.component.html',
  styleUrls: ['./opps-page.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '600ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
  ],
})
export class OppsPageComponent implements OnInit {
  oppsName: string | undefined;
  opps = oppsConfig;
  opp: any = {};
  allMatches: any[] = [];
  matches: any[] = [];
  teams: any[] = [];
  matchesToCome: any[] = [];
  activeCompetitions: Set<string> = new Set();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly youtubeService: YouTubeService,
    private readonly matchService: MatchService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.oppsName = params.get('oppsName') ?? 'Not an opp';
      this.getOppDetails();

      this.matchService.getMatches().subscribe({
        next: (data) => {
          this.allMatches = data;
          console.log('Matches récupérés depuis l’API :', data);
          this.extractTeams(this.allMatches);
        },
        error: (err) => {
          console.error(
            "Erreur lors du chargement des matchs depuis l'API :",
            err
          );
        },
      });
    });
  }

  getOppDetails(): void {
    if (this.oppsName && this.opps[this.oppsName]) {
      this.opp = this.opps[this.oppsName];
    } else {
      this.opp = { aliases: ['Non trouvé'], games: [] };
    }
  }

  extractTeams(matches: any[]): void {
    matches.forEach((match: any) => {
      if (
        this.opp.aliases.some((alias: string) => match.opps.includes(alias))
      ) {
        this.matches.push(match);
      }
    });
  }

  formatDate(isoString: string): string {
    const date = new Date(isoString);
    return `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
  }

  getFormattedScore(match: any): string {
    const team0 = match.teams[0].code;
    if (team0 === 'KCB' || team0 === 'KC') {
      return `${match.scoreKC} - ${match.scoreOpps}`;
    } else {
      return `${match.scoreOpps} - ${match.scoreKC}`;
    }
  }

  formatGame(game: string): string {
    return game
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  formatGameName(game: string): string {
    const mappedCompetition = gameMappings[game];
    if (mappedCompetition) {
      return mappedCompetition;
    }
    return game.toUpperCase();
  }



toggleClicked(game: string): void {
  if (this.activeCompetitions.has(game)) {
    this.activeCompetitions.delete(game);
  } else {
    this.activeCompetitions.add(game);
  }
}


  isClicked(game: string): boolean {
  return this.activeCompetitions.has(game);
}


  formatCompetition(match: any): string {
    return match.competition.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }

// Winrate calculation
 
}
