const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== Début du test Wallet ===");

  const users = await prisma.user.findMany({ take: 2 });
  if (users.length < 2) {
    console.log("⚠️ Pas assez d'utilisateurs dans la DB pour tester les transferts. (min 2 nécessaires)");
    return;
  }

  const [user1, user2] = users;
  console.log(`Utilisateurs de test : User1 (${user1.name}), User2 (${user2.name})`);

  for (const user of [user1, user2]) {
    let wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: user.id, balance: 0 }
      });
      console.log(`✅ Wallet créé pour ${user.name}`);
    } else {
      console.log(`✅ Wallet existant pour ${user.name} (Solde: ${wallet.balance})`);
    }
  }

  const wallet1 = await prisma.wallet.findUnique({ where: { userId: user1.id } });
  
  if (!wallet1) throw new Error("Wallet 1 non trouvé");

  console.log("🔄 Test de Dépôt de 5000 FCFA pour User1...");
  const updatedWallet1 = await prisma.wallet.update({
    where: { id: wallet1.id },
    data: { balance: { increment: 5000 } }
  });
  await prisma.walletTransaction.create({
    data: {
      walletId: wallet1.id,
      amount: 5000,
      type: "DEPOSIT",
      status: "COMPLETED",
      description: "Test de Dépôt Automatisé",
    }
  });
  console.log(`✅ Dépôt réussi. Nouveau solde User1 : ${updatedWallet1.balance}`);

  const wallet2 = await prisma.wallet.findUnique({ where: { userId: user2.id } });
  if (!wallet2) throw new Error("Wallet 2 non trouvé");

  console.log("🔄 Test de Transfert (1500 FCFA de User1 vers User2)...");
  
  await prisma.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { id: wallet1.id },
      data: { balance: { decrement: 1500 } }
    });
    await tx.wallet.update({
      where: { id: wallet2.id },
      data: { balance: { increment: 1500 } }
    });
    const txOut = await tx.walletTransaction.create({
      data: {
        walletId: wallet1.id,
        amount: 1500,
        type: "TRANSFER_OUT",
        status: "COMPLETED",
        description: `Transfert vers ${user2.name}`,
      }
    });
    await tx.walletTransaction.create({
      data: {
        walletId: wallet2.id,
        amount: 1500,
        type: "TRANSFER_IN",
        status: "COMPLETED",
        description: `Transfert reçu de ${user1.name}`,
        relatedTxId: txOut.id
      }
    });
  });

  const finalWallet1 = await prisma.wallet.findUnique({ where: { userId: user1.id } });
  const finalWallet2 = await prisma.wallet.findUnique({ where: { userId: user2.id } });

  console.log(`✅ Transfert réussi.`);
  console.log(`💰 Solde final User1 : ${finalWallet1?.balance}`);
  console.log(`💰 Solde final User2 : ${finalWallet2?.balance}`);

  console.log("🔄 Test de Retrait (500 FCFA pour User2)...");
  await prisma.wallet.update({
    where: { id: wallet2.id },
    data: { balance: { decrement: 500 } }
  });
  await prisma.walletTransaction.create({
    data: {
      walletId: wallet2.id,
      amount: 500,
      type: "WITHDRAWAL",
      status: "COMPLETED",
      description: "Test de Retrait Automatisé",
    }
  });

  const superFinalWallet2 = await prisma.wallet.findUnique({ where: { userId: user2.id } });
  console.log(`✅ Retrait réussi. Solde final User2 : ${superFinalWallet2?.balance}`);
  
  console.log("=== Fin du test ===");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
