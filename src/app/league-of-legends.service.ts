import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LeagueOfLegendsService {
  private apiUrl =
    'https://esports-api.lolesports.com/persisted/gw/getStandings?hl=fr-FR&tournamentId=112445505684034122';
  private key = '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z';
  private tournamentKey = '112445505684034122';
  private lang = 'fr-FR';
  private matches: any[] = [];

  constructor(private http: HttpClient) {}

  getAllMatches(): Observable<any> {
    const headers = new HttpHeaders({ 'x-api-key': this.key });
    let httpParams = new HttpParams()
      .set('hl', this.lang)
      .set('tournamentId', this.tournamentKey);

    return this.http.get(this.apiUrl, { headers });
  }

  getMatches(): Observable<any[]> {
    return new Observable((observer) => {
      this.getAllMatches().subscribe({
        next: (data) => {
          const extractedMatches = this.extractMatchesKC(data);
          observer.next(extractedMatches);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  extractMatchesKC(data: any): any[] {
    const matches: any[] = [];
    data.data.standings.forEach((standing: any) => {
      standing.stages.forEach((stage: any) => {
        stage.sections.forEach((section: any) => {
          section.matches.forEach((match: any) => {
            if (match.teams.length === 2) {
              const teamCodes = match.teams.map((team: any) => team.code);
              if (teamCodes.includes('KCB') || teamCodes.includes('KC')) {
                matches.push(match);
              }
            }
          });
        });
      });
    });
    return matches;
  }
}
