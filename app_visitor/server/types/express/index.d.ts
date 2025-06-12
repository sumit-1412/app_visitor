// File: /server/types/express/index.d.ts

import { IUser } from "../../models/User"; // path is correct based on your structure

declare namespace Express {
  export interface Request {
    user?: IUser;
  }
}
