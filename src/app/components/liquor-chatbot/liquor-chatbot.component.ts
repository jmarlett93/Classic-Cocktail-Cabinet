import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { LiquorChatbotStore } from './liquor-chatbot.store';

@Component({
  selector: 'app-liquor-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './liquor-chatbot.component.html',
  styleUrls: ['./liquor-chatbot.component.scss'],
  providers: [LiquorChatbotStore],
})
export class LiquorChatbotComponent implements OnInit, AfterViewChecked {
  readonly store = inject(LiquorChatbotStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap.get('q')?.trim();
    if (q) {
      this.store.updateUserInput(q);
      void this.router.navigate([], {
        relativeTo: this.route,
        replaceUrl: true,
        queryParams: {},
      });
    }
  }

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
}
