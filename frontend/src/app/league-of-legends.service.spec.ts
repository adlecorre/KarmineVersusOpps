import { TestBed } from '@angular/core/testing';

import { LeagueOfLegendsService } from './league-of-legends.service';

describe('LeagueOfLegendsService', () => {
  let service: LeagueOfLegendsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeagueOfLegendsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
