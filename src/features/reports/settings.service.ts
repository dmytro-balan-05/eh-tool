import { prisma } from "@/server/db";

export type ReportSettings = {
    reportOffers: boolean;
    reportRequests: boolean;
    reportLateDel: boolean;
    reportLatePickups: boolean;
};

export async function getReportSettings(userId: string): Promise<ReportSettings> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            reportOffers: true,
            reportRequests: true,
            reportLateDel: true,
            reportLatePickups: true,
        },
    });
    return (
        user ?? {
            reportOffers: true,
            reportRequests: true,
            reportLateDel: true,
            reportLatePickups: true,
        }
    );
}

export async function updateReportSettings(userId: string, data: Partial<ReportSettings>) {
    return prisma.user.update({
        where: { id: userId },
        data,
        select: {
            reportOffers: true,
            reportRequests: true,
            reportLateDel: true,
            reportLatePickups: true,
        },
    });
}