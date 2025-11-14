import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Paragraph } from '../../services/story';

@Component({
  selector: 'app-paragraph-item',
  imports: [CommonModule],
  templateUrl: './paragraph-item.html',
  styleUrl: './paragraph-item.css',
})
export class ParagraphItemComponent {
  @Input() paragraph!: Paragraph & { level?: number; children?: Paragraph[] };
  @Input() selectedParagraph: Paragraph | null = null;
  @Input() level: number = 0;
  @Output() selectParagraph = new EventEmitter<Paragraph>();

  onSelect(event: Event) {
    event.stopPropagation();
    this.selectParagraph.emit(this.paragraph);
  }
}
