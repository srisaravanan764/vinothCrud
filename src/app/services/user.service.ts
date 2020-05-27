import { Injectable } from "@angular/core";
import { User } from "./../model/user";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class UserService {
  apiUrl: string = "http://172.16.23.199:3002/api/appclients/";

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get<User[]>(this.apiUrl);
  }

  deleteUser(userId: number) {
    return this.http.delete(this.apiUrl + userId);
  }

  addUser(user: User) {
    console.log(user);
    return this.http.post(this.apiUrl + "create", user);
  }

  editUser(user: User, userId: number) {
    console.log("user", user);
    console.log("userId", userId);
    return this.http.put(this.apiUrl + userId, user);
  }
}
