import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [FormsModule, MatChipsModule, MatButtonModule, RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {
  private readonly router = inject(Router);

  readonly tasteStarters = [
    { label: 'Bright & dry', text: 'I like bright and dry' },
    { label: 'Warm & smoky', text: 'Something warm and smoky' },
    { label: 'Herbal, not sweet', text: 'Herbal flavors, nothing too sweet' },
    { label: 'Smooth & easy', text: 'Smooth and easy to sip' },
  ] as const;

  readonly placeholderText = signal('Try: citrus, dry, bitter, herbal…');
  readonly inputText = signal('');

  setInput(value: string): void {
    this.inputText.set(value);
  }

  /** Opens taste chat with optional first line (PRD handoff). */
  goToTasteChat(seed?: string): void {
    const q = (seed ?? this.inputText()).trim();
    if (q.length) {
      void this.router.navigate(['/liquor-recommendations'], { queryParams: { q } });
    } else {
      void this.router.navigate(['/liquor-recommendations']);
    }
  }

  useStarter(text: string): void {
    this.inputText.set(text);
    this.goToTasteChat(text);
  }
}
