import { TestBed } from '@angular/core/testing';

import { WsSocketService } from './ws-socket.service';

describe('WsSocketService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WsSocketService = TestBed.get(WsSocketService);
    expect(service).toBeTruthy();
  });
});
