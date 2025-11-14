import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoryService, Story, Paragraph, Contribution } from '../../services/story';
import { SocketService } from '../../services/socket';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-story-view',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './story-view.html',
  styleUrl: './story-view.css',
})
export class StoryViewComponent implements OnInit, OnDestroy {
  story: Story | null = null;
  paragraphs: Paragraph[] = [];
  tree: Paragraph[] = [];
  selectedParagraph: Paragraph | null = null;
  contributions: Contribution[] = [];
  showAddParagraph = false;
  showContributionForm = false;
  
  newParagraph = {
    content: '',
    author: '',
    location: ''
  };
  
  newContribution = {
    content: '',
    author: ''
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private storyService: StoryService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    const storyId = this.route.snapshot.paramMap.get('id');
    if (storyId) {
      this.loadStory(storyId);
      this.socketService.joinStory(storyId);
      this.setupSocketListeners();
    }
  }

  ngOnDestroy() {
    if (this.story) {
      this.socketService.leaveStory(this.story._id);
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setupSocketListeners() {
    // 监听新段落
    const newParaSub = this.socketService.onNewParagraph().subscribe((paragraph: Paragraph) => {
      console.log('收到新段落通知:', paragraph);
      this.logInput('收到新段落', { paragraph });
      this.loadStory(this.story!._id);
    });
    this.subscriptions.push(newParaSub);

    // 监听新接话
    const newContSub = this.socketService.onNewContribution().subscribe((contribution: Contribution) => {
      console.log('收到新接话通知:', contribution);
      this.logInput('收到新接话', { contribution });
      if (this.selectedParagraph && contribution.paragraphId === this.selectedParagraph._id) {
        this.loadContributions(this.selectedParagraph._id);
      }
    });
    this.subscriptions.push(newContSub);

    // 监听接话被接受
    const acceptedSub = this.socketService.onContributionAccepted().subscribe(() => {
      console.log('收到接话被接受通知');
      this.logInput('收到接话被接受', {});
      this.loadStory(this.story!._id);
      if (this.selectedParagraph) {
        this.loadContributions(this.selectedParagraph._id);
      }
    });
    this.subscriptions.push(acceptedSub);
  }

  loadStory(id: string) {
    console.log('加载故事:', id);
    this.logInput('加载故事', { storyId: id });
    this.storyService.getStory(id).subscribe({
      next: (data) => {
        console.log('故事数据加载成功:', data);
        console.log('原始树状结构:', JSON.stringify(data.tree, null, 2));
        this.logInput('故事数据加载成功', { 
          story: data.story, 
          treeLength: data.tree.length, 
          paragraphsLength: data.paragraphs.length,
          tree: data.tree
        });
        this.story = data.story;
        this.paragraphs = data.paragraphs;
        // 使用后端返回的树状结构，已经正确构建
        this.tree = data.tree;
        console.log('使用后端返回的树状结构:', JSON.stringify(this.tree, null, 2));
        console.log('树状结构深度检查:', this.checkTreeDepth(this.tree));
        this.logInput('树状结构加载完成', { 
          treeLength: this.tree.length, 
          maxDepth: this.checkTreeDepth(this.tree),
          tree: this.tree 
        });
      },
      error: (err) => {
        console.error('加载故事失败:', err);
        this.logInput('加载故事失败', { error: err.message });
      }
    });
  }

  // 检查树状结构深度
  checkTreeDepth(tree: any[], level: number = 0): number {
    if (!tree || tree.length === 0) {
      return level;
    }
    
    let maxDepth = level;
    tree.forEach(node => {
      if (node.children && node.children.length > 0) {
        const childDepth = this.checkTreeDepth(node.children, level + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    });
    
    return maxDepth;
  }

  selectParagraph(paragraph: Paragraph) {
    console.log('选择段落:', paragraph);
    this.logInput('选择段落', { paragraphId: paragraph._id, content: paragraph.content });
    this.selectedParagraph = paragraph;
    this.loadContributions(paragraph._id);
    this.showContributionForm = false;
  }

  loadContributions(paragraphId: string) {
    console.log('加载接话:', paragraphId);
    this.logInput('加载接话', { paragraphId });
    this.storyService.getContributions(paragraphId).subscribe({
      next: (contributions) => {
        console.log('接话数据加载成功:', contributions);
        this.logInput('接话数据加载成功', { 
          paragraphId, 
          contributionsCount: contributions.length,
          contributions 
        });
        this.contributions = contributions.filter(c => c.status === 'pending');
      },
      error: (err) => {
        console.error('加载接话失败:', err);
        this.logInput('加载接话失败', { paragraphId, error: err.message });
      }
    });
  }

  addParagraph() {
    if (!this.newParagraph.content.trim()) {
      alert('请输入内容');
      return;
    }

    console.log('添加段落 - 输入内容:', this.newParagraph);
    this.logInput('添加段落', { 
      content: this.newParagraph.content, 
      author: this.newParagraph.author,
      location: this.newParagraph.location,
      parentId: this.selectedParagraph?._id || null,
      storyId: this.story?._id
    });

    const parentId = this.selectedParagraph?._id || null;
    const location = this.newParagraph.location || this.selectedParagraph?.location || '';
    
    // 保存输入内容，防止在请求过程中丢失
    const contentToAdd = this.newParagraph.content.trim();
    const authorToAdd = (this.newParagraph.author || '匿名').trim();
    const locationToAdd = location.trim();

    console.log('添加段落 - 准备发送:', { contentToAdd, authorToAdd, locationToAdd, parentId });

    // 先保存输入内容到变量
    const savedInput = { ...this.newParagraph };
    
    // 不清空表单，等成功后再说
    // this.newParagraph = { content: '', author: '', location: '' };

    this.storyService.addParagraph(
      this.story!._id,
      contentToAdd,
      authorToAdd,
      locationToAdd,
      parentId || undefined,
      undefined
    ).subscribe({
      next: (result) => {
        console.log('段落添加成功:', result);
        this.logInput('段落添加成功', { paragraph: result, savedInput });
        // 成功后清空表单
        this.newParagraph = { content: '', author: '', location: '' };
        this.showAddParagraph = false;
        // 延迟一点重新加载，确保数据已保存
        setTimeout(() => {
          this.loadStory(this.story!._id);
        }, 200);
      },
      error: (err) => {
        console.error('添加段落失败:', err);
        this.logInput('添加段落失败', { error: err.message, savedInput });
        // 失败时恢复输入内容
        this.newParagraph = savedInput;
        alert('添加段落失败: ' + (err.error?.message || err.message));
      }
    });
  }

  submitContribution() {
    if (!this.newContribution.content.trim()) {
      alert('请输入接话内容');
      return;
    }

    if (!this.selectedParagraph) {
      alert('请先选择一个段落');
      return;
    }

    console.log('提交接话 - 输入内容:', this.newContribution);
    this.logInput('提交接话', { 
      content: this.newContribution.content, 
      author: this.newContribution.author,
      paragraphId: this.selectedParagraph._id,
      storyId: this.story?._id
    });

    // 保存输入内容，防止在请求过程中丢失
    const contentToSubmit = this.newContribution.content.trim();
    const authorToSubmit = (this.newContribution.author || '匿名').trim();
    const paragraphId = this.selectedParagraph._id;

    console.log('提交接话 - 准备发送:', { contentToSubmit, authorToSubmit, paragraphId });

    // 先保存输入内容到变量
    const savedInput = { ...this.newContribution };
    
    // 不清空表单，等成功后再说
    // this.newContribution = { content: '', author: '' };

    this.storyService.submitContribution(
      paragraphId,
      contentToSubmit,
      authorToSubmit
    ).subscribe({
      next: (result) => {
        console.log('接话提交成功:', result);
        this.logInput('接话提交成功', { contribution: result, savedInput });
        // 成功后清空表单
        this.newContribution = { content: '', author: '' };
        this.showContributionForm = false;
        // 延迟一点重新加载，确保数据已保存
        setTimeout(() => {
          this.loadContributions(paragraphId);
        }, 200);
      },
      error: (err) => {
        console.error('提交接话失败:', err);
        this.logInput('提交接话失败', { 
          error: err.message, 
          savedInput,
          paragraphId 
        });
        // 失败时恢复输入内容
        this.newContribution = savedInput;
        alert('提交接话失败: ' + (err.error?.message || err.message));
      }
    });
  }

  acceptContribution(contribution: Contribution) {
    console.log('接受接话:', contribution);
    this.logInput('接受接话', { contributionId: contribution._id, contribution });
    
    this.storyService.acceptContribution(contribution._id).subscribe({
      next: (result) => {
        console.log('接话接受成功:', result);
        this.logInput('接话接受成功', { result });
        // 延迟重新加载
        setTimeout(() => {
          this.loadStory(this.story!._id);
          if (this.selectedParagraph) {
            this.loadContributions(this.selectedParagraph._id);
          }
        }, 200);
      },
      error: (err) => {
        console.error('接受接话失败:', err);
        this.logInput('接受接话失败', { contributionId: contribution._id, error: err.message });
        alert('接受接话失败');
      }
    });
  }

  rejectContribution(contribution: Contribution) {
    console.log('拒绝接话:', contribution);
    this.logInput('拒绝接话', { contributionId: contribution._id });
    
    this.storyService.rejectContribution(contribution._id).subscribe({
      next: (result) => {
        console.log('接话拒绝成功:', result);
        this.logInput('接话拒绝成功', { result });
        this.loadContributions(this.selectedParagraph!._id);
      },
      error: (err) => {
        console.error('拒绝接话失败:', err);
        this.logInput('拒绝接话失败', { contributionId: contribution._id, error: err.message });
        alert('拒绝接话失败');
      }
    });
  }

  // 日志记录功能
  private logInput(action: string, data: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: action,
      data: data,
      storyId: this.story?._id || null,
      selectedParagraphId: this.selectedParagraph?._id || null,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    console.log('[LOG]', logEntry);
    
    // 发送到后端记录到文件
    this.storyService.logInput(logEntry).subscribe({
      next: () => {
        // 日志记录成功
      },
      error: (err) => {
        // 静默失败，不影响主功能
        console.error('日志记录失败:', err);
      }
    });
  }
}
