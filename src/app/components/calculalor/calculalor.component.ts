import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-calculalor',
  imports: [MatInputModule,FormsModule],
  templateUrl: './calculalor.component.html',
  styleUrl: './calculalor.component.scss',
  standalone: true
})
export class CalculalorComponent {

  displayValue: string = '0';

  appendToDisplay(value: string) {
    if(this.displayValue==='0' && value !== '.'){
        this.displayValue = value;
    }
    else{
        this.displayValue += value;
    }
  }

  clear() {
    this.displayValue = '0';
  }

  backspace() {
    this.displayValue = this.displayValue.slice(0, -1);
    if(this.displayValue===''){
        this.displayValue = '0';
    }
  }

  calculate() {
    try {
      this.displayValue = eval(this.displayValue).toString();
    } catch (error) {
      this.displayValue = 'Error';
    }
  }
}
