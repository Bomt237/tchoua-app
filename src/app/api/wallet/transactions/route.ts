import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { type, amount, description, reference, receiverId, otpCode } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }

    if (!["DEPOSIT", "WITHDRAWAL", "TRANSFER"].includes(type)) {
      return NextResponse.json({ error: "Type de transaction invalide" }, { status: 400 });
    }

    // --- Vérification des paramètres (Frais et Plafonds) ---
    // Récupération de la configuration globale
    let config = {
      depositMobileMoneyPct: 1,
      depositMobileMoneyMin: 100,
      depositMobileMoneyMax: 5000,
      depositBankCardPct: 2.5,
      depositCashFixed: 500,
      withdrawalMobileMoneyFixed: 500,
      withdrawalBankFixed: 1000,
      depositMaxTx: 1000000,
      depositMaxDay: 2000000,
      withdrawalMaxTx: 500000,
      withdrawalMaxDay: 1000000,
      otpWithdrawalThreshold: 100000,
      otpTransferThreshold: 200000
    };

    const setting = await prisma.systemSetting.findUnique({
      where: { key: "WALLET_CONFIG" }
    });

    if (setting) {
      config = { ...config, ...JSON.parse(setting.value) };
    }

    let feeAmount = 0;
    
    // Calcul des frais
    if (type === "DEPOSIT") {
      if (reference === "MOBILE_MONEY") {
        feeAmount = amount * (config.depositMobileMoneyPct / 100);
        if (feeAmount < config.depositMobileMoneyMin) feeAmount = config.depositMobileMoneyMin;
        if (feeAmount > config.depositMobileMoneyMax) feeAmount = config.depositMobileMoneyMax;
      } else if (reference === "BANK_CARD") {
        feeAmount = amount * (config.depositBankCardPct / 100);
      } else if (reference === "BANK_TRANSFER" || reference === "CASH") {
        feeAmount = config.depositCashFixed;
      }
    } else if (type === "WITHDRAWAL") {
      if (reference === "MOBILE_MONEY") feeAmount = config.withdrawalMobileMoneyFixed;
      else if (reference === "BANK_TRANSFER") feeAmount = config.withdrawalBankFixed;
    }

    const netAmount = amount; // Montant net appliqué au solde
    const totalAmount = type === "DEPOSIT" ? amount + feeAmount : amount + feeAmount; 
    // Pour un dépôt, on doit payer netAmount + feeAmount. (Le solde est incrémenté de netAmount)
    // Pour un retrait/transfert, on prélève netAmount + feeAmount du solde.

    // --- Sécurité et Plafonds ---
    if (type === "DEPOSIT" && amount > config.depositMaxTx) {
      return NextResponse.json({ error: `Dépôt par transaction limité à ${config.depositMaxTx} FCFA` }, { status: 400 });
    }
    if (type === "WITHDRAWAL" && amount > config.withdrawalMaxTx) {
      return NextResponse.json({ error: `Retrait par transaction limité à ${config.withdrawalMaxTx} FCFA` }, { status: 400 });
    }

    // OTP / 2FA Verification
    if ((type === "WITHDRAWAL" && amount >= config.otpWithdrawalThreshold) || 
        (type === "TRANSFER" && amount >= config.otpTransferThreshold)) {
      if (!otpCode) {
        return NextResponse.json({ requiresOTP: true, message: "Un code OTP est requis pour cette opération" });
      }
      if (otpCode !== "123456") {
        return NextResponse.json({ error: "Code OTP invalide" }, { status: 400 });
      }
    }

    // Récupérer le wallet de l'utilisateur
    const senderWallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!senderWallet) {
      return NextResponse.json({ error: "Portefeuille introuvable" }, { status: 404 });
    }

    if (senderWallet.status !== "ACTIVE") {
      return NextResponse.json({ error: "Portefeuille suspendu" }, { status: 403 });
    }

    // Traitement via transaction Prisma
    const result = await prisma.$transaction(async (tx) => {
      if (type === "DEPOSIT") {
        // Ajouter au solde
        const updatedWallet = await tx.wallet.update({
          where: { id: senderWallet.id },
          data: { balance: { increment: netAmount } },
        });

        const transaction = await tx.walletTransaction.create({
          data: {
            walletId: senderWallet.id,
            amount,
            feeAmount,
            netAmount,
            type: "DEPOSIT",
            status: "COMPLETED",
            description: description || "Rechargement du compte",
            reference,
          },
        });

        return { wallet: updatedWallet, transaction };
      } 
      
      else if (type === "WITHDRAWAL") {
        if (senderWallet.balance < totalAmount) {
          throw new Error("Solde insuffisant pour couvrir le montant et les frais");
        }

        const updatedWallet = await tx.wallet.update({
          where: { id: senderWallet.id },
          data: { balance: { decrement: totalAmount } }, // Déduction du montant + frais
        });

        const transaction = await tx.walletTransaction.create({
          data: {
            walletId: senderWallet.id,
            amount,
            feeAmount,
            netAmount,
            type: "WITHDRAWAL",
            status: "COMPLETED",
            description: description || "Retrait de fonds",
            reference,
          },
        });

        return { wallet: updatedWallet, transaction };
      }

      else if (type === "TRANSFER") {
        if (!receiverId) throw new Error("Bénéficiaire manquant");
        if (receiverId === userId) throw new Error("Vous ne pouvez pas vous transférer de l'argent à vous-même");
        
        // Aucun frais sur les transferts P2P selon spec
        if (senderWallet.balance < netAmount) {
          throw new Error("Solde insuffisant");
        }

        const receiverWallet = await tx.wallet.findUnique({ where: { userId: receiverId } });

        if (!receiverWallet || receiverWallet.status !== "ACTIVE") {
          throw new Error("Le portefeuille du bénéficiaire est introuvable ou suspendu");
        }

        const updatedSenderWallet = await tx.wallet.update({
          where: { id: senderWallet.id },
          data: { balance: { decrement: netAmount } },
        });

        await tx.wallet.update({
          where: { id: receiverWallet.id },
          data: { balance: { increment: netAmount } },
        });

        const txOut = await tx.walletTransaction.create({
          data: {
            walletId: senderWallet.id,
            amount,
            feeAmount: 0,
            netAmount,
            type: "TRANSFER_OUT",
            status: "COMPLETED",
            description: description || "Transfert envoyé",
          },
        });

        const txIn = await tx.walletTransaction.create({
          data: {
            walletId: receiverWallet.id,
            amount,
            feeAmount: 0,
            netAmount,
            type: "TRANSFER_IN",
            status: "COMPLETED",
            description: description || "Transfert reçu",
            relatedTxId: txOut.id,
          },
        });

        await tx.walletTransaction.update({
          where: { id: txOut.id },
          data: { relatedTxId: txIn.id },
        });

        return { wallet: updatedSenderWallet, transaction: txOut };
      }
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Erreur POST /api/wallet/transactions:", error);
    if (error.message === "Solde insuffisant pour couvrir le montant et les frais" || error.message.includes("insuffisant") || error.message.includes("introuvable") || error.message.includes("suspendu")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
