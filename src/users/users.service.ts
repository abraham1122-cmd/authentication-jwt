
// import { Injectable } from "@nestjs/common";
// import { User } from "./users.interface.js";

// @Injectable()
// export class UsersService {
//   private users: User[] = [];
//   private nextId = 1;

//   findByEmail(email: string): User | undefined {
//     return this.users.find(
//       (user) => user.email === email.toLowerCase(),
//     );
//   }

//   create(email: string, hashedPassword: string): User {
//     const user: User = {
//       id: this.nextId++,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//     };

//     this.users.push(user);

//     return user;
//   }
// }




import { Injectable } from "@nestjs/common";
import { User } from "./users.interface.js";

@Injectable()
export class UsersService {
  private users: User[] = [];
  private nextId = 1;

 
  findByEmail(email: string): User | undefined {
    return this.users.find(
      (user) => user.email === email.toLowerCase(),
    );
  }

  
  findById(id: number): User | undefined {
    return this.users.find((user) => user.id === id);
  }


  create(email: string, hashedPassword: string): User {
    const user: User = {
      id: this.nextId++,
      email: email.toLowerCase(),
      password: hashedPassword,
      refreshTokenHash: null,
    };

    this.users.push(user);

    return user;
  }

  
  updateRefreshTokenHash(
    userId: number,
    hashedRefreshToken: string | null,
  ): void {
    const user = this.findById(userId);

    if (user) {
      user.refreshTokenHash = hashedRefreshToken;
    }
  }
}
