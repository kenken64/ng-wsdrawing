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
import * as jsPDF from 'jspdf';
//import * as html2canvas from 'html2canvas';
import html2canvas from 'html2canvas';
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
  colour: string = '#000';

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

  changeMarkerColour(makerColour: string){
    console.log(makerColour);
    this.cx.strokeStyle = makerColour;
  }

  private initIoConnection(): void {
    this.ws.initSocket();

    this.ioConnection = this.ws.onMessage()
      .subscribe((message: any) => {
        //console.log(message);
        this.messages.push(message);
        if(message.type == 1){
          let prevPos = {
            x0: message.x0,
            y0: message.y0
          };
  
          let currentPos = {
            x1: message.x1,
            y1: message.y1
          };
          this.cx.strokeStyle = message.colour;
          this.drawOnCanvas(prevPos, currentPos);
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
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');

    canvasEl.width = this.width;
    canvasEl.height = this.height;

    this.cx.lineWidth = 3;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = this.colour;

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
          x0: res[0].clientX - rect.left,
          y0: res[0].clientY - rect.top
        };

        const currentPos = {
          type: 1,
          colour: this.cx.strokeStyle,
          x1: res[1].clientX - rect.left,
          y1: res[1].clientY - rect.top
        };
        this.drawOnCanvas(prevPos, currentPos);
        console.log(prevPos,currentPos)
        this.ws.send({...prevPos,...currentPos});
      });
  }

  drawOnCanvas(
    prevPos: { x0: number; y0: number },
    currentPos: { x1: number; y1: number }
  ) {
    if (!this.cx) {
      return;
    }

    this.cx.beginPath();

    if (prevPos) {
      this.cx.moveTo(prevPos.x0, prevPos.y0); // from
      this.cx.lineTo(currentPos.x1, currentPos.y1);
      this.cx.stroke();
    }
  }
  
  ngOnDestroy() {
    this.drawingSubscription.unsubscribe();
  }
  
  saveasPDF(){
    html2canvas(document.getElementById('drawing')).then((canvas)=>{
      let img = canvas.toDataURL('image/png');
      let doc = new jsPDF();
      doc.addImage(img , 'JPEG', 5, 20);
      doc.save('canvasdraw.pdf');
    });
  }
}
