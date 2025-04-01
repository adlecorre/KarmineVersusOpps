import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tournamentLoLConfig } from 'src/config/tournamentsLoL.config';
@Injectable({
  providedIn: 'root',
})
export class LeagueOfLegendsService {
  private readonly apiUrl =
    'https://esports-api.lolesports.com/persisted/gw/getStandings';
  private readonly key = '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z';

  constructor(private http: HttpClient) {}

  getAllTournamentsMatches(): Observable<any[]> {
    const tournamentIds = this.extractTournamentIds();
    const requests = tournamentIds.map((id) => this.getMatchesByTournament(id));

    return new Observable((observer) => {
      let allMatches: any[] = [];
      let completedRequests = 0;

      requests.forEach((req) => {
        req.subscribe({
          next: (matches) => {
            allMatches = [...allMatches, ...matches];
          },
          error: (err) => observer.error(err),
          complete: () => {
            completedRequests++;
            if (completedRequests === requests.length) {
              observer.next(allMatches);
              observer.complete();
            }
          },
        });
      });
    });
  }

  extractTournamentIds(): string[] {
    const ids: string[] = [];
    Object.values(tournamentLoLConfig).forEach((category) => {
      Object.values(category).forEach((tournament: any) => {
        if (tournament.id) {
          ids.push(tournament.id);
        }
      });
    });
    return ids;
  }

  getMatchesByTournament(tournamentId: string): Observable<any[]> {
    const headers = new HttpHeaders({ 'x-api-key': this.key });
    let params = new HttpParams()
      .set('hl', 'fr-FR')
      .set('tournamentId', tournamentId);

    return new Observable((observer) => {
      this.http.get(this.apiUrl, { headers, params }).subscribe({
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
