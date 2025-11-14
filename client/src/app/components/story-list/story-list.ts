import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StoryService, Story } from '../../services/story';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-story-list',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './story-list.html',
  styleUrl: './story-list.css',
})
export class StoryListComponent implements OnInit {
  stories: Story[] = [];
  showCreateForm = false;
  dbError: any = null;
  isLoading = false;
  newStory = {
    title: '',
    initialContent: '',
    author: '',
    location: ''
  };

  constructor(
    private storyService: StoryService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStories();
  }

  loadStories() {
    this.isLoading = true;
    this.dbError = null;
    this.storyService.getStories().subscribe({
      next: (stories) => {
        this.stories = stories;
        this.isLoading = false;
        this.dbError = null;
      },
      error: (err) => {
        console.error('加载故事失败:', err);
        this.isLoading = false;
        if (err.status === 503) {
          // MongoDB 未连接
          this.dbError = err.error || {
            error: '数据库连接失败',
            message: 'MongoDB 服务未运行',
            instructions: '请先启动 MongoDB 服务'
          };
        } else {
          this.dbError = {
            error: '加载失败',
            message: err.message || '无法加载故事列表'
          };
        }
      }
    });
  }

  createStory() {
    if (!this.newStory.title.trim()) {
      alert('请输入故事标题');
      return;
    }

    if (this.dbError) {
      alert('数据库未连接，无法创建故事。请先启动 MongoDB 服务。');
      return;
    }

    this.storyService.createStory(
      this.newStory.title,
      this.newStory.initialContent,
      this.newStory.author || '匿名',
      this.newStory.location
    ).subscribe({
      next: (result: any) => {
        this.showCreateForm = false;
        this.newStory = { title: '', initialContent: '', author: '', location: '' };
        this.loadStories();
        if (result.story) {
          this.router.navigate(['/story', result.story._id]);
        }
      },
      error: (err) => {
        console.error('创建故事失败:', err);
        if (err.status === 503) {
          const errorMsg = err.error?.message || 'MongoDB 服务未运行，请先启动 MongoDB 服务';
          alert(`创建故事失败: ${errorMsg}\n\n${err.error?.instructions || ''}`);
          this.dbError = err.error;
        } else {
          alert('创建故事失败: ' + (err.error?.message || err.message || '未知错误'));
        }
      }
    });
  }

  viewStory(id: string) {
    this.router.navigate(['/story', id]);
  }
}
