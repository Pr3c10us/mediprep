import {decimal, integer, pgTable, primaryKey, uuid} from 'drizzle-orm/pg-core';
import {Users} from "./users";
import {Exams} from "./exams";
import {relations} from "drizzle-orm";

export const Carts = pgTable('carts', {
    id: uuid('id').defaultRandom(),
    totalPrice: decimal('total_price').default("0.0"),
    userID: uuid('user_id').references(() => Users.id, {onDelete: 'cascade', onUpdate: 'cascade'})
}, (t) => ({
    pk: primaryKey({columns: [t.id]}),
}))

export const cartsRelations = relations(Carts, ({one, many}) => ({
    cartItems: many(CartItems),
    user: one(Users, {
        fields: [Carts.userID],
        references: [Users.id]
    })
}));

export const CartItems = pgTable('cart_items', {
    id: uuid('id').defaultRandom(),
    months: integer('months').default(0),
    price: decimal('price').default("0.0"),
    examID: uuid('exam_id').notNull().references(() => Exams.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
    cartID: uuid('cart_id').references(() => Carts.id, {onDelete: 'cascade', onUpdate: 'cascade'})
}, (t) => ({
    pk: primaryKey({columns: [t.id]}),
}))

export const cartItemsRelations = relations(CartItems, ({one, many}) => ({
    exam: one(Exams, {
        fields: [CartItems.examID],
        references: [Exams.id]
    }),
    cart: one(Carts, {
        fields: [CartItems.cartID],
        references: [Carts.id]
    }),
}));