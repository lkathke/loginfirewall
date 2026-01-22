import { authenticator } from "otplib";
import QRCode from "qrcode";

const ISSUER = process.env.TOTP_ISSUER || "LoginFirewall";

authenticator.options = {
    window: 1, // allow slight clock skew
};

export function generateTotpSecret() {
    return authenticator.generateSecret();
}

export function buildOtpauthUrl(username: string, secret: string) {
    return authenticator.keyuri(username, ISSUER, secret);
}

export function verifyTotpToken(token: string, secret: string) {
    if (!token || !secret) return false;
    return authenticator.verify({ token, secret });
}

export async function buildQrDataUrl(otpauthUrl: string) {
    return QRCode.toDataURL(otpauthUrl);
}
