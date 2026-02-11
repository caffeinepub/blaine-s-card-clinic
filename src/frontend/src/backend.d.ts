import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface backendInterface {
    addCategories(email: string, catArray: Array<string>): Promise<void>;
    addCategory(email: string, category: string): Promise<void>;
    isTicketCompleted(email: string): Promise<boolean>;
    submitContactForm(name: string, email: string, message: string): Promise<void>;
    updateTicketStatus(email: string, completed: boolean): Promise<void>;
}
