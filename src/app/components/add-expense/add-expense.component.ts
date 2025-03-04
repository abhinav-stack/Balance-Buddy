import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, computed, inject, model, OnInit, signal, ValueEqualityFn } from '@angular/core';
import { Form, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper'
import {MatDividerModule } from '@angular/material/divider'
import { HomeService } from '../services/home.service';
import { splitType } from '../../dummy-data/friends-dummy-data';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

export interface IExpenseType{
  value:string
  viewValue:string
}

export interface IFriendType{
  email: string
  amount:string
}

@Component({
  selector: 'app-add-expense',
  imports: [MatDialogModule,MatButtonModule,MatStepperModule,FormsModule,ReactiveFormsModule,MatFormFieldModule
    ,MatChipsModule,MatIconModule,MatAutocompleteModule,MatInputModule,MatSelectModule,MatDividerModule,MatProgressSpinnerModule
  ],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.scss',
  standalone: true
})
export class AddExpenseComponent implements OnInit {
  
  selectedValue!: string;
  friendList: IFriendType[]=[];
  expenseType:IExpenseType[]=[
    {
      value:"EQUAL",
      viewValue:"Equal"
    },
    {
      value:"MANUAL",
      viewValue:"Manual"
    }
  ]
   private snackbar = inject(MatSnackBar);
  private homeService = inject(HomeService);
  data = inject(MAT_DIALOG_DATA);
  private _formBuilder = inject(FormBuilder);
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
  
  firstFormGroup = this._formBuilder.group({
    friendList: [[Validators.required]],
    description: ['',[Validators.required]],
    amount: ['',[Validators.required]],
  })

  secondFormGroup = this._formBuilder.group({
    eventSelected: ['',[Validators.required]]
  })

  friendsAmountControls: { [key: string]: any } = {};
  isLoading: boolean=false;
  exceedingAmount: boolean=false;

  ngOnInit(): void {
    
    this.allFriend = this.data.balance.map((friend:any) => friend);
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
  
    remove(currFriend: any): void {
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
      this.friendList =  this.friendList.filter(item => 
        item.email !== currFriend.friendEmail)

      console.log(this.friendList);
      // console.log(this.friend);
      this.setExpense();
    }
  
    selected(event: MatAutocompleteSelectedEvent): void {
      console.log(event);
      console.log(this.friendList);
      this.friend.update(friend => [...friend, event.option.value]);
      console.log(this.friend());
      this.currentFriend.set('');
      // this.firstFormGroup.get('friendList')?.setValue('');
      event.option.deselect();
      this.secondFormGroup.addControl(event.option.value.friendName,this._formBuilder.control('',Validators.required));
      this.friendList.push(
        {
          email: event.option.value.friendEmail,
          amount: "0"
        }
      )
      console.log(this.friendList)
      this.setExpense();
    }

    getDetails(){
      console.log(this.friend());
      console.log(this.firstFormGroup.value);
    }

    onBack(){
      console.log(this.selectedValue);
    }

    setExpense(){
      if(this.selectedValue){
      switch(this.selectedValue){
        case 'MANUAL':{
          console.log("manuaal");
          this.setAmount("MANUAL");
          break;
        }
        case 'EQUAL':{
          console.log("equal");
          this.setAmount("EQUAL");
          break;
        }
        default:{
          break;
        }
      }
    }

    }

    setAmount(splitType:string){
      if(splitType == 'EQUAL'){
      const amount = Number(this.firstFormGroup.get('amount')?.value);
      if (amount !== null && amount !== undefined && !isNaN(amount)) {
        const dividedAmount = amount / (this.friend().length+1);
        this.friend().forEach((frnd) => {
          this.secondFormGroup.get(frnd.friendName)?.setValue(dividedAmount);
        });
      }
    }else{
      this.friend().forEach((frnd) => {
          this.secondFormGroup.get(frnd.friendName)?.reset();
        });
    }
    }

    onAmountChange(event:any,friend:any){
      console.log(friend);
      console.log(event?.target?.value);

      let totalAmount = 0;
      this.friendList.forEach((item) => {
        if(item.email == friend.friendEmail){
          item.amount = event.target.value;
        }
        totalAmount+=Number(item.amount);
      })

      if(totalAmount <= Number(this.firstFormGroup.get('amount')?.value)){
          this.exceedingAmount = false;
      }else{
        this.exceedingAmount = true;
        this.snackbar.open('total surplus amount is exceeding the expense amount');
      }
    }

    addExpense(){
      this.isLoading = true;
      const reqBody = {
        paidBy: this.data.loggedInUser.email,
        description: this.firstFormGroup.get('description')?.value,
        totalAmt: this.firstFormGroup.get('amount')?.value,
        splitType: this.selectedValue,
        contributors: this.friendList
      }
      this.homeService.addExpense(reqBody).subscribe({
        next: (res:any)=>{
          this.isLoading = false;
          this.snackbar.open("Expense Added Successfully",'close');
          console.log(res);
        },
        error: (err:any)=>{
          this.isLoading=false;
          this.snackbar.open("Some error Occured while Adding Expense",'close');
          console.log(err);
        }
      })
    }
    

}
