import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import Link from "next/link";
import SessionUpdater from "@/components/SessionUpdater";
import React from "react";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id)
    throw new Error("Please provide a valid session_id (`cs_test_...`)");

  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["line_items", "payment_intent"],
  });

  const status = session.status;
  const customerEmail = session.customer_details?.email;

  if (status === "open" || status === "expired") {
    return redirect("/");
  }

  if (status === "complete") {
    return (
      <section className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <SessionUpdater />
        <div className="bg-white rounded-xl shadow-lg p-10 flex flex-col items-center max-w-xl w-full">
          <div className="mb-6">
            <svg
              className="w-16 h-16 text-green-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-green-700">
            thank you for your purchase!
          </h1>
          <p className="text-lg text-gray-700 mb-2">
            we appreciate your business! a confirmation email will be sent to{" "}
            <span className="font-semibold text-green-700">
              {customerEmail}
            </span>
            .
          </p>
          <p className="text-md text-gray-600 mb-6">
            if you have any questions, please email us at
            <a
              href="mailto:codemonkeyhacked@gmail.com"
              className="ml-1 text-blue-600 underline hover:text-blue-800"
            >
              codemonkeyhacked@gmail.com
            </a>
            .
          </p>
          <Link
            href="/"
            className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Back to Home
          </Link>
        </div>
      </section>
    );
  }
}
