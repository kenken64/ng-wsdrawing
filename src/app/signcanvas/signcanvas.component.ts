import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
  OnInit
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { pairwise, switchMap, takeUntil } from 'rxjs/operators';
import { WsSocketService } from '../ws-socket.service';
import { Event } from '../event';

@Component({
  selector: 'app-signcanvas',
  templateUrl: './signcanvas.component.html',
  styleUrls: ['./signcanvas.component.css']
})
export class SigncanvasComponent implements AfterViewInit, OnDestroy, OnInit {

  @Input() width = 800;
  @Input() height = 600;
  @ViewChild('canvas') canvas: ElementRef;
  cx: CanvasRenderingContext2D;
  drawingSubscription: Subscription;
  ioConnection: any;
  messages: any[] = [];
  
  constructor(private ws: WsSocketService) {
    this.initIoConnection();
  }

  clearDrawing(){
    console.log("clear ?");
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    this.ws.send({type:2});
    this.ws.disconnect();
    this.initIoConnection();
  }
  private initIoConnection(): void {
    this.ws.initSocket();

    this.ioConnection = this.ws.onMessage()
      .subscribe((message: any) => {
        
        //this.messages.push(message);
        if(message.type == 1){
          if (!this.cx) {
            return;
          }
      
          console.log(message);
          this.cx.lineTo(message.x, message.y);
          if(message.x > 0 && message.y > 0){
            this.cx.stroke();
          }
        }else{
          const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
          this.cx.clearRect(0, 0, canvasEl.width, canvasEl.height);
          this.messages = [];
        }
      });

    this.ws.onEvent(Event.CONNECT) 
      .subscribe(() => {
        console.log('connected');
      });
      
    this.ws.onEvent(Event.DISCONNECT)
      .subscribe(() => {
        console.log('disconnected');
      });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    // get the context
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');

    // set the width and height
    canvasEl.width = this.width;
    canvasEl.height = this.height;

    // set some default properties about the line
    this.cx.lineWidth = 3;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';

    // we'll implement this method to start capturing mouse events
    this.captureEvents(canvasEl);
  }

  captureEvents(canvasEl: HTMLCanvasElement) {
    this.drawingSubscription = fromEvent(canvasEl, 'mousedown')
      .pipe(
        switchMap(e => {
          return fromEvent(canvasEl, 'mousemove').pipe(
            takeUntil(fromEvent(canvasEl, 'mouseup')),
            takeUntil(fromEvent(canvasEl, 'mouseleave')),
            pairwise()
          );
        })
      )
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        const rect = canvasEl.getBoundingClientRect();
        const prevPos = {
          x: res[0].clientX - rect.left,
          y: res[0].clientY - rect.top
        };

        const currentPos = {
          type: 1,
          prevPos: prevPos,
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top
        };
        this.drawOnCanvas(prevPos, currentPos);
        console.log("delay ? " + JSON.stringify(currentPos));
        //console.log(res);
        if(currentPos){
          this.ws.send(currentPos);
        }
        
      });
  }

  drawOnCanvas(
    prevPos: { x: number; y: number },
    currentPos: { x: number; y: number }
  ) {
    if (!this.cx) {
      return;
    }

    this.cx.beginPath();

    if (prevPos) {
      this.cx.moveTo(prevPos.x, prevPos.y); // from
      this.cx.lineTo(currentPos.x, currentPos.y);
      this.cx.stroke();
    }
  }
  
  ngOnDestroy() {
    this.drawingSubscription.unsubscribe();
  }

}
