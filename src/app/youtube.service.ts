import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class YouTubeService {
  private apiKey = 'AIzaSyDM7JDfdiLXAlYfsxPKC8-TRdQfFahXT10'; // Remplacez par votre clé API YouTube
  private apiUrl = 'https://www.googleapis.com/youtube/v3/search';

   private allowedChannels = [
    'KametoYTB', 
    'KarmineCorpVOD'  
  ];

  constructor(private http: HttpClient) {}

  searchVideo(matchInfo: string) {
    const searchQuery = encodeURIComponent(matchInfo);
    const channelIds = this.allowedChannels.join(',');

    // Ajoutez les channelId dans les paramètres de la requête
    const url = `${this.apiUrl}?part=snippet&q=${searchQuery}&key=${this.apiKey}&maxResults=1&channelId=${channelIds}`;

    return this.http.get(this.apiUrl, {
      params: {
        channelIds: channelIds,
        maxResults: '1',
        part: 'snippet',
        q: searchQuery,
        key: this.apiKey
      }
  });
  };
}
