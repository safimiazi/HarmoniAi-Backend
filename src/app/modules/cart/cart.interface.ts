import { Types } from "mongoose";

export interface ICart {
  userId: Types.ObjectId;
  productId: string;
  title: string;
  description?: string;
  type: "image" | "video";
  file: string;
  price: number;
  quantity: number;
  isDeleted: boolean;
}
