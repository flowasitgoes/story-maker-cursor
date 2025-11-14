import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// 使用环境变量，如果不存在则使用默认值
const API_URL = (typeof window !== 'undefined' && (window as any).__API_URL__) 
  || process.env['NG_APP_API_URL'] 
  || '/api';

export interface Story {
  _id: string;
  title: string;
  rootParagraphId: string;
  createdAt: string;
}

export interface Paragraph {
  _id: string;
  storyId: string;
  content: string;
  author: string;
  location: string;
  parentId: string | null;
  branchId: string | null;
  createdAt: string;
  children?: Paragraph[];
}

export interface Contribution {
  _id: string;
  paragraphId: string;
  content: string;
  author: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class StoryService {
  constructor(private http: HttpClient) {}

  getStories(): Observable<Story[]> {
    return this.http.get<Story[]>(`${API_URL}/stories`);
  }

  getStory(id: string): Observable<{ story: Story; tree: Paragraph[]; paragraphs: Paragraph[] }> {
    return this.http.get<{ story: Story; tree: Paragraph[]; paragraphs: Paragraph[] }>(`${API_URL}/stories/${id}`);
  }

  createStory(title: string, initialContent: string, author: string, location: string): Observable<any> {
    return this.http.post(`${API_URL}/stories`, { title, initialContent, author, location });
  }

  addParagraph(storyId: string, content: string, author: string, location: string, parentId?: string, branchId?: string): Observable<Paragraph> {
    return this.http.post<Paragraph>(`${API_URL}/stories/${storyId}/paragraphs`, {
      content,
      author,
      location,
      parentId,
      branchId
    });
  }

  getContributions(paragraphId: string): Observable<Contribution[]> {
    return this.http.get<Contribution[]>(`${API_URL}/paragraphs/${paragraphId}/contributions`);
  }

  submitContribution(paragraphId: string, content: string, author: string): Observable<Contribution> {
    return this.http.post<Contribution>(`${API_URL}/paragraphs/${paragraphId}/contributions`, {
      content,
      author
    });
  }

  acceptContribution(contributionId: string): Observable<any> {
    return this.http.put(`${API_URL}/contributions/${contributionId}/accept`, {});
  }

  rejectContribution(contributionId: string): Observable<any> {
    return this.http.put(`${API_URL}/contributions/${contributionId}/reject`, {});
  }

  logInput(logEntry: any): Observable<any> {
    return this.http.post(`${API_URL}/logs`, logEntry);
  }
}
