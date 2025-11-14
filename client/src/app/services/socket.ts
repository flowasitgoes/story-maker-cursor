import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  joinStory(storyId: string): void {
    this.socket.emit('join:story', storyId);
  }

  leaveStory(storyId: string): void {
    this.socket.emit('leave:story', storyId);
  }

  onStoryUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('story:update', (data) => {
        observer.next(data);
      });
    });
  }

  onNewParagraph(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('paragraph:new', (data) => {
        observer.next(data);
      });
    });
  }

  onNewContribution(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('contribution:new', (data) => {
        observer.next(data);
      });
    });
  }

  onContributionAccepted(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('contribution:accepted', (data) => {
        observer.next(data);
      });
    });
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}
