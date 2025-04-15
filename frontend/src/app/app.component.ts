import { trigger, transition, style, animate } from '@angular/animations';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
  trigger('slideInFooter', [
    transition(':enter', [
      style({ transform: 'translateY(100%)', opacity: 0 }),
      animate('500ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
    ])
  ])
]

})
export class AppComponent {
  title = 'KarmineVersusOpps';

  constructor(public router: Router) {}
  isHome(): boolean {
    return this.router.url === '/';
  }
}

