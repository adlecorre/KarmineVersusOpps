import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { oppsConfig } from '../../config/opps.config';
import { LeagueOfLegendsService } from '../league-of-legends.service';

@Component({
  selector: 'app-opps-page',
  templateUrl: './opps-page.component.html',
  styleUrls: ['./opps-page.component.css'],
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
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }
}
