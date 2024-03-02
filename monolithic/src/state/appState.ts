import { create } from 'zustand'

interface CartItem{
    isbn: string,
    title: string,
    qty: number,
    price: number,
    amount: number,
    calculateAmount(): number;
}

class ShoppingCartItem implements CartItem{
    isbn: string;
    title: string;
    qty: number;
    price: number;
    amount: number;

    constructor(isbn: string, title: string, qty: number, price: number ){
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
    email: string
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
