const { PrismaClient } = require('@prisma/client');
console.log('PrismaClient imported');
try {
    const prisma = new PrismaClient();
    console.log('PrismaClient instantiated');
} catch (e) {
    console.error(e);
}
