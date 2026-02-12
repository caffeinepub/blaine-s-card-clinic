import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface RestorationStep {
    completed: boolean;
    description: string;
    timestamp: Time;
}
export interface FormData {
    name: string;
    email: string;
    message: string;
}
export interface Ticket {
    completed: boolean;
    formData: FormData;
    category: string;
}
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
export enum OrderStatus {
    shipped = "shipped",
    delivered = "delivered",
    processing = "processing"
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
    checkTrackingNumberStatus(trackingNumber: string): Promise<OrderStatus>;
    completeRestorationStep(trackingCode: string, index: bigint): Promise<void>;
    createOrder(trackingNumber: string): Promise<OrderStatus>;
    createTrackingState(trackingCode: string, restorationLevel: string): Promise<void>;
    examineTrackingNumbers(): Promise<Array<[string, OrderStatus]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInitializationStatus(): Promise<{
        callerRole: string;
        isInitialized: boolean;
        callerIsAdmin: boolean;
    }>;
    getTrackingNumbers(): Promise<Array<[string, OrderStatus]>>;
    getTrackingState(trackingCode: string): Promise<TrackingStateView | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isTicketCompleted(email: string): Promise<boolean>;
    listAllTickets(): Promise<Array<[string, Ticket]>>;
    markPackageArrived(trackingCode: string): Promise<void>;
    markShipped(trackingCode: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitContactForm(name: string, email: string, message: string): Promise<void>;
    updateTicketStatus(email: string, completed: boolean): Promise<void>;
    updateTrackingNumberStatus(trackingNumber: string, newStatus: OrderStatus): Promise<OrderStatus>;
}
