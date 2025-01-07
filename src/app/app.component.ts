import { Component,inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { dummyData, splitType } from './dummy-data/friends-dummy-data';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AuthService } from '@auth0/auth0-angular'; 
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,RouterLink,MatIconModule,MatButtonModule,CommonModule,MatCardModule,
    MatFormFieldModule,MatInputModule,MatSelectModule,FormsModule,MatSidenavModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
})
export class AppComponent implements OnInit {

  friendData = dummyData;
  splitType = splitType;

  private router = inject(Router);
  public auth = inject(AuthService);

  ngOnInit(): void {
    console.log("djfbvhj")
    this.auth.isAuthenticated$.subscribe({next:(isAuthenticated) => {
      if(isAuthenticated){
        this.router.navigate(['/home']);
      }
    },
    error:(error) => {
      console.log(error);
    }
  })
}

  signIN(){
    this.auth.loginWithRedirect();
  }
}
