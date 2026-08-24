import { Suspense } from "react";
import { OfferForm } from "@/features/offer/components/OfferForm";

export default function Home() {
    return (
        <Suspense>
            <OfferForm />
        </Suspense>
    );
}