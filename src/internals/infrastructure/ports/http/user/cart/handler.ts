import {Request, Response, Router} from "express";
import ValidationMiddleware from "../../../../../../pkg/middleware/validation";
import {CartServices} from "../../../../../app/cart/cart";
import {addItemSchema, removeItemSchema} from "../../../../../../pkg/validations/cart";
import {SuccessResponse} from "../../../../../../pkg/responses/success";
import {UnAuthorizedError} from "../../../../../../pkg/errors/customError";
import {AddItem2Cart} from "../../../../../domain/carts/cart";
import {SalesServices} from "../../../../../app/sale/sale";

export class CartHandler {
    cartServices;
    router;
    salesService

    constructor(cartServices: CartServices, salesService: SalesServices) {
        this.cartServices = cartServices;
        this.salesService = salesService;
        this.router = Router();

        this.router
            .route("/")
            .get(
                this.getCartHandler
            ).post(
            ValidationMiddleware(addItemSchema, "body"),
            this.addItemFromCartHandler,
        ).delete(
            this.clearCartHandler
        );

        this.router
            .route("/item/:itemID")
            .delete(
                ValidationMiddleware(removeItemSchema, "params"),
                this.removeItemFromCartHandler
            );

        this.router
            .route("/checkout/paystack")
            .post(
                this.checkoutPaystack
            );

        this.router
            .route("/checkout/stripe")
            .post(
                this.checkoutStripe
            );
    }

    getCartHandler = async (req: Request, res: Response) => {
        const userID = req.userD?.id
        if (!userID) {
            throw new UnAuthorizedError("try login again")
        }
        const cart = await this.cartServices.queries.getCart.Handle(userID)

        new SuccessResponse(res, {cart}).send();
    };

    clearCartHandler = async (req: Request, res: Response) => {
        const userID = req.userD?.id
        if (!userID) {
            throw new UnAuthorizedError("try login again")
        }
        await this.cartServices.commands.clearCart.Handle(userID)

        new SuccessResponse(res, {message: "cart cleared"}).send();
    };

    removeItemFromCartHandler = async (req: Request, res: Response) => {
        const userID = req.userD?.id
        if (!userID) {
            throw new UnAuthorizedError("try login again")
        }

        await this.cartServices.commands.removeItemFromCart.Handle(req.params.itemID, userID)

        new SuccessResponse(res, {message: "exam removed from cart"}).send();
    };

    addItemFromCartHandler = async (req: Request, res: Response) => {
        const userID = req.userD?.id
        if (!userID) {
            throw new UnAuthorizedError("try login again")
        }

        const addParams: AddItem2Cart = {
            userID,
            cartItem: {
                months: req.body.months,
                price: 0,
                examID: req.body.examID,
            }
        }

        await this.cartServices.commands.addItem2Cart.Handle(addParams)

        new SuccessResponse(res, {message: "exam added to cart"}).send();
    };


    checkoutPaystack = async (req: Request, res: Response) => {
        const userID = req.userD?.id
        if (!userID) {
            throw new UnAuthorizedError("try login again")
        }

        const accessCode = await this.salesService.commands.checkoutPaystack.Handle({userID})

        new SuccessResponse(res, {accessCode}).send();
    };

    checkoutStripe = async (req: Request, res: Response) => {
        const userID = req.userD?.id
        if (!userID) {
            throw new UnAuthorizedError("try login again")
        }

        const clientSecret = await this.salesService.commands.checkoutStripe.Handle({userID})

        new SuccessResponse(res, {clientSecret}).send();
    };
}