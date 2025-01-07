import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PERSON_API_URL } from '../../constants/api-context-path-signatures';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  private http= inject(HttpClient);

  getUser(email:string):Observable<any> {
    return this.http.get<any>(`${PERSON_API_URL}/get-user/${email}`);
  }

  saveUser(user: any):Observable<any> {
    const userReqBody = {
      name: user.name,
      email: user.email,
      balanceSheet:{
      totalAmountPaid: 0,
      oweAmount: 0,
      dueAmount: 0,
      balanceData: []
      }
    }
    return this.http.post<any>(`${PERSON_API_URL}/add`, userReqBody);
  }

  addAFriend(loggedInUser:string,email: string):Observable<any> {
    return this.http.post<any>(`${PERSON_API_URL}/add-friend/${loggedInUser}/${email}`,{});
  }

  getAllUsers():Observable<any>{
    return this.http.get<any>(`${PERSON_API_URL}/get-all-users`);
  }

  addExpense(reqBody:any):Observable<any>{
    return this.http.post<any>(`${PERSON_API_URL}/add-expense`,reqBody);
  }
}
