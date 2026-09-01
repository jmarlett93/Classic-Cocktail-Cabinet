
import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { TasteNarrationFacade } from '../../core-services/taste-narration.facade';
import { LiquorChatbotStore } from './liquor-chatbot.store';

@Component({
  selector: 'app-liquor-chatbot',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  templateUrl: './liquor-chatbot.component.html',
  styleUrls: ['./liquor-chatbot.component.scss'],
  providers: [LiquorChatbotStore],
})
export class LiquorChatbotComponent implements OnInit, AfterViewChecked {
  readonly store = inject(LiquorChatbotStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly narration = inject(TasteNarrationFacade);

  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  ngOnInit(): void {
    // Warm WebLLM only on the legacy chat route — not on discovery startup.
    this.narration.preloadBrowserLlm();

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
