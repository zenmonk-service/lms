import { WebSocket } from "ws";
import { User } from "./user";

export class UserManager {
    private static instance: UserManager;
    private users: Map<string, User> = new Map()

    static getInstance() {
        if(!this.instance) {
            this.instance = new UserManager();
        }
        return this.instance;
    }

    addUser(ws: WebSocket) {
        const id = this.getRandomId();

        this.users.set(id, new User(id, ws));

    }

    getUser( id: string ) {
        return this.users.get(id)
    }

    private getRandomId() {
        return Math.random().toString(36).substring(2,15)+Math.random().toString(36).substring(2,15);
    }
}