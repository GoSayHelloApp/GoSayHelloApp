export interface EventType {
    id: number;
    type: string;
    is_show: number;
}

export interface Country {
    id: number;
    name: string;
    is_show: number;
}

export interface StateName {
    id: number;
    state_name: string;
}

export interface BusinessType {
    id: number;
    name: string;
    is_show: number;
}

export interface ApplicationInformation {
    version_code: number;
    version: string;
    store_url: string;
    maintenance_flag: number;
    type: string;
    app_id: string;
}

export interface PrivacyPolicy {
    id: number;
    privacy_type: string;
    audience: string;
    description: string;
}

export interface SubscriptionPackage {
    id: number;
    title: string;
    credits_per_month: number;
    price_per_month: number;
    price_per_year: number;
    is_active: number;
}

export interface AppConfigResponse {
    success: boolean;
    event_types: EventType[];
    countries: Country[];
    stateNames: StateName[];
    business_types: BusinessType[];
    applicationInformation: ApplicationInformation[];
    privacyPolicy: PrivacyPolicy[];
    subscription_packages: SubscriptionPackage[];
}