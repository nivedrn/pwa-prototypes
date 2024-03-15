'use server'

// export async function fetchBooks(limit: number, offset: number = 0, featured: boolean = false, category: string = "", search: string = "") {
//     try {
//         let query = "/api/products/list?";
//         if (limit) query += `limit=${limit}&`;
//         if (offset > 0) query += `offset=${offset}&`;
//         if (featured) query += `featured=${featured}&`;
//         if (category != "") query += `category=${category}&`;
//         if (search != "") query += `search=${search}&`;

//         let booksData = null;
//         fetch(query)
//             .then((res) => {
//                 if (!res.ok) {
//                     throw new Error(res.statusText); // Handle errors
//                 }
//                 return res.json(); // Parse JSON response
//             })
//             .then((res) => {
//                 if (res.data) {
//                     booksData = res.data;
//                     console.log(res);
//                 }
//                 console.log(res);
//             });
//         return { results: booksData };
//     } catch (error) {
//         console.log('error', error);
//         return { data: null, error: 'Failed to fetch book records: ' + error };
//     }
// }

// export async function fetchBookDetails(bookId: string) {
//     try {
//         let bookData = null;
//         fetch("/api/products/item?id=" + bookId)
//             .then((res) => {
//                 if (!res.ok) {
//                     throw new Error(res.statusText); // Handle errors
//                 }
//                 return res.json(); // Parse JSON response
//             })
//             .then((res) => {
//                 if (res.data) {
//                     bookData = res.data;
//                     console.log(res);
//                 }
//                 console.log(res);
//             });
//         return { results: bookData };
//     } catch (error) {
//         console.log('error', error);
//         return { data: null, error: 'Failed to fetch book records: ' + error };
//     }
// }

// export async function fetchGroupedBooks() {
//     try {
//         let groupedBooks = null;
//         fetch("/api/products/groupedlist")
//             .then((res) => {
//                 if (!res.ok) {
//                     throw new Error(res.statusText); // Handle errors
//                 }
//                 return res.json(); // Parse JSON response
//             })
//             .then((res) => {
//                 if (res.data) {
//                     groupedBooks = res.data;
//                     console.log(res);
//                 }
//                 console.log(res);
//             });
//         return { results: groupedBooks };
//     } catch (error) {
//         console.log('error', error);
//         return { data: null, error: 'Failed to fetch grouped book records: ' + error };
//     }
// }
