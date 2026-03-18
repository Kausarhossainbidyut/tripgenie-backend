export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserRegister {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IItem {
  _id?: string;
  title: string;
  description: string;
  image: string;
  price: number;
  rating: number;
  location: string;
  category: string;
  quantity: number;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBooking {
  _id?: string;
  userId: string;
  itemId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReview {
  _id?: string;
  rating: number;
  comment: string;
  userId: string;
  itemId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWishlist {
  _id?: string;
  userId: string;
  itemId: string;
  createdAt?: Date;
  updatedAt?: Date;
}