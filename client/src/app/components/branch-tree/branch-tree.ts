import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Paragraph } from '../../services/story';

@Component({
  selector: 'app-branch-tree',
  imports: [CommonModule],
  templateUrl: './branch-tree.html',
  styleUrl: './branch-tree.css',
})
export class BranchTreeComponent {
  @Input() paragraphs: Paragraph[] = [];

  renderTree(paragraphs: Paragraph[], level: number = 0): any[] {
    return paragraphs.map(p => ({
      ...p,
      level,
      children: p.children ? this.renderTree(p.children, level + 1) : []
    }));
  }
}
