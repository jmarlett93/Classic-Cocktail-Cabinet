import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LiquorChatbotStore } from './liquor-chatbot.store';

@Component({
  selector: 'app-liquor-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './liquor-chatbot.component.html',
  styleUrls: ['./liquor-chatbot.component.scss'],
  providers: [LiquorChatbotStore],
})
export class LiquorChatbotComponent implements AfterViewChecked {
  // Inject the store
  readonly store = inject(LiquorChatbotStore);

  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  sendMessage(): void {
    const userInput = this.store.userInput();
    if (!userInput.trim()) return;

    this.store.sendMessage(userInput);
  }

  updateInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.store.updateUserInput(input);
  }

  getConfidenceLabel(confidence?: number): string {
    return this.store.getConfidenceLabel(confidence);
  }
}
