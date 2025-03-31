import { Component, OnInit } from '@angular/core';
import { oppsConfig } from '../../config/opps.config'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  opps = oppsConfig;

  constructor(){}

  ngOnInit(): void {
      
  }

}
