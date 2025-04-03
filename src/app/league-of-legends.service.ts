import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  catchError,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { tournamentLoLConfig } from 'src/config/tournamentsLoL.config';
interface GameInfoResponse {
  frames: {
    rfc460Timestamp?: string;
    // Ajoutez d'autres propriétés si nécessaire
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class LeagueOfLegendsService {
  private readonly apiUrl =
    'https://esports-api.lolesports.com/persisted/gw/getStandings';
  private readonly key = '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z';
  private readonly gameInfoUrl =
    'https://feed.lolesports.com/livestats/v1/details';

  constructor(private http: HttpClient) {}

  getAllTournamentsMatches(): Observable<any[]> {
    const tournamentIds = this.extractTournamentIds();
    const requests = tournamentIds.map((id) => this.getMatchesByTournament(id));

    return forkJoin(requests).pipe(
      tap((matchesArrays) => console.log('Fetched matches:', matchesArrays)),
      switchMap((matchesArrays) => {
        const allMatches = matchesArrays.flat();
        console.log('All matches:', allMatches);
        const gameIds = allMatches
          .map((match) => {
            const gameId = (BigInt(match.id) + BigInt(1)).toString();
            return gameId;
          })
          .filter((gameId): gameId is string => gameId !== null);

        const gameInfoRequests = gameIds.map((gameId) =>
          this.getGameInfo(gameId).pipe(
            map((gameInfo) => ({ gameId, gameInfo })),
            catchError((err) => {
              console.error(
                `Error fetching game info for gameId ${gameId}`,
                err
              );
              return of({ gameId, gameInfo: null });
            })
          )
        );

        return forkJoin(gameInfoRequests).pipe(
          map((gameInfos) => {
            return allMatches.map((match) => {
              const gameId = (BigInt(match.id) + BigInt(1)).toString();
              const gameInfo = gameInfos.find(
                (gi) => gi.gameId === gameId
              )?.gameInfo;
              const rfc460Timestamp =
                gameInfo?.frames[0]?.rfc460Timestamp ?? null;
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
    // Directly return the keys of the configuration object as they are the tournament IDs
    return Object.keys(tournamentLoLConfig);
  }

  getMatchesByTournament(tournamentId: string): Observable<any[]> {
    const headers = new HttpHeaders({ 'x-api-key': this.key });
    let params = new HttpParams()
      .set('hl', 'fr-FR')
      .set('tournamentId', tournamentId);

    return this.http.get(this.apiUrl, { headers, params }).pipe(
      map((data) => this.extractMatchesKC(data, tournamentId)),
      catchError((err) => {
        console.error('Error fetching matches for tournament', err);
        return of([]);
      })
    );
  }

  /**
   * Sort all matches in order to only keep de ones from Karmine Corp via tag KC or KCB
   * @param data json file of every matches from a specific tournament
   * @param tournamentId id from the specific tournament
   * @returns
   */
  extractMatchesKC(data: any, tournamentId: string): any[] {
    const matches: any[] = [];
    data.data.standings.forEach((standing: any) => {
      standing.stages.forEach((stage: any) => {
        stage.sections.forEach((section: any) => {
          section.matches.forEach((match: any) => {
            if (match.teams.length === 2) {
              const filteredTeam = match.teams.find(
                (team: any) => team.code === 'KCB' || team.code === 'KC'
              );
              const opponentTeam = match.teams.find(
                (team: any) => team.code !== 'KCB' && team.code !== 'KC'
              );

              if (filteredTeam && opponentTeam) {
                match.tournamentId = tournamentId;
                match.result = filteredTeam.result.outcome;
                match.scoreKC = filteredTeam.result.gameWins;
                match.scoreOpps = opponentTeam.result.gameWins; 
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
