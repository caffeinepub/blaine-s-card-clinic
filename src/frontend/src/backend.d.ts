import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RestorationStep {
    completed: boolean;
    description: string;
    timestamp: Time;
}
export type Time = bigint;
export interface UserProfile {
    name: string;
    email: string;
}
export interface TrackingStateView {
    shipped: boolean;
    trackingCode: string;
    arrived: boolean;
    restorationLevel: string;
    steps: Array<RestorationStep>;
    shippingTimestamp?: Time;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCategories(email: string, catArray: Array<string>): Promise<void>;
    addCategory(email: string, category: string): Promise<void>;
    addRestorationStep(trackingCode: string, description: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeRestorationStep(trackingCode: string, index: bigint): Promise<void>;
    createTrackingState(trackingCode: string, restorationLevel: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTrackingState(trackingCode: string): Promise<TrackingStateView | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isTicketCompleted(email: string): Promise<boolean>;
    markPackageArrived(trackingCode: string): Promise<void>;
    markShipped(trackingCode: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitContactForm(name: string, email: string, message: string): Promise<void>;
    updateTicketStatus(email: string, completed: boolean): Promise<void>;
}
