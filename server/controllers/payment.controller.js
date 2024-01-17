import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import { razorpay } from "../server.js";
import AppError from "../utils/error.js";
import crypto from "crypto";

export const getRazorpayApiKey = async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "Razarpay API key",
        key: process.env.RAZORPAY_KEY_ID,
    });
};

export const buySubscription = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id);

        if (!user) {
            return next(new AppError("Unauthorized, please login"));
        }

        if (!user.role === "ADMIN") {
            return next("Admin cannot purchase a subscription", 400);
        }

        const subscription = await razorpay.subscriptions.create({
            plan_id: process.env.RAZORPAY_PLAN_ID,
            customer_notify: 1,
            total_count: 12, // for 1-year subscription
        });

        user.subscription.id = subscription.id;
        user.subscription.status = subscription.status;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Subscribed Sucessfully",
            subscription_id: subscription.id,
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

export const verifySubscription = async (req, res, next) => {
    try {
        const { id } = req.user;
        const {
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription_id,
        } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return next(new AppError("Unauthorized, please login"));
        }

        const subscriptionID = user.subscription.id;

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(`${razorpay_payment_id}|${subscriptionID}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return next(new AppError("Payment not verified please try again", 500));
        }

        await Payment.create({
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription_id,
        });

        user.subscription.status = "active";
        await user.save();

        res.status(200).json({
            success: true,
            message: "Payment verified successfully!",
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

export const cancelSubscription = async (req, res, next) => {
    const { id } = req.user;
    try {
        const user = await User.findById(id);

        if (user.role === "ADMIN") {
            return next(
                new AppError("Admin does not need to cannot cancel subscription", 400)
            );
        }

        const subscriptionId = user.subscription.id;

        try {
            const subscription = await razorpay.subscriptions.cancel(subscriptionId);

            user.subscription.status = subscription.status;

            const js = await user.save();
        } catch (error) {
            return next(new AppError(error.error.description, error.statusCode));
        }

        const payment = await Payment.findOne({
            razorpay_subscription_id: subscriptionId,
        });

        const timeSinceSubscribed = Date.now() - payment.createdAt;

        // refund period which in our case is 14 days
        const refundPeriod = 14 * 24 * 60 * 60 * 1000;

        // Check if refund period has expired or not
        if (refundPeriod <= timeSinceSubscribed) {
            return next(
                new AppError(
                    "Refund period is over, so there will not be any refunds provided.",
                    400
                )
            );
        }

        await razorpay.payments.refund(payment.razorpay_payment_id, {
            speed: "optimum", // This is required
        });

        user.subscription.id = undefined;
        user.subscription.status = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Subscription canceled successfully",
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

export const allPayments = async (req, res, next) => {
    try {
        const { count, skip } = req.query;

        const allPayments = await razorpay.subscriptions.all({
            count: count ? count : 10,
            skip: skip ? skip : 0,
        });

        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        const finalMonths = {
            January: 0,
            February: 0,
            March: 0,
            April: 0,
            May: 0,
            June: 0,
            July: 0,
            August: 0,
            September: 0,
            October: 0,
            November: 0,
            December: 0,
        };

        const monthlyWisePayments = allPayments.items.map((payment) => {
            const monthsInNumbers = new Date(payment.start_at * 1000);

            return monthNames[monthsInNumbers.getMonth()];
        });

        monthlyWisePayments.map((month) => {
            Object.keys(finalMonths).forEach((objMonth) => {
                if (month === objMonth) {
                    finalMonths[month] += 1;
                }
            });
        });

        const monthlySalesRecord = [];

        Object.keys(finalMonths).forEach((monthName) => {
            monthlySalesRecord.push(finalMonths[monthName]);
        });

        res.status(200).json({
            success: true,
            message: "All payments",
            allPayments,
            finalMonths,
            monthlySalesRecord,
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};
