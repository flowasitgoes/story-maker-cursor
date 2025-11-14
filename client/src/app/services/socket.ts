import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket | null = null;

  constructor() {
    // 注意：Vercel serverless functions 不支持 WebSocket
    // 在生产环境中，Socket.IO 功能将被禁用
    // 如果需要实时功能，请考虑使用其他部署方案或轮询
    const socketUrl = (typeof window !== 'undefined' && (window as any).__SOCKET_URL__) 
      || process.env['NG_APP_SOCKET_URL'] 
      || null;
    
    if (socketUrl) {
      try {
        this.socket = io(socketUrl, {
          transports: ['polling', 'websocket'], // 优先使用轮询，因为 Vercel 不支持 WebSocket
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        });
      } catch (error) {
        console.warn('Socket.IO 初始化失败，实时功能将不可用:', error);
      }
    } else {
      console.warn('Socket.IO URL 未配置，实时功能将不可用');
    }
  }

  joinStory(storyId: string): void {
    if (this.socket) {
      this.socket.emit('join:story', storyId);
    }
  }

  leaveStory(storyId: string): void {
    if (this.socket) {
      this.socket.emit('leave:story', storyId);
    }
  }

  onStoryUpdate(): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('story:update', (data) => {
          observer.next(data);
        });
      } else {
        // 如果没有 socket，返回一个空的 observable
        observer.complete();
      }
    });
  }

  onNewParagraph(): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('paragraph:new', (data) => {
          observer.next(data);
        });
      } else {
        observer.complete();
      }
    });
  }

  onNewContribution(): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('contribution:new', (data) => {
          observer.next(data);
        });
      } else {
        observer.complete();
      }
    });
  }

  onContributionAccepted(): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('contribution:accepted', (data) => {
          observer.next(data);
        });
      } else {
        observer.complete();
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
