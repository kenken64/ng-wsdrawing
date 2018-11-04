import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Event } from './event';
import { environment } from '../environments/environment';
import * as socketIo from 'socket.io-client';

const SERVER_URL = environment.ws_server;
@Injectable({
  providedIn: 'root'
})
export class WsSocketService {
  
  constructor() { }

  private socket;

  public initSocket(): void {
      this.socket = socketIo(SERVER_URL);
  }

  public send(message: any): void {
      this.socket.emit('message', message);
  }

  public onMessage(): Observable<any> {
      return new Observable<any>(observer => {
          this.socket.on('message', (data: any) => observer.next(data));
      });
  }

  public onEvent(event: Event): Observable<any> {
      return new Observable<Event>(observer => {
          this.socket.on(event, () => observer.next());
      });
  }
}
