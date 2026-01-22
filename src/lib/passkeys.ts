import { generateAuthenticationOptions, generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import type { GenerateAuthenticationOptionsOpts, GenerateRegistrationOptionsOpts, VerifiedAuthenticationResponse, VerifiedRegistrationResponse } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";

const RP_NAME = process.env.PASSKEY_RP_NAME || "LoginFirewall";
const DEFAULT_ORIGIN = process.env.PASSKEY_ORIGIN || process.env.NEXTAUTH_URL || "http://localhost:3000";
const DEFAULT_RP_ID = process.env.PASSKEY_RP_ID || (() => {
    try {
        return new URL(DEFAULT_ORIGIN).hostname;
    } catch {
        return "localhost";
    }
})();

export async function getPasskeyRegistrationOptions(userId: string, username: string) {
    const existingCredentials = await prisma.passkey.findMany({
        where: { userId },
        select: { credentialId: true },
    });

    const opts: GenerateRegistrationOptionsOpts = {
        rpName: RP_NAME,
        rpID: DEFAULT_RP_ID,
        // simplewebauthn requires a binary userID
        userID: Buffer.from(userId),
        userName: username,
        attestationType: "none",
        authenticatorSelection: {
            residentKey: "preferred",
            userVerification: "preferred",
        },
        excludeCredentials: existingCredentials.map((cred) => ({
            id: cred.credentialId,
            type: "public-key",
        })),
    };

    const options = await generateRegistrationOptions(opts);

    await prisma.user.update({
        where: { id: userId },
        data: {
            passkeyChallenge: options.challenge,
            passkeyChallengeExpires: new Date(Date.now() + 5 * 60 * 1000),
        },
    });

    return options;
}

export async function verifyPasskeyRegistration(userId: string, responseJSON: any, nickname?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passkeyChallenge) {
        throw new Error("No pending registration challenge");
    }

    const verification: VerifiedRegistrationResponse = await verifyRegistrationResponse({
        response: responseJSON,
        expectedChallenge: user.passkeyChallenge,
        expectedOrigin: DEFAULT_ORIGIN,
        expectedRPID: DEFAULT_RP_ID,
        requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
        throw new Error("Registration verification failed");
    }

    const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
    const credentialIdB64 = isoBase64URL.fromBuffer(Buffer.from(credentialID as any));
    const credentialPublicKeyBuffer = Buffer.from(credentialPublicKey as any);

    await prisma.passkey.create({
        data: {
            userId,
            name: nickname || "Passkey",
            credentialId: credentialIdB64,
            publicKey: credentialPublicKeyBuffer,
            counter,
            deviceType: credentialDeviceType,
            backedUp: credentialBackedUp,
            transports: responseJSON.response?.transports ? JSON.stringify(responseJSON.response.transports) : null,
        },
    });

    await prisma.user.update({
        where: { id: userId },
        data: {
            passkeyChallenge: null,
            passkeyChallengeExpires: null,
        },
    });

    return verification;
}

export async function getPasskeyAuthOptions(username: string) {
    const user = await prisma.user.findUnique({
        where: { username },
        include: { passkeys: true },
    });
    if (!user || user.passkeys.length === 0) {
        throw new Error("No passkeys for this user");
    }

    const opts: GenerateAuthenticationOptionsOpts = {
        rpID: DEFAULT_RP_ID,
        userVerification: "preferred",
        allowCredentials: user.passkeys.map((cred) => ({
            id: cred.credentialId,
            type: "public-key",
            transports: cred.transports ? JSON.parse(cred.transports) : undefined,
        })),
    };

    const options = await generateAuthenticationOptions(opts);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            passkeyChallenge: options.challenge,
            passkeyChallengeExpires: new Date(Date.now() + 5 * 60 * 1000),
        },
    });

    return options;
}

export async function verifyPasskeyAuthentication(username: string, responseJSON: any) {
    const user = await prisma.user.findUnique({
        where: { username },
        include: { passkeys: true },
    });
    if (!user || !user.passkeyChallenge) {
        throw new Error("No pending authentication challenge");
    }

    const dbAuthenticator = user.passkeys.find((cred) => cred.credentialId === responseJSON.id);

    if (!dbAuthenticator) {
        throw new Error("Passkey not registered");
    }

    const verification: VerifiedAuthenticationResponse = await verifyAuthenticationResponse({
        response: responseJSON,
        expectedChallenge: user.passkeyChallenge,
        expectedOrigin: DEFAULT_ORIGIN,
        expectedRPID: DEFAULT_RP_ID,
        requireUserVerification: true,
        authenticator: {
            credentialID: isoBase64URL.toBuffer(dbAuthenticator.credentialId) as any,
            credentialPublicKey: dbAuthenticator.publicKey as any,
            counter: dbAuthenticator.counter,
            transports: dbAuthenticator.transports ? JSON.parse(dbAuthenticator.transports) : undefined,
        },
    });

    if (!verification.verified || !verification.authenticationInfo) {
        throw new Error("Authentication verification failed");
    }

    const { newCounter } = verification.authenticationInfo;

    await prisma.passkey.update({
        where: { id: dbAuthenticator.id },
        data: { counter: newCounter },
    });

    await prisma.user.update({
        where: { id: user.id },
        data: {
            passkeyChallenge: null,
            passkeyChallengeExpires: null,
        },
    });

    return { user, verification };
}

export async function listUserPasskeys(userId: string) {
    return prisma.passkey.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            createdAt: true,
            deviceType: true,
            backedUp: true,
        },
    });
}

export async function deleteUserPasskey(userId: string, passkeyId: string) {
    await prisma.passkey.delete({
        where: { id: passkeyId, userId },
    });
}
