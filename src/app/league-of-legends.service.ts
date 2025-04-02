import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { tournamentLoLConfig } from 'src/config/tournamentsLoL.config';

interface GameInfoResponse {
  frames: any[];
}

@Injectable({
  providedIn: 'root',
})
export class LeagueOfLegendsService {
  private readonly apiUrl = 'https://esports-api.lolesports.com/persisted/gw/getStandings';
  private readonly key = '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z';
  private readonly gameInfoUrl = 'https://feed.lolesports.com/livestats/v1/details';

  constructor(private http: HttpClient) {}

  getAllTournamentsMatches(): Observable<any[]> {
    const tournamentIds = this.extractTournamentIds();
    const requests = tournamentIds.map((id) => this.getMatchesByTournament(id));

    return forkJoin(requests).pipe(
      tap((matchesArrays) => console.log('Fetched matches:', matchesArrays)),
      switchMap((matchesArrays) => {
        const allMatches = matchesArrays.flat();
        console.log('All matches:', allMatches);
        const gameIds = allMatches.map((match) => {
          const gameId = (BigInt(match.id) + BigInt(1)).toString();
          return gameId;
        }).filter((gameId): gameId is string => gameId !== null);

        const gameInfoRequests = gameIds.map((gameId) =>
          this.getGameInfo(gameId).pipe(
            map((gameInfo) => ({ gameId, gameInfo })),
            catchError((err) => {
              console.error(`Error fetching game info for gameId ${gameId}`, err);
              return of({ gameId, gameInfo: null });
            })
          )
        );

        return forkJoin(gameInfoRequests).pipe(
          map((gameInfos) => {
            return allMatches.map((match) => {
              const gameId = (BigInt(match.id) + BigInt(1)).toString();
              const gameInfo = gameInfos.find((gi) => gi.gameId === gameId)?.gameInfo;
              const rfc460Timestamp = gameInfo?.frames[0]?.rfc460Timestamp || null;
              return { ...match, rfc460Timestamp };
            });
          })
        );
      }),
      catchError((err) => {
        console.error('Error fetching matches or game info', err);
        return of([]);
      })
    );
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
    let params = new HttpParams().set('hl', 'fr-FR').set('tournamentId', tournamentId);

    return this.http.get(this.apiUrl, { headers, params }).pipe(
      map((data) => this.extractMatchesKC(data)),
      catchError((err) => {
        console.error('Error fetching matches for tournament', err);
        return of([]);
      })
    );
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

  getGameInfo(gameId: string): Observable<GameInfoResponse> {
    const headers = new HttpHeaders({ 'x-api-key': this.key });
    const url = `${this.gameInfoUrl}/${gameId}`;

    return this.http.get<GameInfoResponse>(url, { headers }).pipe(
      catchError((err) => {
        console.error('Error fetching game info', err);
        throw err;
      })
    );
  }
}
