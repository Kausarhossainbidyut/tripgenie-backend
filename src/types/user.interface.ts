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
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}