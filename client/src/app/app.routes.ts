import { Routes } from '@angular/router';
import { StoryListComponent } from './components/story-list/story-list';
import { StoryViewComponent } from './components/story-view/story-view';

export const routes: Routes = [
  { path: '', component: StoryListComponent },
  { path: 'story/:id', component: StoryViewComponent },
  { path: '**', redirectTo: '' }
];
