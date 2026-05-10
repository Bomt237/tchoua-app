import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_CONFIG = {
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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || !user?.systemRoleId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const setting = await prisma.systemSetting.findUnique({
      where: { key: "WALLET_CONFIG" }
    });

    if (!setting) {
      return NextResponse.json(DEFAULT_CONFIG);
    }

    return NextResponse.json(JSON.parse(setting.value));
  } catch (error: any) {
    console.error("Erreur GET /api/admin/settings/wallet:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || !user?.systemRoleId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await req.json();

    const updatedSetting = await prisma.systemSetting.upsert({
      where: { key: "WALLET_CONFIG" },
      update: {
        value: JSON.stringify(body),
        updatedBy: user.id
      },
      create: {
        key: "WALLET_CONFIG",
        value: JSON.stringify(body),
        description: "Configuration globale des frais et limites du Wallet",
        updatedBy: user.id
      }
    });

    return NextResponse.json({ success: true, config: JSON.parse(updatedSetting.value) });
  } catch (error: any) {
    console.error("Erreur POST /api/admin/settings/wallet:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
