import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, MatIconModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'Classic Cocktail Cabinet';
  currentYear = new Date().getFullYear();
}
