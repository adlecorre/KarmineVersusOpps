import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LeagueOfLegendsService {
  private apiUrl = "https://esports-api.lolesports.com/persisted/gw/getStandings?hl=fr-FR&tournamentId=112445505684034122";
  private key = "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z";
  private tournamentKey = "112445505684034122";
  private lang = 'fr-FR';

  constructor(private http: HttpClient) {}

  getMatches(): Observable<any> {
    const headers = new HttpHeaders({ 'x-api-key': this.key });
    let httpParams = new HttpParams().set('hl', this.lang).set('tournamentId', this.tournamentKey);
    
    return this.http.get(this.apiUrl, { headers });
  }
}
