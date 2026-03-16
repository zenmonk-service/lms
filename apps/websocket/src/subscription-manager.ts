import { createClient, RedisClientType } from "redis";
import { UserManager } from "./user-manager";

export class SubscriptionManager {
    private static  instance: SubscriptionManager;
    private subscriptions = new Map<string, string[]>();
    private client: RedisClientType;

    constructor() {
        this.client = createClient();
        this.client.connect()
    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new SubscriptionManager();

        }

        return this.instance;
    }

    subscribe(organization: string, id: string) {
        const existingOrganization = this.subscriptions.has(organization);

        if(!existingOrganization) {
            this.subscriptions.set(organization, []);
        }

       this.subscriptions.get(organization)?.push(id);

        this.client.subscribe(organization, (message)=> {
            this.subscriptions.get(organization)?.forEach(id => {
                UserManager.getInstance().getUser(id)?.emit(message)
            })
        })

        console.log('current org subs', this.subscriptions.get(organization))
    }

    public unsubscribe(organization: string, id: string) {
        if( ! this.subscriptions.get(organization)?.includes(id)) {
             return;
        }

        if( this.subscriptions.get(organization)?.length==1) {
             this.subscriptions.delete( organization);
        } else{
            this.subscriptions.set(organization, this.subscriptions.get(organization)?.filter(subscription => subscription!= id) as string[])
        }
    }
}