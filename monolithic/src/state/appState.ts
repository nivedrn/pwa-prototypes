import { create } from 'zustand'

interface CartItem{
    id: string,
    isbn: string,
    title: string,
    qty: number,
    price: number,
    amount: number,
    calculateAmount(): number;
}

class ShoppingCartItem implements CartItem{
    id: string;
    isbn: string;
    title: string;
    qty: number;
    price: number;
    amount: number;

    constructor(id: string, isbn: string, title: string, qty: number, price: number ){
        this.id = id;
        this.isbn = isbn;
        this.title = title;
        this.qty = qty;
        this.price = price??.0;
        this.amount = this.calculateAmount();
    }

    calculateAmount(): number {
        return this.qty * this.price;
    }
}

interface User{
    name: string,
    email: string,
    id: string,
}

type Store = {
    isLoading: boolean
    setIsLoading: (isLoading: boolean) => void
    cartData: ShoppingCartItem[] 
    setCartData: (data: ShoppingCartItem[]) => void
    currencySymbol: string
    setCurrencySymbol: (data: string) => void
    currentUser: User | null
    setCurrentUser: (data: any) => void
}

const useAppStore = create<Store>()((set) => ({
    isLoading: false,
    setIsLoading: (isLoading) => set(() => ({ isLoading })),
    cartData: [],
    setCartData: (data) => set(() => ({ cartData: data })),
    currencySymbol: "€",
    setCurrencySymbol: (data) => set(() => ({ currencySymbol: data })),
    currentUser: null,
    setCurrentUser: (data) => set(() => ({ currentUser: data }))
}));

export { ShoppingCartItem, useAppStore }; 
