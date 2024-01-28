interface Address {
    street: string;
    city: string;
    state: string;
    zip: string;
    isBillingAddress: boolean;
    isShippingAddress: boolean;
}
  
export interface User {
    _id: string;
    name: string;
    email: string;
    password: string;
    addresses?: Address[];
}