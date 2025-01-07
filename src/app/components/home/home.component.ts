import { Component,computed,inject, model, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { dummyData, splitType } from '../../dummy-data/friends-dummy-data';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AuthService } from '@auth0/auth0-angular'; 
import { HomeService } from '../services/home.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {MatAutocompleteModule,MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatChipsModule,MatChipInputEvent} from '@angular/material/chips';
import {ChangeDetectionStrategy} from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { AddExpenseComponent } from '../add-expense/add-expense.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet,RouterLink,MatIconModule,MatButtonModule,CommonModule,MatCardModule,
    MatFormFieldModule,MatInputModule,MatSelectModule,FormsModule,MatSidenavModule,MatSnackBarModule,
    ReactiveFormsModule,MatInputModule,FormsModule,MatAutocompleteModule,AsyncPipe,
    MatChipsModule,MatDialogModule,MatProgressSpinnerModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: true
})
export class HomeComponent implements OnInit {

  private router = inject(Router);
  protected auth = inject(AuthService);
  private homeService = inject(HomeService);
  private snackbar = inject(MatSnackBar);
  addUserFormControl = new FormControl('');
  friendData = dummyData;
  splitType = splitType;
  userDetails:any = undefined;
  user:any = undefined;
  allUsers:any = undefined;
  filteredOptions!: Observable<any>;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
   currentFriend = model('');
   friend = signal<any[]>([]);
  allFriend!: any[];
  readonly filteredFriends = computed(() => {
    console.log("ji");
    const currentFriend = this.currentFriend().toLowerCase();
    return currentFriend
      ? this.allFriend.filter(friend => friend.friendName.toLowerCase().includes(currentFriend))
      : this.allFriend.slice();
  });
  readonly announcer = inject(LiveAnnouncer);
  dialog = inject(MatDialog);
  isLoading: boolean=false;

  ngOnInit(): void {
    this.isLoading = true;
    this.auth.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.auth.user$.subscribe((user) => {
          console.log(user);
          this.user = user;
          this.handleUser(this.user);
        });
      }
    });

    // this.getAllUsers();

    this.filteredOptions = this.addUserFormControl.valueChanges.pipe(
      startWith(''),
      map(value => value ? this._filter(value) : []),
    );
  }

  _filter(value:any){
    console.log(value);
    // i have allUsers
    // i have current user friends 
    // now whatever typed i need to filter out those friends from the user list 
    // and then also filter out above filtered list from all users friends and show it in dropdown.
    
    if(typeof value === 'string'){
    let loggedInUserFriends = this.userDetails.balanceData;
    console.log(loggedInUserFriends);
    const filteredFriends = loggedInUserFriends.filter((friend: any) =>
    friend.friendName.toLowerCase().includes(value.toLowerCase())
    );
    console.log(filteredFriends);
    const filteredGlobalUsers = this.allUsers.filter((user:any) =>
    user.name.toLowerCase().includes(value.toLowerCase())
    );
    console.log(filteredGlobalUsers);
    let result = filteredGlobalUsers.filter((globalUser:any) =>
    !filteredFriends.some((friend:any) => friend.friendName === globalUser.name)
    );

    console.log(result);
    result = result.filter((user:any)=>{
      return user.email !== this.user.email;
    })


    return result;
  }
  return [];

  }


  displayFn(user: any): string {
    console.log(user);
    return user && user.name ? user.name : '';
  }

  handleUser(user: any) {
    // now first check if the user is already in the database then no need to save it in the db,
    // else save it in the db
    this.isLoading = true;
    this.homeService.getUser(user.email).subscribe({
      next: (data) => {
        this.userDetails = data.balanceSheet;
        this.allFriend = this.userDetails.balanceData.map((friend:any) => friend);
        
        this.getAllUsers();
      },
      error: (error) => {
        console.log(error);
        if(error.error.errorMessage === 'No value present'){
          // save the user in the db
          this.saveUserInDB(user);
        }
      }
    })
  }

  saveUserInDB(user: any) {
    this.homeService.saveUser(user).subscribe({
      next: (data:any) => {
        console.log(data);
        this.handleUser(this.user);
      },
      error: (error:any) => {
        console.log(error);
      }
    })
  }

  addUser(event: any){

    this.isLoading = true;
    
      console.log(event);
      let loggedInUser = this.user.email;
      // const email = this.addUserFormControl.value || '';
      const email = event.option.value.email;
      this.homeService.addAFriend(loggedInUser, email).subscribe({
        next: (data:any)=>{
          this.snackbar.open('Friend Added Successfully','close');
          this.handleUser(this.user);
          console.log(data);
        },
        error: (error:any)=>{
          this.isLoading = false;
          console.log(error);
        }
      })
  }


  getAllUsers(){
    this.homeService.getAllUsers().subscribe({
      next: (data:any)=>{
        this.isLoading = false;
        this.allUsers = data;
      },
      error: (error:any)=>{
        this.isLoading=false;
        this.snackbar.open("Some Error Occured", 'close');
      }
    })
  }

  add(event: MatChipInputEvent): void {
    console.log(event);
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.friend.update(friend => [...friend, value]);
    }

    // Clear the input value
    this.currentFriend.set('');
    // console.log(this.friend);
  }

  remove(currFriend: string): void {
    console.log(currFriend);
    this.friend.update(friend => {
      const index = friend.indexOf(currFriend);
      if (index < 0) {
        return friend;
      }

      friend.splice(index, 1);
      this.announcer.announce(`Removed ${currFriend}`);
      return [...friend];
    });
    // console.log(this.friend);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    console.log(event);
    
    this.friend.update(friend => [...friend, event.option.value]);
    console.log(this.friend());
    this.currentFriend.set('');
    event.option.deselect();
  }


  addExpense(){
    console.log(this.user);
    const dialogRef = this.dialog.open(AddExpenseComponent, {
      data:{
        loggedInUser: this.user,
        balance: this.userDetails.balanceData,
      },
      disableClose: true,
     
      height: '70vh',
      minWidth: '50vw',
    }); 
  }

}
