import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { oppsConfig } from '../../config/opps.config'


@Component({
  selector: 'app-opps-page',
  templateUrl: './opps-page.component.html',
  styleUrls: ['./opps-page.component.css']
})
export class OppsPageComponent implements OnInit {
  oppsName: string | undefined;
  opps = oppsConfig

  constructor(
    private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
      this.route.paramMap.subscribe(params => {
      this.oppsName = params.get('oppsName') ?? 'Not an opp';
  });
  }

}
