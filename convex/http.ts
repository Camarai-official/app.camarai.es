import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import Stripe from "stripe";

const http = httpRouter();

http.route({
  path: "/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-04-22.dahlia"
    });

    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("No signature provided", { status: 400 });
    }

    const payload = await request.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed.", err.message);
      return new Response("Webhook signature verification failed.", { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const orderId = session.metadata?.orderId;
      const orderItemIdsStr = session.metadata?.orderItemIds;
      const orderItemIds = orderItemIdsStr ? JSON.parse(orderItemIdsStr) : undefined;
      const amountPaid = session.amount_total ? session.amount_total / 100 : undefined;

      if (orderId) {
        try {
          console.log(`Pago completado para el pedido: ${orderId}`);
          await ctx.runMutation(internal.stripe.fulfillStripePayment, {
            orderId: orderId as Id<"orders">,
            orderItemIds: orderItemIds,
            amount: amountPaid
          });
        } catch (error) {
          console.error("Error al actualizar la orden:", error);
        }
      }
    }

    return new Response(null, { status: 200 });
  }),
});

http.route({
  path: "/stripe/connection_token",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-04-22.dahlia"
    });

    try {
      const connectionToken = await stripe.terminal.connectionTokens.create();
      return new Response(JSON.stringify({ secret: connectionToken.secret }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error("Error creating connection token:", error);
      return new Response(error.message, { status: 500 });
    }
  }),
});

http.route({
  path: "/stripe/payment_intent",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-04-22.dahlia"
    });

    try {
      const payload = await request.json();
      const amount = payload.amount;

      const intent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "eur",
        payment_method_types: ["card_present"],
        capture_method: "automatic",
      });

      return new Response(JSON.stringify({ client_secret: intent.client_secret }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      return new Response(error.message, { status: 500 });
    }
  }),
});

export default http;
