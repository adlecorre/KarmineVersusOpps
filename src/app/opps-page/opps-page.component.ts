import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { oppsConfig } from '../../config/opps.config';
import { LeagueOfLegendsService } from '../league-of-legends.service';
import { tournamentLoLConfig } from 'src/config/tournamentsLoL.config';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-opps-page',
  templateUrl: './opps-page.component.html',
  styleUrls: ['./opps-page.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class OppsPageComponent implements OnInit {
  oppsName: string | undefined;
  opps = oppsConfig;
  opp: any = {};
  matches: any[] = [];
  teams: any[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly lolMatchService: LeagueOfLegendsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.oppsName = params.get('oppsName') ?? 'Not an opp';
      this.getOppDetails();

      this.lolMatchService.getAllTournamentsMatches().subscribe((data) => {
        console.log('data', data);
        this.extractTeams(data);
      });
    });
  }

  /**
   * Définit Opp comme l'objet de configuration sachant le nom
   */
  getOppDetails(): void {
    if (this.oppsName && this.opps[this.oppsName]) {
      this.opp = this.opps[this.oppsName];
    } else {
      this.opp = { aliases: ['Non trouvé'], games: [] };
    }
  }

  extractTeams(matches: any[]): void {
    matches.forEach((match: any) => {
      if (match.teams.length === 2) {
        const teamCodes = match.teams.map((team: any) => team.code);
        if (
          this.opp.aliases.some((alias: string) => teamCodes.includes(alias))
        ) {
          this.matches.push(match);
        }
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

  formatTournamentName(tournamentId: string): string {
    return tournamentLoLConfig[tournamentId]?.name || 'Unknown tournament';
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
      .toLowerCase() // Minuscule
      .replace(/[^a-z0-9]/g, ''); // Supprime tout sauf lettres/chiffres
  }

  clickedOpps: Set<string> = new Set();

toggleClicked(key: string): void {
  if (this.clickedOpps.has(key)) {
    this.clickedOpps.delete(key); // unclick
  } else {
    this.clickedOpps.add(key); // click
  }
}

isClicked(key: string): boolean {
  return this.clickedOpps.has(key);
}

}
