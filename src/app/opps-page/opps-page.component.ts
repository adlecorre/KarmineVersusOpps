import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { oppsConfig } from '../../config/opps.config'
import { LeagueOfLegendsService } from '../league-of-legends.service';


@Component({
  selector: 'app-opps-page',
  templateUrl: './opps-page.component.html',
  styleUrls: ['./opps-page.component.css']
})
export class OppsPageComponent implements OnInit {
  oppsName: string | undefined;
  opps = oppsConfig
  opp: any = {};
  matches: any[] = [];
  teams: any[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private lolMatchService: LeagueOfLegendsService) {}

  ngOnInit(): void {
      this.route.paramMap.subscribe(params => {
      this.oppsName = params.get('oppsName') ?? 'Not an opp';
      this.getStandings();
      this.getOppDetails();
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


  getStandings(): void {
    this.lolMatchService.getMatches().subscribe({
      next: (data) => {
        this.extractTeams(data);
      },
      error: (err) => console.error('Erreur lors de la récupération des standings:', err)
    });
  }

extractTeams(data: any): any[] {
    data.data.standings.forEach((standing: any) => {
        standing.stages.forEach((stage: any) => {
            stage.sections.forEach((section: any) => {
                section.matches.forEach((match: any) => {
                   if (match.teams.length === 2) {
                        const teamCodes = match.teams.map((team: any) => team.code);
                        if ((teamCodes.includes("KCB") || teamCodes.includes("KC")) 
                        && this.opp.aliases.some((alias: string) => teamCodes.includes(alias))) {
                            this.matches.push(match);
                        }
                    } 
                });
            });
        });
    });
    return this.matches;
}






}
