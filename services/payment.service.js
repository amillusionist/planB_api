const fetch = require("node-fetch");
const { v4: uuidv4 } = require("uuid");
const cryptojs = require("crypto-js");
const paymentConfig = require('../config/payment'); // Your custom config file

class PaymentService {
    constructor() {
        this.baseURL = paymentConfig.sandboxURL;
    }

    generateHash(paymentDetails) {
        // Format the data with all required fields, ensuring order and formatting
        const combinedData = [
            `Uid=${paymentDetails.Uid}`,
            `KeyId=${paymentDetails.KeyId}`,
            `Amount=${paymentDetails.Amount}`,
            `FirstName=${paymentDetails.FirstName}`,
            `LastName=${paymentDetails.LastName}`,
            `Phone=${paymentDetails.Phone}`,
            `Email=${paymentDetails.Email}`,
            paymentDetails.Street ? `Street=${paymentDetails.Street}` : '',
            paymentDetails.City ? `City=${paymentDetails.City}` : '',
            paymentDetails.State ? `State=${paymentDetails.State}` : '',
            paymentDetails.Country ? `Country=${paymentDetails.Country}` : '',
            paymentDetails.PostalCode ? `PostalCode=${paymentDetails.PostalCode}` : '',
            `TransactionId=${paymentDetails.TransactionId}`,
            paymentDetails.Custom1 ? `Custom1=${paymentDetails.Custom1}` : ''
        ].filter(Boolean).join(',');

        console.log("Combined String for Hash:", combinedData); // Check the exact string format

        // Generate the HMAC SHA256 hash
        const hmac = cryptojs.HmacSHA256(combinedData, paymentConfig.secretKey);
        const hashInBase64 = cryptojs.enc.Base64.stringify(hmac);

        console.log("Generated Hash (Base64):", hashInBase64); // Log the hash to compare

        return hashInBase64;
    }

    async createPayment(orderData) {
        const paymentDetails = {
            Uid: uuidv4(),
            KeyId: paymentConfig.keyId,
            Amount: Number(orderData.amount).toFixed(2),  // Amount with two decimal places
            FirstName: orderData.firstName || "",
            LastName: orderData.lastName || "",
            Phone: orderData.phone || "",
            Email: orderData.email || "",
            Street: orderData.street || "",
            City: orderData.city || "",
            State: orderData.state || "",
            Country: orderData.country || "",
            PostalCode: orderData.postalCode || "",
            TransactionId: orderData.orderId || uuidv4(),
            Custom1: orderData.custom1 || ""
        };

        // Generate the authorization hash
        const hash = this.generateHash(paymentDetails);

        try {
            const url = `${this.baseURL}/api/v1/payments`;
            console.log("Making request to:", url);
            console.log("Request Body:", JSON.stringify(paymentDetails, null, 2));
            console.log("Authorization Header (Hash):", hash);

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: hash,  // Use the generated hash in the Authorization header
                    "Content-Type": "application/json",
                    "X-Client-Id": paymentConfig.clientId
                },
                body: JSON.stringify(paymentDetails)
            });

            const json = await response.json();
            console.log("API Response:", JSON.stringify(json, null, 2));

            if (!response.ok || json.hasValidationError) {
                throw new Error(json.errorMessage || "Unknown API error");
            }

            return json.resultObj;
        } catch (error) {
            console.error("Payment Error:", error);
            throw new Error(`Payment creation failed: ${error.message}`);
        }
    }

    async verifyPayment(paymentId) {
        try {
            const url = `${this.baseURL}/api/v1/payments/${paymentId}`;
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${paymentConfig.secretKey}`  // Use secret key as Bearer token
                }
            });

            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.message || "Payment verification failed");
            }

            return json.resultObj;
        } catch (error) {
            throw new Error(`Payment verification failed: ${error.message}`);
        }
    }
}

module.exports = new PaymentService();
