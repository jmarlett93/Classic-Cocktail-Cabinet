import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserPromptInfoStore } from '../stores/user-prompt-info.store';

@Component({
  selector: 'app-landing-page',
  imports: [FormsModule, MatChipsModule, MatInputModule, MatFormFieldModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {
  userPromptStore = inject(UserPromptInfoStore);
  placeholderText = signal<string>('Choose your adventure');

  inputText = signal<string>('');
  setInput(value: string) {
    this.inputText.set(value);
  }
}
